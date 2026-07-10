# Hybrid File Storage (Cloudflare R2 + Google Drive) — Implementation Plan
> Generic file storage for the dashboard, behind one provider abstraction — Vault attachments first, Job Tracker/Blog documents later

---

## Why this shape

This isn't one generic "add file storage" problem — it's two different jobs that got conflated in the original brainstorm:

1. **The app needs a fast, reliable, app-controlled place to put files it works with programmatically** — Vault attachments (`.pem`/`.key`/`.crt`, the exact thing [`vault-plan.md`](./vault-plan.md) deferred: *"needs encrypted blob storage (Cloudinary won't do since these aren't public assets)"*), and later Job Tracker/Blog document uploads. This wants a private, S3-compatible bucket with a static API key — **Cloudflare R2**.
2. **Personal, durable backup outside the app** — the original ask ("I want these backed up by Google, accessible outside my app if needed") is not a storage-performance requirement, it's an ownership preference. That's **Google Drive** — but every read/write there rides a refreshable OAuth token against one connected account, which is the wrong dependency for the app's own day-to-day reads. Making Drive the *primary* store would mean every Vault attachment view depends on the Gmail OAuth connection staying healthy.

So: **R2 is the default/primary provider** for anything the app itself needs to reliably read and write. **Drive is opt-in per file** — a "back this up to my Drive" action — not where the app lives.

A few things this plan deliberately keeps small:

- **`StorageProvider` interface, two implementations.** Matches the earlier recommendation, kept literally minimal (`upload`/`delete`/`getSignedUrl`) — no generic plugin registry, no config-driven provider selection. Nothing above the abstraction needs to know which bucket/API a given file lives in.
- **Cloudinary is untouched.** It stays the image-specific pipeline (transforms, CDN, `getCloudinaryFolder()`) for blog covers, avatars, fonts — this plan is for non-image/private files only, not a Cloudinary replacement.
- **Reuse the existing Gmail OAuth account for Drive**, exactly like Calendar already does. `src/modules/gmail/service/client.ts` already has `getAuthorizedClient()` shared by `getGmailClient()`/`getCalendarClient()` — `getDriveClient()` is the same five-line pattern, not a second Google integration. Requires one Gmail reconnect to grant the new scope (same as when `calendar.events` was added — see the comment at client.ts:92-95).
- **No `userId` anywhere.** Single-admin app, same reasoning `vault-plan.md` and `job-tracker-plan.md` both already apply.
- **Folder IDs (Drive) are static env vars, not runtime-created.** Create the Drive folder tree once by hand; the app never calls `files.create` with `mimeType: folder`.

---

## Provider interface

```ts
// src/lib/storage/types.ts
export interface StorageProvider {
  upload(params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    folder: string; // bucket prefix (R2) or Drive folder id
  }): Promise<{ providerFileId: string }>;
  delete(providerFileId: string): Promise<void>;
  getSignedUrl(providerFileId: string, expiresInSeconds?: number): Promise<string>;
}
```

Both providers return only a `providerFileId` from `upload()` — never a public URL — because both buckets/folders are private by default (R2 bucket private, Drive folder not shared). Reads always go through `getSignedUrl()` (R2: presigned GET, short-lived; Drive: `files.get` with `alt=media` proxied through an API route, since Drive doesn't do presigned URLs the same way).

---

## Phase 1 — R2 provider + generic `FileAsset` model (primary store) ✅ COMPLETE

**Shipped:** `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (installed via `pnpm` — this repo uses `pnpm-lock.yaml`, not npm); `src/lib/storage/types.ts` (`StorageProvider` interface); `src/lib/storage/r2-provider.ts` (private-bucket `S3Client` against R2's endpoint, `upload`/`delete`/`getSignedUrl` via `PutObjectCommand`/`DeleteObjectCommand`/presigned `GetObjectCommand`, object keys as `{folder}/{timestamp}-{sanitized-name}.{ext}`); `FileAsset` Prisma model + migration `20260710143202_add_file_asset`; `POST /api/admin/files` (multipart upload, `verifyAdmin()`-gated); `GET /api/admin/files/[id]` (signed URL) and `DELETE /api/admin/files/[id]` (removes both the R2 object and the DB row). `npx tsc --noEmit`, `eslint`, and `next build` all pass clean; all four routes smoke-tested against the running dev server → 401 unauthenticated, as expected. R2 credentials not yet configured in this environment (open question §1 below still applies) — routes correctly 500 with a clear message via `isR2Configured()` rather than throwing if hit before env vars are set.

**Deviation from plan:** added `GET /api/admin/files?relatedModule=&relatedId=` (list metadata for an owner, no signed URLs) to the collection route — not explicitly scoped in Phase 1, but Phase 2's Vault attachment list needs exactly this and it's a few lines on top of the existing route rather than a new file, so it shipped now instead of being a mid-Phase-2 addition.

### Phase 1 spec (as originally planned)

**Deps:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

**Env vars (new):**
```
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
```

### 1.1 `src/lib/storage/r2-provider.ts` [NEW]
`S3Client` pointed at `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, `region: "auto"`. Private bucket — no public-read policy, no custom domain. `upload()` → `PutObjectCommand` keyed as `{folder}/{timestamp}-{sanitized fileName}` (mirrors `generateImageName()`'s sanitization in `src/lib/image-naming.ts`, reused rather than reinvented). `delete()` → `DeleteObjectCommand`. `getSignedUrl()` → `@aws-sdk/s3-request-presigner`'s `getSignedUrl` with `GetObjectCommand`, default 5 min expiry.

### 1.2 Prisma model
```prisma
// --- File storage ---
// Generic file record for anything not served through Cloudinary's image
// pipeline. `provider`/`providerFileId` point at wherever the bytes actually
// live; relatedModule/relatedId is a soft (unconstrained) polymorphic link —
// deleting the owning row (e.g. a VaultItem) must explicitly also delete its
// FileAssets in application code, there is no cascading FK across modules.
model FileAsset {
  id             String   @id @default(uuid())
  provider       String   // "r2" | "drive"
  providerFileId String
  folder         String
  name           String
  mimeType       String
  size           Int?
  relatedModule  String   // "vault" | "jobs" | "blogs" | ...
  relatedId      String?
  mirrorOfId     String?  // set on a Drive backup copy, points at the R2 FileAsset it mirrors (Phase 4)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@map("file_asset")
}
```
Migration: `npx prisma migrate dev --name add_file_asset`

### 1.3 API routes (`verifyAdmin()` pattern)
- `src/app/api/admin/files/route.ts` [NEW] → `POST` (multipart, `relatedModule`/`relatedId` in the form data, streams buffer to `r2Provider.upload()`, writes `FileAsset` row)
- `src/app/api/admin/files/[id]/route.ts` [NEW] → `GET` (returns `{ url: signedUrl }`, 5 min expiry — client fetches this then opens/downloads the signed URL directly, no byte-proxying needed since R2 signed URLs are safe to hand to an already-authenticated admin), `DELETE` (deletes both the R2 object and the `FileAsset` row)

No generic "files" UI page yet — this phase only ships the primitive. Phase 2 is what makes it usable.

---

## Phase 2 — Wire into Vault attachments ✅ COMPLETE

Picks up exactly what `vault-plan.md`'s "Explicitly deferred" section flagged as blocked on storage.

**Shipped:** `VaultItemSheet` gained an "Attachments" section (list + "Add file" button, sits between Fields and Activity) — upload goes through the existing `POST /api/admin/files` with `relatedModule: "vault"`/`relatedId: <item.id>`, list via `GET /api/admin/files?relatedModule=vault&relatedId=...`. Store gained `fetchVaultAttachments`/`uploadVaultAttachment`/`deleteVaultAttachment`/`revealVaultAttachment` (`usePortfolioStore.ts`) plus `VaultAttachmentData`/`VaultAttachmentRevealResult` types. New `useVaultAttachmentReveal()` hook in `useVaultReauth.tsx`, third instance of the same `useVaultReauthFlow<T>()` pattern reveal/restore already used — download shares the one `PasswordPrompt` shape, just a third rendered instance. `DELETE /api/admin/vault/[id]` now walks `FileAsset` rows for that item, deletes each R2 object, then the rows, before removing the item itself (no DB cascade across the module boundary, per the plan). `npx tsc --noEmit`, `eslint`, and `next build` all pass clean; every route smoke-tested against the running dev server → 401 unauthenticated, `/admin/dashboard/vault` → 200.

**Deviation from plan — real bug, not a naming preference:** the attachment-download route is `POST /api/admin/vault/[id]/attachments/[fileId]/download`, not `.../reveal` as originally planned. The `/reveal` name **hung indefinitely** under `next dev` (Turbopack) — verified as a genuine deadlock (0% CPU, request never completes, across two independent dev-server restarts), not just a slow first compile. Bisected by binary-cutting the route down to a 3-line handler at the same path: still hung. The one structural anomaly: `vault/[id]/reveal/route.ts` (field reveal, pre-existing) and `vault/[id]/attachments/[fileId]/reveal/route.ts` (new) both terminate in a leaf folder literally named `reveal`, at different depths under the same `[id]` dynamic ancestor — renaming the leaf segment to `download` fixed it instantly, on the first request, no other change. `next build` (production) compiled the original `.../reveal` path without any issue, so this is specifically a `next dev` Turbopack route-resolution bug in Next 16.1.7, not a code defect — worth remembering if a future route ever wants to reuse a leaf name that already exists elsewhere under the same dynamic segment tree.

- Attachment downloads are re-auth-gated the same as field reveal — reuses the `useVaultReauthFlow<T>()` machinery from Phase 4 of `vault-plan.md` rather than a new prompt. Treating every attachment as equally sensitive (no "this one's not a secret" exception) matches the vault's existing "nothing here is public" posture and avoids a per-attachment sensitivity setting nobody will maintain correctly.
- Attachment *delete* is plain-admin-gated, not re-auth-gated — matches how deleting the whole `VaultItem` itself only needs `verifyAdmin()`, not a password re-prompt; only reading a secret's contents earns the extra step.

---

## Phase 3 — Google Drive provider (backup layer) ✅ COMPLETE

**Shipped:** `"https://www.googleapis.com/auth/drive.file"` added to `GMAIL_SCOPES` in `src/modules/gmail/service/client.ts`, plus `getDriveClient()` next to `getGmailClient()`/`getCalendarClient()` on the same `getAuthorizedClient()` base. `src/lib/storage/drive-provider.ts` [NEW] implements `StorageProvider`: `upload()` streams a `Buffer` into Drive via `Readable.from()` + `drive.files.create()` (parented under `DRIVE_FOLDER_<MODULE>` if that env var is set, Drive root otherwise); `delete()` → `drive.files.delete()`; `getSignedUrl()` returns the proxy path `/api/admin/files/${id}/download` rather than a real presigned URL, since Drive has no equivalent. New `src/lib/storage/index.ts` centralizes provider lookup (`getStorageProvider(provider)`) so `files/[id]/route.ts` doesn't hand-roll its own `if/else`. New `GET /api/admin/files/[id]/download` route: redirects to a real presigned URL for `provider: "r2"`, streams bytes server-side for `provider: "drive"` (`Readable.toWeb()` on the Drive SDK's response stream) — the client never sees a raw Drive link or this account's access token. `DRIVE_FOLDER_VAULT`/`DRIVE_FOLDER_BACKUPS` added to `.env.example`. `tsc`, `eslint`, and `next build` all pass clean; every route (including the new download proxy) smoke-tested live → 401 unauthenticated, no repeat of the Phase 2 Turbopack leaf-name hang (verified directly, since `files/[id]/download` and `vault/[id]/attachments/[fileId]/download` share a leaf name but sit under different top-level route trees, not the same `[id]` ancestor).

**Deviation from plan — interface change, not just an addition:** `StorageProvider.getSignedUrl()` originally took just `providerFileId`; shipped as `getSignedUrl({ id, providerFileId })` instead. Reason: Drive's implementation needs the `FileAsset`'s own database `id` to build the proxy path `/api/admin/files/${id}/download` — `providerFileId` alone (Drive's own file id) isn't enough, and R2's implementation just ignores the extra field. Discovered while implementing, not anticipated in the original interface sketch.

**Known gap, deliberately not closed yet:** the Vault attachment download route (`vault/[id]/attachments/[fileId]/download`) still hardcodes `r2Provider` rather than using `getStorageProvider(asset.provider)`, even though it now theoretically could. Reason: a Drive-backed `FileAsset`'s `getSignedUrl()` returns a proxy path through the *generic* `/api/admin/files/[id]/download` route, which is only `verifyAdmin()`-gated — not re-auth-gated like every other way of reading a Vault secret's contents. Generalizing that call site today would silently downgrade a Drive-mirrored attachment's download to a lower security tier than its R2 original. Not a problem yet (Phase 4 is the first thing that would ever create a Drive-provider row for a Vault attachment), but whoever builds Phase 4 needs to either carry the reauth gate into the proxy route for Vault-owned files, or keep Vault attachment downloads permanently pinned to `r2Provider` and treat "download the Drive backup copy" as a separate, explicitly-lower-trust action (e.g. only reachable from Drive itself, never through this app's UI).

**Not yet exercised:** Gmail needs to be reconnected once (`/api/admin/gmail/connect`) before `getDriveClient()` actually works — the currently-connected account predates the `drive.file` scope, same caveat the file already documented for `calendar.events`. Nothing calls `driveProvider` yet (Phase 4 is what will), so this hasn't been tested end-to-end against a real Drive folder.

- Drive folder IDs as env vars, created once by hand in the Drive UI:
```
DRIVE_FOLDER_VAULT=""
DRIVE_FOLDER_BACKUPS=""
```

---

## Phase 4 — "Back up to Drive" action ✅ COMPLETE

**Shipped:** `POST /api/admin/files/[id]/backup-to-drive` [NEW] — `verifyAdmin()`-gated (plain, not re-auth — same tier as attachment delete, since this reads server-to-server and never returns plaintext to the client), rejects non-`"r2"` source rows with 400, idempotent (a second click returns the existing mirror instead of uploading a duplicate — checked via `findFirst({ mirrorOfId, provider: "drive" })`). Downloads the source through `r2Provider.getSignedUrl()` + a server-side `fetch()`, re-uploads via `driveProvider.upload()`, writes the mirror `FileAsset` row. Store gained `backupFileToDrive(fileId)`; `VaultAttachmentData` gained `provider`/`mirrorOfId`. `VaultItemSheet`'s attachment list now filters to `provider: "r2"` rows only (`r2Attachments`) — Drive-mirror rows never render as their own list item, only as a `mirroredSourceIds` lookup that swaps a source row's "Back up to Drive" button for a "✓ Backed up to Drive" badge. This is the concrete resolution of Phase 3's "known gap" note: rather than generalizing the reauth-gated vault attachment download route to handle Drive rows (which would need the reauth gate carried into the generic proxy first), Drive-mirror rows are simply never independently reachable through this app's UI at all — by omission from the list, not by a route-level block.

**Verified live, end-to-end, against the real dashboard, real R2 bucket, and real Drive account** (not just route-level 401 checks): logged into the actual running dev server via browser automation, opened a real Vault item, uploaded a real file — confirmed it landed in R2 and the DB (`provider: "r2"`). Clicked "Back up to Drive" — confirmed a second `FileAsset` row appeared with `provider: "drive"`, `mirrorOfId` pointing at the original, and the UI immediately swapped the button for the "Backed up to Drive" badge. Confirmed only the R2 row rendered as a list item throughout — the Drive mirror never appeared as its own row. Test data (both the R2 object and the Drive file, plus both DB rows) cleaned up afterward via a throwaway script; the vault item's real fields were never touched.

**Notable hiccup, not a code bug:** browser automation against the already-running dev server repeatedly hit a barrage of phantom native file-chooser dialogs (Playwright/CDP re-delivering stale `filechooser` events) that had nothing to do with the app — confirmed by checking the database directly instead of trusting the accessibility-tree snapshot (which, misleadingly, showed the uploaded filename as "visible" even when an OS file-picker dialog was the thing actually showing it, before any real upload had happened). Worth remembering: verify state changes here through the API/DB, not just what the browser snapshot claims is on screen, when many dialogs are queued.

---

## Explicitly deferred (not in this plan's scope)

- **Public-facing file delivery via R2 custom domain/CDN** — only relevant if this ever needs to serve public files; Cloudinary still owns that job for images.
- **Provider picker in the upload UI** — R2 is simply the default, Drive backup is the explicit Phase 4 action. No dropdown needed unless a real third provider shows up.
- **Auto-mirroring every upload to Drive** — opt-in only for now (see Phase 4).
- **Job Tracker resume/cover-letter file uploads** — `resumeVersion`/`coverLetterVersion` on `JobApplication` are free-text version labels today, not file uploads (confirmed in `AddJobDialog.tsx` — plain text inputs with a datalist of past values). Wiring actual resume-file storage through `FileAsset` is a natural Phase 5 if wanted, but is a separate scope decision, not assumed here.
- **Blog attachment storage** — Blog covers stay on Cloudinary (images, need transforms); non-image blog attachments through `FileAsset` would be the same shape as Phase 2 but isn't scoped until there's an actual use case.

---

## All planned phases shipped

Phases 1–4 are complete and verified live against real R2/Drive/Vault data (not just route-level checks). What remains is the "Explicitly deferred" list above — intentionally held back, not forgotten.

---

## Open questions

None outstanding.

Resolved: R2 bucket/token are live and verified end-to-end. Attachment downloads are re-auth-gated with no exceptions (§Phase 2). Gmail has been reconnected with the `drive.file` scope and Drive connectivity is confirmed working (§Phase 3). Drive-mirrored Vault attachments are permanently unreachable through this app's own UI by omission from the attachment list, not a route-level block — resolves the "known gap" from Phase 3 (§Phase 4). **Drive folder IDs** — the `DRIVE_FOLDER_VAULT`/`DRIVE_FOLDER_BACKUPS` env vars this item originally flagged as unset have been replaced entirely: `driveProvider` now finds-or-creates its own folder tree in Drive automatically (root folder + per-module/per-path subfolders), no manual Drive setup or env vars required. See `file-manager-plan.md` Phase 9.
