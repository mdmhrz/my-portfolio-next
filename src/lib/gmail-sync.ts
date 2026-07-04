import type { gmail_v1 } from "googleapis";
import { prisma } from "@/lib/prisma";
import { getGmailClient } from "@/lib/gmail";
import { generateImageName, getCloudinaryFolder } from "@/lib/image-naming";
import { uploadBufferToCloudinary } from "@/lib/cloudinary";

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? undefined;
}

// Pulls the bare address out of a "Name <email>" or plain "email" header value.
function extractEmailAddress(headerValue: string) {
  return (headerValue.match(/<([^>]+)>/)?.[1] ?? headerValue).trim().toLowerCase();
}

function isNotFoundError(error: unknown) {
  const gaxiosError = error as { code?: number | string; response?: { status?: number } };
  return Number(gaxiosError.response?.status ?? gaxiosError.code) === 404;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extractBodyAndAttachments(payload: gmail_v1.Schema$MessagePart | undefined) {
  let html = "";
  let text = "";
  const attachments: gmail_v1.Schema$MessagePart[] = [];

  function walk(part: gmail_v1.Schema$MessagePart | undefined) {
    if (!part) return;
    if (part.filename && part.body?.attachmentId) {
      attachments.push(part);
      return;
    }
    if (part.mimeType === "text/html" && part.body?.data) {
      html += Buffer.from(part.body.data, "base64url").toString("utf8");
    } else if (part.mimeType === "text/plain" && part.body?.data) {
      text += Buffer.from(part.body.data, "base64url").toString("utf8");
    }
    for (const sub of part.parts ?? []) walk(sub);
  }
  walk(payload);

  return { html: html || (text ? `<pre>${escapeHtml(text)}</pre>` : ""), attachments };
}

// Pulls new inbound Gmail messages since the last processed historyId and
// files them under existing Threads only — messages belonging to threads the
// app doesn't already know about are ignored (keeps this scoped to
// portfolio-originated conversations, never the admin's whole personal inbox).
export async function syncGmailHistory(): Promise<{ processed: number }> {
  const { gmail, account } = await getGmailClient();

  if (!account.historyId) {
    const profile = await gmail.users.getProfile({ userId: "me" });
    await prisma.gmailAccount.update({
      where: { id: account.id },
      data: { historyId: profile.data.historyId ?? undefined },
    });
    return { processed: 0 };
  }

  let historyRes;
  try {
    historyRes = await gmail.users.history.list({
      userId: "me",
      startHistoryId: account.historyId,
      historyTypes: ["messageAdded"],
    });
  } catch (error: unknown) {
    if (isNotFoundError(error)) {
      const profile = await gmail.users.getProfile({ userId: "me" });
      await prisma.gmailAccount.update({
        where: { id: account.id },
        data: { historyId: profile.data.historyId ?? undefined },
      });
      return { processed: 0 };
    }
    throw error;
  }

  const addedMessageIds = new Set<string>();
  for (const h of historyRes.data.history ?? []) {
    for (const m of h.messagesAdded ?? []) {
      if (m.message?.id) addedMessageIds.add(m.message.id);
    }
  }

  let processed = 0;

  for (const messageId of addedMessageIds) {
    const existing = await prisma.emailMessage.findUnique({ where: { gmailMessageId: messageId } });
    if (existing) continue;

    let msg: gmail_v1.Schema$Message;
    try {
      const full = await gmail.users.messages.get({ userId: "me", id: messageId, format: "full" });
      msg = full.data;
    } catch (error) {
      // Message was deleted from Gmail between the history event and this fetch — skip it.
      if (isNotFoundError(error)) continue;
      throw error;
    }
    if (!msg.threadId) continue;

    const thread = await prisma.thread.findUnique({ where: { gmailThreadId: msg.threadId } });
    if (!thread) continue;

    const headers = msg.payload?.headers ?? undefined;
    const fromEmail = getHeader(headers, "From") ?? thread.contactEmail;
    const toEmail = getHeader(headers, "To") ?? "";
    const subject = getHeader(headers, "Subject") ?? thread.subject ?? undefined;
    const rfcMessageId = getHeader(headers, "Message-ID");

    // Skip the self-addressed "new contact form message" notification email
    // (sent admin -> admin) — it's a copy of the Message already shown in the
    // thread, not a genuine reply, and would otherwise be ingested as one.
    if (extractEmailAddress(fromEmail) === account.email.toLowerCase()) continue;

    const { html, attachments: attachmentParts } = extractBodyAndAttachments(msg.payload);

    const emailMessage = await prisma.emailMessage.create({
      data: {
        threadId: thread.id,
        gmailMessageId: messageId,
        rfcMessageId,
        direction: "inbound",
        fromEmail,
        toEmail,
        subject,
        bodyHtml: html || msg.snippet || "",
        snippet: msg.snippet ?? undefined,
        sentAt: msg.internalDate ? new Date(Number(msg.internalDate)) : new Date(),
      },
    });

    for (const part of attachmentParts) {
      if (!part.body?.attachmentId) continue;
      const attRes = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId,
        id: part.body.attachmentId,
      });
      if (!attRes.data.data) continue;

      const buffer = Buffer.from(attRes.data.data, "base64url");
      const fileName = part.filename || "attachment";
      const uploaded = await uploadBufferToCloudinary(
        buffer,
        getCloudinaryFolder("email-attachments"),
        generateImageName("attachment", fileName)
      );

      await prisma.attachment.create({
        data: {
          emailMessageId: emailMessage.id,
          fileName,
          mimeType: part.mimeType || "application/octet-stream",
          url: uploaded.secure_url,
          size: buffer.length,
        },
      });
    }

    await prisma.thread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date(), unread: true },
    });

    processed++;
  }

  await prisma.gmailAccount.update({
    where: { id: account.id },
    data: { historyId: historyRes.data.historyId ?? account.historyId },
  });

  return { processed };
}
