import { NextResponse } from "next/server";
import { isGmailConnected, getGmailClient, sendGmailMime } from "@/modules/gmail/service/client";
import { threadsRepo } from "@/modules/gmail/queries";
import { messagesRepo } from "@/modules/portfolio/contact/queries";
import * as z from "zod";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional(),
  type: z.enum(["Freelance project", "Full-time role", "Collaboration", "Other"]),
  message: z.string().min(1, "Message is required"),
});

function notificationHtml(validated: z.infer<typeof contactSchema>) {
  return `
    <p><strong>${validated.name}</strong> (${validated.email}) sent a message via your portfolio contact form.</p>
    <p><strong>Type:</strong> ${validated.type}</p>
    ${validated.subject ? `<p><strong>Subject:</strong> ${validated.subject}</p>` : ""}
    <p><strong>Message:</strong></p>
    <p>${validated.message.replace(/\n/g, "<br>")}</p>
    <p style="color:#888;font-size:12px;">Reply to this email to respond directly to ${validated.name} — it'll also show up in your dashboard inbox.</p>
  `;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const message = await messagesRepo.createWithThread(
      {
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        type: validated.type,
        message: validated.message,
      },
      {
        contactEmail: validated.email,
        contactName: validated.name,
        subject: validated.subject,
      }
    );

    // Best-effort: forward the message into the admin's real Gmail inbox so it
    // triggers a normal notification and can be replied to from either Gmail
    // or the dashboard. Never let a Gmail failure block the contact form.
    if (message.thread && (await isGmailConnected())) {
      try {
        const { gmail, account } = await getGmailClient();
        const sent = await sendGmailMime(gmail, {
          fromEmail: account.email,
          to: account.email,
          replyTo: validated.email,
          subject: `New portfolio message${validated.subject ? `: ${validated.subject}` : ""}`,
          bodyHtml: notificationHtml(validated),
        });
        await threadsRepo.update(message.thread.id, { gmailThreadId: sent.threadId });
      } catch (error) {
        console.error("Failed to forward contact message to Gmail (message was still saved):", error);
      }
    }

    return NextResponse.json({ success: true, message: "Message saved", data: message });
  } catch (error) {
    console.error("Error in contact form submission API:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
