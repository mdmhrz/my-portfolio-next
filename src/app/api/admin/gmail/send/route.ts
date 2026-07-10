import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { getGmailClient, sendGmailMime } from "@/modules/gmail/service/client";
import { threadsRepo, emailMessagesRepo } from "@/modules/gmail/queries";

export const runtime = "nodejs";

interface SendAttachment {
  url: string;
  fileName: string;
  mimeType: string;
}

interface SendBody {
  threadId?: string;
  to: string;
  toName?: string;
  subject: string;
  bodyHtml: string;
  attachments?: SendAttachment[];
}

function toSnippet(html: string, max = 160) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body: SendBody = await request.json();
  if (!body.to || !body.subject || !body.bodyHtml) {
    return NextResponse.json({ success: false, error: "to, subject, and bodyHtml are required" }, { status: 400 });
  }

  try {
    const { gmail, account } = await getGmailClient();

    let gmailThreadId: string | undefined;
    let inReplyTo: string | undefined;
    let thread = body.threadId ? await threadsRepo.getWithLastEmail(body.threadId) : null;

    if (thread) {
      gmailThreadId = thread.gmailThreadId ?? undefined;
      inReplyTo = thread.emails[0]?.rfcMessageId ?? undefined;
    }

    const attachments = await Promise.all(
      (body.attachments ?? []).map(async (att) => {
        const res = await fetch(att.url);
        if (!res.ok) throw new Error(`Failed to fetch attachment: ${att.fileName}`);
        const content = Buffer.from(await res.arrayBuffer());
        return { filename: att.fileName, content, contentType: att.mimeType };
      })
    );

    const sent = await sendGmailMime(gmail, {
      fromEmail: account.email,
      to: body.to,
      toName: body.toName,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      attachments,
      inReplyTo,
      gmailThreadId,
    });

    if (!thread) {
      thread = await threadsRepo.create({
        contactEmail: body.to,
        contactName: body.toName,
        subject: body.subject,
        gmailThreadId: sent.threadId,
        unread: false,
        lastMessageAt: new Date(),
      });
    } else {
      await threadsRepo.update(thread.id, {
        gmailThreadId: thread.gmailThreadId ?? sent.threadId,
        lastMessageAt: new Date(),
      });
    }

    const emailMessage = await emailMessagesRepo.createWithAttachments({
      threadId: thread.id,
      gmailMessageId: sent.id,
      rfcMessageId: sent.rfcMessageId,
      direction: "outbound",
      fromEmail: account.email,
      toEmail: body.to,
      subject: body.subject,
      bodyHtml: body.bodyHtml,
      snippet: toSnippet(body.bodyHtml),
      sentAt: new Date(),
      attachments: {
        create: (body.attachments ?? []).map((att) => ({
          fileName: att.fileName,
          mimeType: att.mimeType,
          url: att.url,
        })),
      },
    });

    return NextResponse.json({ success: true, data: { threadId: thread.id, email: emailMessage } });
  } catch (error) {
    console.error("Gmail send error:", error);
    const message = error instanceof Error ? error.message : "Failed to send email";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
