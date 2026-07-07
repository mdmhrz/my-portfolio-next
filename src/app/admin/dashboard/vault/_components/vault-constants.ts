// Suggested categories only — category is free-form text (see VaultItemDialog's
// datalist), not an enum, so a new kind of secret never needs a code change here.
export const VAULT_CATEGORIES = [
  "Password",
  "API",
  "Database",
  "Server",
  "OAuth",
  "Payment",
  "Email",
  "DNS",
  "Cloud",
  "Personal",
  "Custom",
] as const;

export const VAULT_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "password", label: "Password" },
  { value: "url", label: "URL" },
  { value: "textarea", label: "Textarea" },
  { value: "json", label: "JSON" },
  { value: "env", label: "Env (KEY=value)" },
  { value: "number", label: "Number" },
] as const;

export function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export function isExpiringSoon(expiresAt?: string | null, days = 14) {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < days * 24 * 60 * 60 * 1000;
}

// Falls back to the raw string on invalid JSON (e.g. legacy data saved before
// the "json" type existed) rather than throwing during render.
export function prettyJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
