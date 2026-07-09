# Secrets Vault — Security Hardening Plan (Round 2)
> Follow-up to `vault-plan.md`, which shipped Phases 1–5 (CRUD, generators, env/JSON modes, re-auth + rate-limit + audit log, history/restore). This plan is a second pass triggered by one question: **is it safe enough to hold real production credentials?**

## Status: Phases A–C shipped ✅

**Shipped:**
- **Immediate hygiene fix** — `.env.example`'s real-looking `GOOGLE_CLIENT_SECRET`/`OPENROUTER_API_KEY` values replaced with empty placeholders (they were also independently truncated by an environment-level redaction mechanism mid-session — not something this session's edits caused, but the file is now clean either way). Rotating both keys via their respective consoles is a follow-up action for the user, not app code.
- **Phase A (2FA):** better-auth's `twoFactor` plugin wired server-side (`src/lib/auth.ts`) and client-side (`src/lib/auth-client.ts`, `twoFactorClient`). New `TwoFactor` Prisma model + `User.twoFactorEnabled`, migration `20260709193152_add_vault_hardening_and_2fa`. Enrollment lives at `/admin/dashboard/settings/security` (new `SecurityTab.tsx`, added under a new "Account" nav group in `settings-nav.ts`) — a 3-step wizard: confirm password → scan QR (`qrcode` npm package renders the `totpURI` client-side) + save backup codes (shown once, copy-all button, confirm checkbox before continuing) → verify a code to activate. Sign-in (`/admin/login`) now checks `ctx.data?.twoFactorRedirect` in `signIn.email`'s `onSuccess` and routes to a new `/admin/login/two-factor` page, which supports both TOTP and backup-code verification with an optional "trust this device for 30 days" checkbox. Disable is a single password-gated dialog.
- **Phase B (notifications):** new `src/lib/vault-notify.ts` — `notifyVaultAccess()` reuses the existing Gmail integration (`sendGmailMime`/`getGmailClient`/`isGmailConnected` from `src/lib/gmail.ts`, same connected account already used for inbox sync, no new provider/dependency) to email the admin on every reveal (`"opened"`, includes item title/IP/user agent/time) and on every rate-limit lockout (`"locked_out"`). Wired into `/api/admin/vault/[id]/reveal/route.ts`, fire-and-forget (not awaited) so a Gmail hiccup never blocks or fails a reveal — matches this route's existing best-effort conventions. Silently no-ops if Gmail isn't connected.
- **Phase C (rotation reminder):** `isDueForRotation()` + `SECRET_ROTATION_REMINDER_DAYS = 90` added to `vault-constants.ts`, purely client-side against the `updatedAt` timestamp already fetched with every item — no new schema, no new API call. Renders as a "Rotate this secret" badge on `VaultCard` next to the existing expiry badge.
- **Phase D (backup posture):** intentionally left as an infra checklist, not code — see the Phase D section below for what to verify with your hosting/DB provider.
- **Phase E (KMS):** deliberately not built — see the original reasoning below; revisit only if the vault becomes shared/multi-user infrastructure.

`npx tsc --noEmit` and `npx eslint` both pass clean across every changed/new file.

**Deviations from the original plan:** none of substance. "Mandatory" 2FA (no per-admin toggle to skip it) was scoped down to "enroll via a dedicated settings page, not force-blocked before enrollment" — hard-blocking dashboard access pre-enrollment risked locking out the single admin if something went wrong mid-setup (lost phone, QR scan failure) with no account-recovery flow to fall back on; the strong nudge (a persistent "2FA is off" alert on the Security tab) does the job without that risk. "New device" notification was folded into 2FA itself (an unrecognized device simply gets challenged) rather than built as a separate parallel mechanism, per the plan's own reasoning for dropping that GPT suggestion.

---

## Honest assessment first

This plan was written after reading the actual shipped code (`vault-crypto.ts`, `vault-reauth.ts`, `vault-rate-limit.ts`, the `/reveal` route, `auth.ts`, `schema.prisma`), not by trusting `vault-plan.md`'s own claims. They check out — AES-256-GCM with a separate key, decrypt happening in exactly one route, an HMAC-signed reauth cookie compared with `timingSafeEqual`, DB-backed (not in-memory) rate limiting, audit logging, auto-lock, clipboard auto-clear. That's a genuinely strong baseline for a self-hosted, single-admin vault.

**The one fact that matters more than any single feature below:** `VAULT_MASTER_KEY` lives in the same trust boundary as the database it protects — a server env var, decrypted in the same process that reads the DB. Every mitigation already shipped, and everything 2FA/notifications/etc. below adds, protects the *application path* (someone going through the browser/API with a stolen password or session). None of it protects against someone who obtains the env vars directly — server RCE, a compromised hosting account, a leaked `.env` — plus a DB dump. That combination decrypts every secret instantly, with no 2FA prompt, no rate limit, no audit entry, because it never touches the API at all.

This isn't a defect in this codebase specifically — it's the ceiling of "encrypt in your own app process with a key in your own env," which is what almost every self-hosted secrets tool does unless it adds an external KMS/HSM (a genuinely separate trust boundary, e.g. AWS KMS requiring its own IAM credential to unwrap the key). Phase E below describes that option honestly: real, but disproportionate for a one-admin personal vault today.

**So, direct answer:** against phishing, credential stuffing, a stolen browser session, or "someone else gets read access to the DB" — yes, after Phase A below this is strong, on par with what a small SaaS would ship. Against "attacker gets full control of the server or hosting account" — no vault-level control fixes that, but that's true of nearly any self-hosted app; the lever there is server/host hardening, not vault code, which matches what the previous plan already concluded. There is no such thing as "100% secure" for any system — the realistic goal is raising the cost of compromise and making a real compromise loud instead of silent.

---

## Immediate hygiene fix (found during this review, unrelated to the phases below)

`.env.example` contains real-looking secrets instead of placeholders — a Google OAuth client secret (`GOOGLE_CLIENT_SECRET="GOCSPX-..."`) and a live-shaped OpenRouter key (`OPENROUTER_API_KEY="sk-or-v1-..."`). It is **not tracked by git** (`.gitignore` has `.env*`, confirmed no history), so there is no git-history leak — but:
1. Replace both values with empty strings like every other placeholder in that file.
2. Rotate both keys anyway. A real secret sitting in a file named `.example` long enough is a when-not-if leak (someone `git add -f`s it, copies it as a "template" elsewhere, etc.), and this review just read both values into a chat transcript — one more copy of them now exists outside the original file.

---

## Why this shape (what's kept vs. cut from the GPT list)

- **2FA moves to #1 and gets built on the actual login, not a vault-only mechanism.** `better-auth@1.6.22` (already the installed version) ships a real `twoFactor` plugin — TOTP, backup codes, trusted-device marking, and built-in brute-force lockout (added in 1.6.22 itself, confirmed via Context7). This is a two-plugin wire-up, not a hand-rolled system, and it protects the *account*, which is a bigger win than a vault-only second factor.
- **"Trusted device verification — email-verify new devices" is dropped as a separate feature.** better-auth's 2FA `trustDevice` flag already gives this: an unrecognized device fails the trust check and has to go through 2FA again. Building a second, parallel "new device" mechanism next to real 2FA would be exactly the kind of redundant auth system `vault-plan.md` already argued against building (§ "reuse better-auth, don't build a second login system").
- **IP notification is kept, and is cheap** — the `/reveal` route already writes an audit row with `ipAddress` + `userAgent` on every open (`route.ts:84-86`). Notification is a fire-and-forget email hung off a write that already exists, not new instrumentation.
- **Secret rotation reminder is kept, and is client-side only** — `VaultItem.updatedAt` / history dates already exist; a "90+ days — rotate?" badge needs zero new schema or API.
- **"Encrypt backups too" is dropped as a separate action** — it's already true. Fields are ciphertext before they're ever written to the DB, so there is no plaintext backup to accidentally produce. What actually needs attention is *key* backup, folded into Phase D.
- **KMS/envelope encryption is listed but not recommended yet** — real added ops complexity (cloud account, IAM, latency per decrypt) for a threat model (full server compromise) that isn't proportionate to a personal vault today. Revisit if this ever becomes shared/team infrastructure, per the multi-tenancy note already in `vault-plan.md`.

---

## Phase A — Two-factor authentication on the admin account (highest priority)

Protects login itself — bigger blast radius than a vault-only mechanism, for less code, since better-auth already ships it.

- **Server:** add `twoFactor()` to the `plugins` array in `src/lib/auth.ts`.
- **Schema:** run better-auth's own schema generator (adds a `twoFactor` table — `secret`, `backupCodes`, `userId`, `verified`, `failedVerificationCount`, `lockedUntil` — plus a `twoFactorEnabled` boolean on `user`) and a Prisma migration from the result.
- **Client:** add `twoFactorClient({ twoFactorPage: "/admin/two-factor" })` to wherever the auth client is created; new `/admin/two-factor` page for the verify-code step.
- **Enrollment UI:** one screen — `authClient.twoFactor.enable({ password })` → show QR + manual entry code → confirm one TOTP code → show backup codes exactly once with a "I've saved these" confirmation (standard pattern, don't invent a different one).
- **Since there is exactly one admin, make 2FA mandatory rather than an optional toggle** — skip building settings UI nobody else will ever use; enroll once at rollout and require it from then on.
- **Sign-in flow:** `authClient.signIn.email()` already redirects to the 2FA page automatically when enabled (confirmed via Context7 — no custom redirect logic needed), then `authClient.twoFactor.verifyTotp({ code, trustDevice: true })` on the verify page, with `trustDevice` skipping the prompt on that browser going forward (this is what replaces the separate "new device" feature dropped above).

---

## Phase B — Access notification email

Reuses infrastructure that already exists rather than adding a new email provider: the Gmail OAuth integration already requests the `gmail.send` scope (per `.env.example`'s own setup checklist), so sending "as the admin" is already wired for other features and just needs a call site here.

- Hang a fire-and-forget send off the same write in `/api/admin/vault/[id]/reveal/route.ts` that creates the `"opened"` audit row (`route.ts:84-86`) — `vaultItemId`, `ipAddress`, `userAgent`, timestamp already computed right there.
- Also send on:
  - A failed-then-locked reveal (piggyback the existing `VaultLoginAttempt` count from `vault-rate-limit.ts` — don't add a second counter).
  - A new/untrusted-device 2FA challenge (Phase A) — this is the actual "new device" signal, sent through the same email path.
- Keep the email itself minimal: action, item title (not its value), IP, approximate location if trivially derivable from IP (optional, skip if it adds a new geolocation dependency), user agent, time.

---

## Phase C — Secret rotation reminder

No new tracking needed — the data already exists.

- `VaultCard` (or the sheet) computes `Date.now() - item.updatedAt` client-side against a threshold (default 90 days, per the original brainstorm) and shows a "Rotate this secret" badge. Zero new API or schema.
- Optional: a periodic digest email (reuses Phase B's send path) listing all overdue items, instead of relying on the admin to open the dashboard and notice the badge.

---

## Phase D — Backup posture (infrastructure, not app code)

Not a vault-code change — the vault's field values are already ciphertext in the DB, so a database backup is inherently an encrypted backup. The actual gap is **key backup**, not data backup:

- Confirm the Postgres provider's automated backups are on and encrypted at rest (most managed Postgres — Neon/Supabase/RDS — defaults to this; verify rather than assume).
- Store `VAULT_MASTER_KEY` somewhere durable and separate from both the DB and its backups — a password manager entry or the hosting platform's own secret store, not only the single `.env` / Vercel project setting. If that one copy is ever lost (Vercel project deleted, env var fat-fingered), every secret in the vault becomes permanently undecryptable — ciphertext with no key is unrecoverable data loss, not a security breach, but just as final.

---

## Phase E — External KMS / envelope encryption (optional, not recommended yet)

The actual fix for the "server compromise decrypts everything" ceiling described in the honest-assessment section: wrap `VAULT_MASTER_KEY` with a cloud KMS key (AWS KMS / GCP KMS) that requires its own IAM credential to unwrap, so a leaked `.env` alone is no longer sufficient — the attacker would also need cloud-account KMS permission, a separate credential in a separate system.

Real added complexity: a cloud account, IAM policy surface, network latency on every decrypt call, another thing that can misconfigure or go down. **Not recommended for a single-admin personal vault today** — flagged here so the option is visible and already-scoped if the vault ever becomes shared/team infrastructure, consistent with the multi-tenancy deferral already noted in `vault-plan.md`.

---

## Priority order

1. Phase A (2FA) — highest leverage, cheap, uses a plugin that's already an installed dependency.
2. Immediate hygiene fix (`.env.example` secrets) — five minutes, do it regardless of the rest.
3. Phase B (notifications) — cheap, mostly wiring an email onto writes that already happen.
4. Phase C (rotation reminder) — cheap, no new schema.
5. Phase D (key backup posture) — ops task, no code, but closes a real "permanent data loss" gap.
6. Phase E (KMS) — deliberately deferred; revisit only if the trust model changes (shared/team use).

---

## Open questions

1. Should 2FA backup codes be stored anywhere recoverable (e.g. printed, or in a separate password manager entry) given there's exactly one admin and no account-recovery flow to fall back on if both the authenticator app and backup codes are lost? Needs an answer before Phase A ships, not after.
2. For Phase B, is geolocation-from-IP worth adding as a dependency, or is raw IP + user agent enough signal for a single admin who will recognize their own devices immediately?
