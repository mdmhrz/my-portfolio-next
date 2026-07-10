import { google, gmail_v1 } from "googleapis";
import { randomUUID } from "crypto";
import MailComposer from "nodemailer/lib/mail-composer";
import { encrypt, decrypt } from "./crypto";
import { gmailAccountRepo } from "../queries";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

export function isGmailOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REDIRECT_URI
  );
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );
}

export function buildOAuthUrl(state: string) {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
}

async function getSingleGmailAccount() {
  const account = await gmailAccountRepo.findFirst();
  if (!account) {
    throw new Error("Gmail is not connected. Visit /api/admin/gmail/connect first.");
  }
  return account;
}

export async function isGmailConnected() {
  const account = await gmailAccountRepo.findFirst();
  return Boolean(account);
}

// Shared by every Google API client (Gmail, Calendar, …) for the single
// connected admin account — one OAuth2 client, auto-persisting rotated
// access tokens back to the DB regardless of which API ends up using it.
async function getAuthorizedClient() {
  const account = await getSingleGmailAccount();
  const client = getOAuth2Client();

  client.setCredentials({
    access_token: account.accessToken,
    refresh_token: decrypt(account.refreshTokenEnc),
    expiry_date: account.accessTokenExpiresAt.getTime(),
  });

  client.on("tokens", (tokens) => {
    const data: { accessToken?: string; accessTokenExpiresAt?: Date; refreshTokenEnc?: string } = {};
    if (tokens.access_token) data.accessToken = tokens.access_token;
    if (tokens.expiry_date) data.accessTokenExpiresAt = new Date(tokens.expiry_date);
    if (tokens.refresh_token) data.refreshTokenEnc = encrypt(tokens.refresh_token);
    if (Object.keys(data).length > 0) {
      gmailAccountRepo.update(account.id, data).catch((err) => {
        console.error("Failed to persist rotated Gmail tokens:", err);
      });
    }
  });

  return { client, account };
}

// Returns an authenticated Gmail API client for the single connected admin account.
export async function getGmailClient() {
  const { client, account } = await getAuthorizedClient();
  return { gmail: google.gmail({ version: "v1", auth: client }), account };
}

// Returns an authenticated Google Calendar client for the same connected
// account — requires the `calendar.events` scope, added alongside the two
// Gmail scopes; an account connected before this scope existed must
// reconnect (re-consent) once via /api/admin/gmail/connect before this works.
export async function getCalendarClient() {
  const { client, account } = await getAuthorizedClient();
  return { calendar: google.calendar({ version: "v3", auth: client }), account };
}

interface SendGmailMimeParams {
  fromEmail: string;
  to: string;
  toName?: string;
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  attachments?: { filename: string; content: Buffer; contentType: string }[];
  inReplyTo?: string;
  gmailThreadId?: string;
}

// Builds an RFC822 MIME message and sends it through the Gmail API as the
// connected admin account. Used both for admin-composed replies and for the
// automatic "new contact form message" notification email.
export async function sendGmailMime(
  gmail: gmail_v1.Gmail,
  params: SendGmailMimeParams
): Promise<{ id: string; threadId: string; rfcMessageId: string }> {
  const domain = params.fromEmail.split("@")[1] || "localhost";
  const rfcMessageId = `<${randomUUID()}@${domain}>`;

  const composer = new MailComposer({
    from: params.fromEmail,
    to: params.toName ? `${params.toName} <${params.to}>` : params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.bodyHtml,
    attachments: params.attachments ?? [],
    messageId: rfcMessageId,
    ...(params.inReplyTo ? { inReplyTo: params.inReplyTo, references: params.inReplyTo } : {}),
  });

  const rawMessage: Buffer = await new Promise((resolve, reject) => {
    composer.compile().build((err: Error | null, message: Buffer) => {
      if (err) return reject(err);
      resolve(message);
    });
  });

  const sendRes = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage.toString("base64url"),
      ...(params.gmailThreadId ? { threadId: params.gmailThreadId } : {}),
    },
  });

  return {
    id: sendRes.data.id!,
    threadId: sendRes.data.threadId!,
    rfcMessageId,
  };
}

// Gmail watch() expires after ~7 days and must be periodically renewed.
export async function startWatch(gmail: ReturnType<typeof google.gmail>, accountId: string) {
  const topicName = process.env.GMAIL_PUBSUB_TOPIC;
  if (!topicName) {
    throw new Error("GMAIL_PUBSUB_TOPIC is not set");
  }

  const res = await gmail.users.watch({
    userId: "me",
    requestBody: { topicName, labelIds: ["INBOX"] },
  });

  await gmailAccountRepo.update(accountId, {
    historyId: res.data.historyId ?? undefined,
    watchExpiration: res.data.expiration ? new Date(Number(res.data.expiration)) : null,
  });

  return res.data;
}
