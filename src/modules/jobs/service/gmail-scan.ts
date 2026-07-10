import type { gmail_v1 } from "googleapis";
import { getGmailClient } from "@/modules/gmail/service/client";
import { jobsRepo, jobEventsRepo, jobSettingsRepo, unmatchedEmailsRepo, logGmailMatch } from "../queries";

function getHeader(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? undefined;
}

function extractEmailAddress(headerValue: string) {
  return (headerValue.match(/<([^>]+)>/)?.[1] ?? headerValue).trim().toLowerCase();
}

function domainOf(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function alnumOnly(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Ordered so a stronger, later-stage signal wins over "applied" when a
// subject/snippet happens to contain both (e.g. "Your assessment after
// applying to Acme").
const STATUS_KEYWORDS: [string, RegExp][] = [
  ["offer", /\boffer\b|congratulations|pleased to inform/i],
  ["rejected", /unfortunately|not moving forward|other candidates|not selected|regret to inform|will not be proceeding/i],
  ["interview", /interview|schedule a call|meet with|chat with you/i],
  ["assessment", /assessment|coding challenge|hackerrank|take-home|technical test|online test/i],
];

function guessStatus(text: string): string {
  for (const [status, pattern] of STATUS_KEYWORDS) {
    if (pattern.test(text)) return status;
  }
  return "applied";
}

/**
 * Scans the configured Gmail label for job-related emails and either:
 *  - logs a JobStatusEvent against an already-linked/matched JobApplication, or
 *  - files the email as an UnmatchedJobEmail for manual linking.
 *
 * Deliberately separate from `syncGmailHistory` (gmail module), which only
 * ever files messages under Threads the app already knows about — job emails
 * come from arbitrary companies with no existing Thread, so they can't share
 * that code path without breaking its "never the whole personal inbox"
 * guarantee. Scoping to a single Gmail label keeps this scan just as narrow.
 */
export async function scanJobGmail(): Promise<{ matched: number; unmatched: number; scanned: number }> {
  const { gmail } = await getGmailClient();

  const settings = await jobSettingsRepo.getRaw();
  const label = settings?.gmailLabel || "Jobs";

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: `label:${label}`,
    maxResults: 50,
  });
  const messages = listRes.data.messages ?? [];

  if (messages.length === 0) {
    return { matched: 0, unmatched: 0, scanned: 0 };
  }

  const jobs = await jobsRepo.listAll();

  let matched = 0;
  let unmatched = 0;

  for (const m of messages) {
    if (!m.id) continue;

    const [existingEvent, existingUnmatched] = await Promise.all([
      jobEventsRepo.findByGmailMessageId(m.id),
      unmatchedEmailsRepo.findByGmailMessageId(m.id),
    ]);
    if (existingEvent || existingUnmatched) continue;

    const msg = await gmail.users.messages.get({
      userId: "me",
      id: m.id,
      format: "metadata",
      metadataHeaders: ["From", "Subject", "Date"],
    });

    const fromHeader = getHeader(msg.data.payload?.headers, "From") ?? "";
    const subject = getHeader(msg.data.payload?.headers, "Subject") ?? "";
    const dateHeader = getHeader(msg.data.payload?.headers, "Date");
    const fromEmail = extractEmailAddress(fromHeader);
    const fromName = fromHeader.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || undefined;
    const snippet = msg.data.snippet ?? "";
    const suggestedStatus = guessStatus(`${subject} ${snippet}`);
    const domain = domainOf(fromEmail);
    const domainLabel = alnumOnly(domain.split(".")[0] ?? "");

    const job =
      jobs.find((j) => j.gmailThreadId && j.gmailThreadId === msg.data.threadId) ??
      jobs.find((j) => {
        const company = alnumOnly(j.company);
        return company.length > 2 && domainLabel.length > 2 && (domainLabel.includes(company) || company.includes(domainLabel));
      });

    if (job) {
      await logGmailMatch(
        job.id,
        suggestedStatus,
        m.id,
        subject || null,
        job.gmailThreadId ?? msg.data.threadId ?? undefined
      );
      matched++;
    } else {
      await unmatchedEmailsRepo.create({
        gmailMessageId: m.id,
        gmailThreadId: msg.data.threadId ?? null,
        fromEmail,
        fromName: fromName ?? null,
        subject: subject || null,
        snippet: snippet || null,
        suggestedStatus,
        receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
      });
      unmatched++;
    }
  }

  return { matched, unmatched, scanned: messages.length };
}
