// Pure, dependency-free — safe to import from client components. Kept out of
// src/lib/job-calendar.ts because that file pulls in Prisma + googleapis,
// which can't reach the browser bundle where this guess is actually used
// (prefilling the "Add to Calendar" dialog).
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
const DATE_TIME_RE = new RegExp(
  `\\b(${MONTHS})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s*(\\d{4})?(?:\\s*(?:at|,)?\\s*(\\d{1,2}(?::\\d{2})?\\s*(?:am|pm|AM|PM)))?`,
  "i"
);

/**
 * Best-effort natural-language date/time guess from an interview email's
 * subject/snippet — used only to prefill the "Add to Calendar" dialog, never
 * to auto-create an event. Wrong guesses are cheap to fix by hand; a silent
 * wrong calendar invite is not.
 */
export function guessInterviewDateTime(text: string): Date | null {
  const match = text.match(DATE_TIME_RE);
  if (!match) return null;

  const candidate = `${match[1]} ${match[2]}, ${match[3] ?? new Date().getFullYear()} ${match[4] ?? "10:00 AM"}`;
  const parsed = new Date(candidate);
  if (isNaN(parsed.getTime())) return null;

  // No year in the email usually means "this year, upcoming" — if that
  // reading lands in the past, the email almost certainly meant next year.
  if (!match[3] && parsed.getTime() < Date.now() - 24 * 60 * 60 * 1000) {
    parsed.setFullYear(parsed.getFullYear() + 1);
  }

  return parsed;
}
