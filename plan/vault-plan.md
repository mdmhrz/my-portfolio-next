# Secrets Vault — Implementation Plan
> Encrypted single-place store for every credential/secret you touch, built into the mhrazu.com admin dashboard

---

## Why this shape

This plugs into the dashboard the same way Job Tracker did: a new `NAV_GROUPS` entry, its own Prisma models, `/api/admin/vault/*` routes on the existing `verifyAdmin()` pattern, a `vault` store slice. Nothing about the shape of the app changes.

Three decisions steer the whole design:

1. **No typed columns, ever.** No `password`/`apiKey`/`token` fields on the model — just `label` + `type` + `encryptedValue` rows attached to an item. This is what makes it "future-proof": a new secret shape (say, a Kubernetes kubeconfig) is a new item with custom fields, not a migration.
2. **A second, independent encryption key.** `GMAIL_TOKEN_ENCRYPTION_KEY` already exists (`src/lib/crypto.ts`, AES-256-GCM) for Gmail refresh tokens. The vault gets its **own** `VAULT_MASTER_KEY` rather than reusing it — a leak of one key must not also unlock the other category of secret. Same algorithm, separate key, so the vault gets a `src/lib/vault-crypto.ts` that mirrors `crypto.ts`'s shape rather than importing it.
3. **Reuse better-auth for re-authentication, don't build a second login system.** The "ask password again before reveal" step in the brainstorm sounds like a new auth mechanism, but this app already has exactly one admin user with a credential (`Account.password` under better-auth). Re-auth = call better-auth's existing sign-in check with the current session's email, not a parallel "master password."

**Deviation from the brainstorm, on purpose:** the brainstorm's "Future SaaS" section (multi-user, per-user encryption boundaries, RBAC, mobile biometric, invite collaborators) is scoped out. This is a single-admin app — there is one `User` with `role: "admin"`. Building multi-tenant plumbing for a tenant count of one is exactly the kind of premature abstraction to avoid; the field-based schema already leaves room to add a `userId` column later without a redesign, if this ever stops being true. Attachments, mobile/biometric, and the AI "explain this env file" button are listed as later phases, not MVP — they're real ideas but not needed to make this useful daily.

---

## Phase 1 — Data model + core CRUD (MVP) ✅ COMPLETE

The foundation. Ships a usable vault: create an item, add fields, view it masked, reveal it, copy it, edit it, delete it.

**Shipped:** `VaultItem`/`VaultField`/`VaultItemHistory` Prisma models + migration `20260707194528_add_secrets_vault`; `src/lib/vault-crypto.ts` (AES-256-GCM, keyed from its own `VAULT_MASTER_KEY`, separate from `GMAIL_TOKEN_ENCRYPTION_KEY`); all three API routes (`/api/admin/vault`, `/api/admin/vault/[id]`, `/api/admin/vault/[id]/reveal`) on the `verifyAdmin()` pattern with masked-by-default reads; "Vault" nav group (`ShieldCheck` icon); `vaultItems` store slice in `usePortfolioStore.ts` including `revealVaultItem()` which deliberately never touches persisted store state; full dashboard page at `/admin/dashboard/vault` — card grid with search/category filter/favorites toggle, `VaultItemDialog` (create/edit with a repeatable label+type+value field list), `VaultItemSheet` (reveal-to-view, per-field mask toggle, copy-to-clipboard). `npx tsc --noEmit`, `eslint`, and `next build` all pass clean; smoke-tested against the running dev server (`/admin/dashboard/vault` → 200, `/api/admin/vault` → 401 unauthenticated, as expected).

**Notable implementation detail:** editing an existing item calls `revealVaultItem()` *before* opening the dialog, not after — list/detail reads are permanently masked (no `value` field at all), so the edit form has no way to prefill real values otherwise. Without this, saving an edit with blank inputs would silently encrypt empty strings over the real secret. `VaultItemDialog` and `VaultItemSheet` are both keyed by item id from the parent so state resets on remount instead of via an effect (avoids a React "setState in effect" lint error).

**Deviation from plan:** none — Phase 1 shipped exactly as scoped in §1.1–§1.6.

### 1.1 Prisma models
`prisma/schema.prisma` — add:

```prisma
// --- Secrets Vault ---
// Single place for every credential/secret (API keys, DB URLs, SSH keys, env
// vars, ...). No typed columns on purpose — VaultField.type + encryptedValue
// is the only shape, so a new kind of secret never needs a migration.
model VaultItem {
  id          String             @id @default(uuid())
  title       String
  category    String             // free-form: "Password" | "API" | "Database" | "Server" | "OAuth" | "Payment" | "Email" | "DNS" | "Cloud" | "Personal" | "Custom"
  description String?
  tags        String[]
  favorite    Boolean            @default(false)
  expiresAt   DateTime?
  fields      VaultField[]
  history     VaultItemHistory[]
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  @@map("vault_item")
}

// One labeled value on an item. `encryptedValue` is always ciphertext
// regardless of `type` — type only drives how the UI renders/masks it.
model VaultField {
  id             String    @id @default(uuid())
  vaultItemId    String
  vaultItem      VaultItem @relation(fields: [vaultItemId], references: [id], onDelete: Cascade)
  label          String    // e.g. "API Key", "Host", "Signing Secret"
  type           String    @default("password") // "text" | "password" | "url" | "textarea" | "json" | "env" | "number"
  encryptedValue String    @db.Text
  order          Int       @default(0)

  @@map("vault_field")
}

// Append-only snapshot taken on every edit, so a changed/rotated secret can
// be rolled back to what it was before.
model VaultItemHistory {
  id          String    @id @default(uuid())
  vaultItemId String
  vaultItem   VaultItem @relation(fields: [vaultItemId], references: [id], onDelete: Cascade)
  snapshot    Json      // [{ label, type, encryptedValue, order }, ...] as of changedAt
  changedAt   DateTime  @default(now())

  @@map("vault_item_history")
}
```

Migration: `npx prisma migrate dev --name add_secrets_vault`

### 1.2 Encryption helper
`src/lib/vault-crypto.ts` [NEW] — mirrors `src/lib/crypto.ts` exactly (AES-256-GCM, `iv:authTag:ciphertext` base64 format) but keyed from `VAULT_MASTER_KEY`, not `GMAIL_TOKEN_ENCRYPTION_KEY`. Add to `.env.example`:
```
# Vault field encryption — 32 random bytes, base64. Generate with: openssl rand -base64 32
VAULT_MASTER_KEY=
```
`encrypt()`/`decrypt()` are called **only** in API route handlers, never sent to or run in the client.

### 1.3 API routes (`verifyAdmin()` pattern, matches every other `/api/admin/*`)
- `src/app/api/admin/vault/route.ts` [NEW] → `GET` (list — returns items with fields **masked**, i.e. `encryptedValue` stripped, only `hasValue: true` sent), `POST` (create item + fields, encrypts each field server-side)
- `src/app/api/admin/vault/[id]/route.ts` [NEW] → `GET` (masked, same as list), `PATCH` (update fields — writes a `VaultItemHistory` snapshot of the *old* encrypted fields first), `DELETE`
- `src/app/api/admin/vault/[id]/reveal/route.ts` [NEW] → `POST` (body: nothing beyond the session; decrypts and returns plaintext field values for this one item). This is the only route that ever calls `decrypt()`.

Masked-by-default matters: the list/detail `GET` must never put ciphertext *or* plaintext in a payload the client doesn't need yet — reveal is a deliberate, separate request so it's the natural place to hang audit logging and re-auth (Phase 3).

### 1.4 Dashboard nav
`src/app/admin/dashboard/_components/nav-items.ts`:
- Add `"vault"` to `TabValue`
- New group:
```ts
{
  label: "Vault",
  items: [
    { value: "vault", label: "Secrets", href: "/admin/dashboard/vault", icon: ShieldCheck },
  ],
},
```
(`ShieldCheck` chosen over `Lock` — reads more distinctly as "security/trust" next to the other groups' icons.)

### 1.5 Store slice
`src/store/usePortfolioStore.ts` — add a `vault` slice following the `jobs` slice pattern: `items`, `fetchItems`, `createItem`, `updateItem`, `deleteItem`, `revealItem(id)` (calls the `/reveal` route and caches plaintext **in memory only**, cleared on lock/unmount — never persisted to localStorage).

### 1.6 Dashboard pages
Follow the `testimonials`/`jobs` pattern:
- `src/app/admin/dashboard/vault/page.tsx` [NEW] → thin wrapper
- `src/app/admin/dashboard/vault/_components/VaultPageContents.tsx` [NEW] — grid/list of `VaultCard`s, search bar (title/tags/category/description), category filter, favorites filter
- `src/app/admin/dashboard/vault/_components/VaultCard.tsx` [NEW] — title, category badge, tags, favorite star, expiry badge if `expiresAt` is set
- `src/app/admin/dashboard/vault/_components/VaultItemSheet.tsx` [NEW] — detail view: each field shown masked (`••••••••`) with an eye-toggle (calls `revealItem` on first click, then toggles local show/hide without re-fetching) and a copy button (toast "Copied.")
- `src/app/admin/dashboard/vault/_components/VaultItemDialog.tsx` [NEW] — create/edit: title, category (combobox — free text, but suggests existing categories via `SELECT DISTINCT`, same trick `resumeVersion` used in Job Tracker), tags, description, expiresAt, and a **repeatable field list** (label + type dropdown + value), add/remove rows freely — this is what makes fields schema-less from the UI's perspective

---

## Phase 2 — Generators ✅ COMPLETE

Pure client-side, no new API needed (uses `window.crypto.getRandomValues`, same trust level as any password manager's local generator).

**Shipped:** `src/lib/vault-generators.ts` (`generatePassword`, `generateSecret` for hex/uuid/nanoid/jwt-signing-key). Wired into `VaultItemDialog` via a new `FieldGenerator` popover next to each field's type selector — a dice icon opens length/character-set controls for `type: "password"` fields, or a secret-kind picker (hex/UUID/nanoid/JWT signing key) for every other type, with a "Generate" button that fills the value directly. Needed a new `src/components/ui/popover.tsx` primitive (didn't exist yet) — added following this repo's exact shadcn/radix-ui pattern (mirrors `tooltip.tsx`/`select.tsx` styling). `tsc`, `eslint`, and `next build` all pass clean.

**Deviation from plan:** the plan only specified wiring the popover for `type: "password"` fields; the secret-kind picker for other types wasn't explicitly scoped but was in the original brainstorm ("Generate Secret for JWT, API, Webhook, Random Hex, UUID, NanoID") and reuses the same popover/component with no extra files or routes, so it was included rather than leaving `generateSecret()` unreachable from the UI.

- `src/lib/vault-generators.ts` [NEW]:
  - `generatePassword({ length, symbols, numbers, uppercase, excludeAmbiguous })`
  - `generateSecret(kind: "hex" | "uuid" | "nanoid" | "jwt-signing-key")`
- Wired into `VaultItemDialog`: a dice-icon button next to any field of `type: "password"` opens a small popover with the generator options and an "Insert" button.

---

## Phase 3 — Env bundle mode + JSON mode ✅ COMPLETE

The two field `type`s that need dedicated UI beyond a plain input:

- **`type: "env"`** — textarea accepts pasted `KEY=value` lines; on save, parsed into one `VaultField` per line (so each var is still individually copyable/searchable) **plus** the item gets an `isEnvBundle` convenience: a "Copy .env" button on `VaultItemSheet` that reveals all fields at once and reassembles them into a single `KEY=value\n...` blob for one-click copy. (No new column needed — detect bundle-ness by checking if all fields on the item are `type: "env"`.)
- **`type: "json"`** — value is validated as JSON on save (reject invalid JSON with a form error), rendered pretty-printed in a read-only formatted block in the sheet, with its own "Copy JSON" button.

**Shipped:** `VaultItemDialog` gained a "Paste .env" toggle (mirrors the existing "Paste a job description" pattern in `AddJobDialog`) that parses a pasted block and expands it into individual `label`/`type: "env"`/`value` rows immediately, plus per-row JSON validation on submit (invalid JSON blocks save with an inline "Invalid JSON" error under that row). `VaultItemSheet` renders `type: "json"` fields pretty-printed (`vault-constants.ts`'s new `prettyJson()`, falls back to raw text on parse failure) and copies the pretty version; a "Copy .env" button appears next to "Reveal values" whenever every field on the revealed item is `type: "env"`. `tsc`, `eslint`, and `next build` all pass clean.

**Deviation from plan:** the plan described the `env` textarea as living directly on a `type: "env"` field row, expanding *at save time*. Implemented instead as a separate "Paste .env" affordance that expands *immediately* on parse, before save — because expanding at save time would require hiding the row's label input for `type: "env"` (the plan's implied UI), which breaks re-editing: an already-saved env var reloaded into the form would show a real key as its label, but the row would still be `type: "env"` and the hidden-label rule would hide it again, making it impossible to see or rename which variable a row is. Expanding immediately means every row — freshly pasted or loaded from a saved item — is a normal, fully-visible label+type+value field with no special-cased rendering.

---

## Phase 4 — Security hardening ✅ COMPLETE

This is the phase that actually makes "vault" not just "notes with a lock icon."

**Shipped:**
- **Re-auth before reveal:** better-auth ships a ready-made `auth.api.verifyPassword({ body: { password }, headers })` server-scope endpoint (`node_modules/better-auth/dist/api/routes/password.mjs`) — used as-is rather than hand-rolled. `POST /api/admin/vault/[id]/reveal` now: checks a signed `vault_reauth` cookie first (5 min grace, `src/lib/vault-reauth.ts` — HMAC-SHA256 over `userId:expiresAt` using `BETTER_AUTH_SECRET`, `timingSafeEqual` compare); if absent/expired, requires `password` in the body and verifies it via better-auth, then sets the cookie (httpOnly, secure in prod, 5 min `maxAge`). Responds **200** with `{ success: false, requiresPassword: true }` for the "not yet re-authed" step — this is a normal step in the flow, not an error, so it doesn't trip the axios error interceptor.
- **Client-side re-auth UX:** new `useVaultReveal()` hook (`_components/useVaultReveal.tsx`) wraps "try reveal, prompt for password only if the server asks, retry" behind a single `reveal(id): Promise<VaultFieldData[] | null>` call plus a `<PasswordPrompt/>` dialog — shared by both `VaultItemSheet`'s "Reveal values" button and `VaultPageContents`' edit flow (editing needs a reveal too, to prefill real values), so the password prompt only needed to be built once.
- **Auto-lock:** new `useVaultAutoLock()` hook (`_components/use-vault-auto-lock.ts`) — 5 minutes of no mouse/keyboard/scroll/touch activity closes any open detail sheet or edit dialog on the Vault page, independent of the admin's overall dashboard session.
- **Clipboard auto-clear:** every copy (`VaultItemSheet.copyValue`/`copyEnvBundle`) schedules a 30s `setTimeout` that reads the clipboard back and only clears it if it still holds exactly what was copied — best-effort, silently no-ops if the browser denies clipboard read.
- **Rate limiting:** DB-backed, not in-memory — `VaultLoginAttempt` model + `src/lib/vault-rate-limit.ts` (`checkVaultRateLimit()`/`recordVaultAttempt()`). In-memory would silently reset on every cold start on Vercel's stateless functions, defeating the point of a lockout. 5 failed attempts in 15 minutes locks out; the reveal route checks this before calling `verifyPassword`.
- **Audit log:** `VaultAuditLog` model (deliberately no FK relation to `VaultItem` — a "deleted" entry must survive the delete it's recording). Written directly from each route: `created`/`updated`/`deleted` from the item CRUD routes (favorite-only toggles are excluded from `updated` — not a substantive edit), `opened` from `/reveal`. `copied` is the one action the *client* reports (`logVaultCopy()`, fire-and-forget POST to the new `GET`/`POST /api/admin/vault/[id]/audit` route) since the server has no visibility into clipboard writes. Surfaced as an "Activity" timeline at the bottom of `VaultItemSheet`, same shape as Job Tracker's `JobStatusEvent` timeline.

`tsc`, `eslint`, and `next build` all pass clean; smoke-tested against the running dev server (`/api/admin/vault/[id]/reveal` → 401, `/api/admin/vault/[id]/audit` → 401 unauthenticated, `/admin/dashboard/vault` → 200, as expected).

**Deviation from plan:** none of substance — the plan said "reuse whatever better-auth exposes," and `verifyPassword` turned out to be an exact, already-built fit.

- **Re-auth before reveal:** `POST /api/admin/vault/[id]/reveal` requires a `password` in the body, verified against the admin's better-auth credential (reuse whatever better-auth exposes for credential verification — check `src/lib/auth.ts` for the exact call before wiring this, don't hand-roll password comparison). Session-scoped grace period (e.g. re-auth once, valid for 5 minutes) so it's not "type your password every single click," stored as a short-lived signed cookie, not client state.
- **Auto-lock:** client-side inactivity timer (5 min, matches the brainstorm) on the Vault page specifically — locks the in-memory revealed cache and requires re-auth again, independent of the admin's overall dashboard session.
- **Clipboard auto-clear:** after a copy, an optional (default-on) `setTimeout` that overwrites the clipboard with an empty string after 30s, only if the clipboard still contains the copied value (avoid clobbering something the user copied from elsewhere in the meantime — compare before clearing).
- **Rate limiting:** the `/reveal` and admin auth-check routes get a basic in-memory or DB-backed attempt counter; lock out after 5 failed re-auth attempts for a cooldown window. Check whether the codebase already has a rate-limit utility (Gmail webhook or contact form may) before writing a new one.
- **Audit log:** new `VaultAuditLog` model —
```prisma
model VaultAuditLog {
  id          String   @id @default(uuid())
  vaultItemId String?
  action      String   // "created" | "opened" | "copied" | "updated" | "deleted"
  fieldLabel  String?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@map("vault_audit_log")
}
```
  Written from the same routes that already exist (create/update/delete/reveal) — not a separate system to maintain. Surfaced as a simple timeline tab on `VaultItemSheet`, same shape as `JobStatusEvent`'s timeline in Job Tracker.

---

## Phase 5 — History / restore ✅ COMPLETE

- `GET /api/admin/vault/[id]/history` [NEW] — list snapshots (dates only, not decrypted) for an item.
- `POST /api/admin/vault/[id]/history/[historyId]/restore` [NEW] — re-auth required (same as reveal), replaces current fields with the snapshot's, and itself pushes the current (about-to-be-replaced) state onto history first so restore is non-destructive too.
- UI: a "History" tab on `VaultItemSheet` next to the audit log, each entry with a "Restore this version" button behind a confirm dialog.

**Shipped:** `GET /api/admin/vault/[id]/history` returns metadata only (`id`, `changedAt`, `fieldLabels` derived from the snapshot JSON) — never `encryptedValue`, so browsing history doesn't require a reveal. `POST /api/admin/vault/[id]/history/[historyId]/restore` re-auth-gated identically to `/reveal` (same signed-cookie-or-password dance, same rate limiter) since overwriting the live secret is exactly as sensitive as viewing it; restoring itself snapshots the current (about-to-be-replaced) fields into a new history row first, so a restore is never a one-way trip. Restore also copies `encryptedValue` straight from the old snapshot to the new fields — it never touches plaintext, since the ciphertext itself doesn't need to change.

The reveal and restore password-prompt flows turned out to be identical, so `useVaultReveal.tsx` was generalized into `useVaultReauth.tsx`: a shared `useVaultReauthFlow<T>()` internal hook holds the prompt/retry state machine, and `useVaultReveal()`/`useVaultRestore()` are now thin wrappers around it (existing call sites in `VaultItemSheet`/`VaultPageContents` needed only an import-path change). `VaultItemSheet` gained a "History" section (mirrors the "Activity" timeline directly above it) — each entry shows its date and field labels with a "Restore" button that opens a confirm dialog; on confirmed restore, the sheet resets `revealed`/`visible` (values just changed server-side, so stale plaintext must not linger) and refetches both the audit log and history list. A new `onRestored` prop on `VaultItemSheet` hands the updated item back to `VaultPageContents` so its `detailItem` state — a plain snapshot, not derived live from the store — doesn't go stale after a restore.

`tsc`, `eslint`, and `next build` all pass clean; smoke-tested against the running dev server (`/api/admin/vault/[id]/history` → 401, `/api/admin/vault/[id]/history/[id]/restore` → 401 unauthenticated, `/admin/dashboard/vault` → 200, as expected).

**Deviation from plan:** none of substance — the reveal/restore hook unification wasn't explicitly planned but is a direct, low-risk consequence of Phase 4 and 5 needing the exact same UX.

---

## All planned phases shipped

Phases 1–5 are complete. What remains is the "Explicitly deferred" list above (multi-user/RBAC, attachments, mobile/biometric, AI explain, folders) — intentionally held back, not forgotten. The next planned step per the user is a broader multi-tenancy pass across the app, at which point the deferred multi-user item above becomes active scope rather than deferred.

---

## Explicitly deferred (not in this plan's scope)

Real ideas from the brainstorm, held back because they add real complexity for value that isn't needed yet — revisit if the vault sees daily use and one of these becomes a recurring friction point:

- **Multi-user / per-user encryption boundaries / RBAC** — no second user exists in this app today. **Forward note:** the user has confirmed multi-tenancy is the *next* project after this module ships, so Phase 1's models are kept easy to retrofit — `VaultItem` has no owner-scoped business logic baked into queries (all reads go through the two route files, not scattered `prisma.vaultItem` calls across the codebase), so adding a `userId` column + a `where: { userId }` filter later is a small, contained change rather than a redesign. Don't add the column now — there is exactly one admin, and a real multi-tenant pass will also need to decide session/org scoping for auth itself, which is out of scope for this module.
- **Attachments** (`.pem`/`.key`/`.crt` upload) — needs encrypted blob storage (Cloudinary won't do since these aren't public assets); worth a dedicated look at storage once the core vault is in daily use.
- **Mobile/Capacitor + biometric unlock** — no mobile shell exists in this repo yet.
- **AI "explain this env file"** — trivial to bolt on later (one button, one non-persisted prompt with the revealed value), deliberately left out of MVP so the first ship doesn't involve deciding how secrets touch an LLM call at all.
- **Folders** (Personal/Client A/Client B) — `tags` + `category` already cover this; add a real `folder` concept only if tags prove insufficient in practice.

---

## Open questions

1. Confirm better-auth exposes a way to verify a password against the current session's `Account` without a full sign-in round-trip (needed for Phase 4, worth checking early since it affects the reveal route's shape). Not blocking for Phase 1.

Resolved: nav icon is `ShieldCheck` (see §1.4). Multi-tenancy is deliberately deferred but schema/routes are being kept easy to retrofit (see the deferred-scope note above).
