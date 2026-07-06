export const JOB_STATUSES = [
  { value: "found", label: "Found" },
  { value: "saved", label: "Saved" },
  { value: "preparing", label: "Preparing" },
  { value: "applied", label: "Applied" },
  { value: "assessment", label: "Assessment" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number]["value"];

export const JOB_STATUS_COLORS: Record<string, string> = {
  found: "bg-muted text-muted-foreground",
  saved: "bg-secondary text-secondary-foreground",
  preparing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  applied: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  assessment: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  interview: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  offer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/10 text-destructive",
};

export const JOB_SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "google_form", label: "Google Form" },
  { value: "referral", label: "Referral" },
  { value: "friend", label: "Friend" },
  { value: "email", label: "Email" },
  { value: "career_site", label: "Career Website" },
  { value: "hard_copy", label: "Hard Copy" },
  { value: "other", label: "Other" },
] as const;

export const JOB_APPLICATION_TYPES = [
  { value: "easy_apply", label: "Easy Apply" },
  { value: "external_website", label: "External Website" },
  { value: "email", label: "Email" },
  { value: "google_form", label: "Google Form" },
  { value: "hard_copy", label: "Hard Copy" },
  { value: "referral", label: "Referral" },
] as const;

export const JOB_WORK_MODES = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
] as const;

export function labelFor(list: readonly { value: string; label: string }[], value?: string | null) {
  return list.find((i) => i.value === value)?.label ?? value ?? "—";
}

export function formatSalary(min?: number | null, max?: number | null, currency?: string | null) {
  if (!min && !max) return null;
  const cur = currency || "";
  if (min && max) return `${cur} ${min.toLocaleString()} – ${max.toLocaleString()}`.trim();
  return `${cur} ${(min ?? max)!.toLocaleString()}`.trim();
}

export function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
