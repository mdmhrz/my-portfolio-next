import {
  KeyRound,
  Braces,
  Database,
  Server,
  ShieldCheck,
  CreditCard,
  Mail,
  Globe,
  Cloud,
  User,
  Wrench,
} from "lucide-react";

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

// Purely cosmetic (card/sheet iconography). A switch over statically-imported
// icons — rather than a lookup map handed to JSX as a dynamic tag — so icon
// identity is never "created during render" from the compiler's point of view.
export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  switch (category) {
    case "Password": return <KeyRound className={className} />;
    case "API": return <Braces className={className} />;
    case "Database": return <Database className={className} />;
    case "Server": return <Server className={className} />;
    case "OAuth": return <ShieldCheck className={className} />;
    case "Payment": return <CreditCard className={className} />;
    case "Email": return <Mail className={className} />;
    case "DNS": return <Globe className={className} />;
    case "Cloud": return <Cloud className={className} />;
    case "Personal": return <User className={className} />;
    case "Custom": return <Wrench className={className} />;
    default: return <KeyRound className={className} />;
  }
}

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

// "Rotate this secret" reminder — no new tracking needed, just how long it's
// been since the fields last changed (VaultItemHistory is written on every
// edit, so `updatedAt` already reflects the last real rotation).
export const SECRET_ROTATION_REMINDER_DAYS = 90;

export function isDueForRotation(updatedAt: string) {
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff > SECRET_ROTATION_REMINDER_DAYS * 24 * 60 * 60 * 1000;
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
