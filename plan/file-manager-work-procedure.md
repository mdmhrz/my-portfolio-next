# File Manager — Work Procedure
> Execution checklist for [`file-manager-plan.md`](./file-manager-plan.md). Each phase is checked off and annotated here as it ships.

Phases 1–6 (data model, API, store, UI shell, dialogs/upload/preview/Drive-backup, drag-and-drop + context menu, verification) are ✅ COMPLETE — see the bottom of this file for that history. This section covers the v2 round of changes: redesign to match a provided mockup, click/select model, sharing, and Drive auto-organization.

---

## Phase 7 — Selection model (single-click select, double-click open) ✅ COMPLETE
- [x] `FileManagerGrid` tiles: single click toggles selection (ctrl/cmd = toggle one, shift = range-select in current sort order); double click opens (file → preview, folder → navigate)
- [x] Selected-state visual: ring + top-right checkmark badge (matches mockup), independent of the existing top-left "Drive" badge
- [x] Click on empty grid area clears selection
- [x] Keyboard: `Escape` clears selection, `Delete`/`Backspace` deletes the selection (with confirm), `Enter` opens a single selection
- [x] Bulk action bar replaces the toolbar's right side when 1+ items are selected: selection count, Move, Delete (any count), Download/Share/Copy to Drive (only enabled with exactly one file selected), Deselect

## Phase 8 — Share link ✅ COMPLETE
- [x] `r2Provider.getSignedUrl` / `GET /api/admin/files/[id]` accept an optional longer expiry (`?share=1` → 24h) instead of the default 5-minute read
- [x] Store action `shareFile(fileId)`; UI copies the URL to the clipboard via `navigator.clipboard.writeText` and toasts "Link copied — expires in 24h"
- [x] Share is r2-only — a Drive-provider row's "signed URL" is really our own admin-gated proxy path, never a real public link, so Share doesn't apply there (matches why Drive-mirror rows are never independently listed anyway)

## Phase 9 — Drive auto-organization (no more manual env-var folders) ✅ COMPLETE
- [x] `drive-provider.ts`: `findOrCreateFolder(name, parentId)` + `resolveDriveFolderPath(segments[])` — walks/creates a folder chain under one root app folder (`DRIVE_ROOT_FOLDER_NAME`, default `"Portfolio Dashboard"`)
- [x] `backup-to-drive` route now resolves a real path before uploading: Vault attachments → `Portfolio Dashboard/Vault`; File Manager files → `Portfolio Dashboard/File Manager/<breadcrumb...>`, mirroring the file's actual folder location
- [x] Removed `DRIVE_FOLDER_VAULT`/`DRIVE_FOLDER_BACKUPS` env vars — this resolves the "Open questions" item from `storage-integration-plan.md` for good; no manual Drive setup needed ever

## Phase 10 — Visual redesign + Recent Files + responsive polish ✅ COMPLETE
- [x] Colored per-type tiles (pdf/image/spreadsheet/folder get distinct tinted backgrounds), real lazy-loaded image thumbnails for `image/*` r2 files
- [x] Sidebar restyled to match mockup's active/count treatment; storage stat card shows **real** total bytes used (no fabricated quota/percentage — R2 has no fixed cap, faking one would be misleading)
- [x] "Recent Files" table on the File Manager root view (files across all folders, newest first) — `GET /api/admin/files` gained a `limit` param, reusing the existing route rather than a new one
- [x] Responsive pass: sidebar collapses under the grid on small screens as a horizontal folder strip, floating upload button on mobile — no separate bottom tab bar added, since the dashboard shell already owns mobile nav (`MobileSidebar`) and a second one would conflict architecturally

## Phase 11 — Verification ✅ COMPLETE
- [x] `npx tsc --noEmit` — clean
- [x] `eslint` on every new/changed file — clean (pre-existing `any` in `usePortfolioStore.ts` unrelated)
- [x] `next build` — clean
- [x] Live smoke test against the running dashboard — full click-through, all green

## Phase 12 — Share redesign: persistent public links + shared badge + Recent Files table ✅ COMPLETE
Follow-up round, in response to feedback after Phase 11: the "share = 24h presigned URL" from Phase 8 was replaced entirely.
- [x] `FileAsset` gained `shareEnabled` / `shareToken` (unique) / `shareExpiresAt` (nullable — null means shared until manually revoked), migration `add_file_share_link`
- [x] `POST/DELETE /api/admin/files/[id]/share` — create/update or revoke; revoke wipes the token (not just the flag) so a leaked/old link can never come back to life on re-share
- [x] Public `GET /s/[token]` (outside `/api/admin`, no `verifyAdmin`) — short, stable, permanent link; the actual bytes are served by minting a **fresh** 5-minute R2 presigned URL and redirecting on every visit, so a "never expires" share isn't bounded by R2 presign's own max-expiry window, and this also directly fixed the "link is too long" complaint (a raw presigned URL vs. `/s/5HAz9KXr3OTz`)
- [x] `ShareDialog.tsx` — expiry choice (1/7/30 days or never) when not yet shared; when already shared, shows the link + copy button + real expiry (or "never") + a "Stop sharing" action
- [x] "Shared" badge (Link2 icon) on grid/list tiles, alongside the existing "Backed up to Drive" badge — both can show at once
- [x] `RecentFiles.tsx` rebuilt as a real `Name / Type / Size / Modified` table (was a plain list) — added `humanReadableType(mimeType)` for the Type column
- [x] `npx tsc --noEmit`, `eslint`, `next build` all clean; live-tested the full loop: create link (never-expire) → confirmed `/s/<token>` actually redirects to a working signed URL → confirmed "Shared" badge renders → deleted the file → confirmed the same `/s/<token>` now 404s (no orphaned access after delete)
- One deploy note hit during testing, not a code bug: the long-running `next dev` process had a stale in-memory Prisma Client from before the migration — regenerating the client on disk doesn't hot-swap into an already-running Node process. Fixed by restarting the dev server; a real deploy (fresh process per build) wouldn't hit this.

## Phase 13 — Recent Files row context menu ✅ COMPLETE
- [x] `ContextMenuTarget`'s file variant now carries the full `FileManagerFileData` object (`file:`) instead of a flat `mimeType`/`provider` subset — lets a caller drive the exact same context menu without a folder-scoped `files.find()` lookup, which is what made this work correctly for Recent Files (spans every folder, not just the one currently open)
- [x] `RecentFiles.tsx` rows gained a "..." button (`MoreVertical`) wired to the same `FileManagerContextMenu` the grid uses — Preview/Download/Share/Copy to Drive/Rename/Move/Delete all work from a Recent Files row
- [x] `version` prop on `RecentFiles`, bumped by the parent's `refresh()` after any mutation, keeps the Recent Files list in sync even though it isn't part of the parent's folder-scoped `files` state
- [x] `ShareDialog` reworked to manage its own share state locally (seeded from the `file` prop, updated directly from API responses) instead of re-deriving from the parent's `files` list, for the same "may not be in the currently loaded folder" reason
- [x] `npx tsc --noEmit`, `eslint`, `next build` all clean; live-verified the "..." menu opens and every action fires correctly from a Recent Files row

## Phase 14 — Full responsive redesign ✅ COMPLETE
Follow-up round: the page overflowed content on mobile and looked visually flat/cluttered.
- [x] **Root cause of the mobile overflow**: the two-column layout (`grid lg:grid-cols-[240px_1fr]`) had no `min-w-0` on its grid items. A CSS grid item's automatic minimum width defaults to its content's max-content size unless told otherwise — so on mobile (single implicit column) the content column stretched to fit its widest descendant (the Recent Files table, ~660px) instead of the 342px actually available, and the ancestor `overflow-hidden` wrapper in `AdminShell` then clipped the excess instead of scrolling it, cutting content off. Fixed by adding `min-w-0` to the grid container and both grid items in `FileManagerPageContents.tsx`.
- [x] `FileManagerToolbar` restructured to always stack search (full width) above the sort/view/actions row; the actions row uses `flex-wrap` and hides New Folder/Upload button labels below `md` (icon-only) so it never gets squeezed at in-between widths (verified this was still cramped at 834px when search shared a row with the controls — fixed by never sharing that row)
- [x] `FileManagerBulkBar` action buttons follow the same icon-only-below-`sm` pattern — 6 possible actions plus a selection count no longer overflow a narrow bulk bar
- [x] `RecentFiles.tsx` now renders two layouts: a stacked card list (icon + name + size · date + "...") below `sm`, and the existing table at `sm` and up — the 5-column table has no reasonable way to fit a phone screen, and the reference mobile mockup used exactly this card pattern
- [x] Visual polish pass (the "ugly" part of the complaint, not just overflow): toolbar wrapped in a bordered/tinted card, folder tree + storage stat wrapped in matching cards with a "Folders"/"Storage used" label, storage stat restyled with an icon badge, grid tiles gained `rounded-2xl`, hover lift + shadow + primary-tinted border, grid breakpoints retuned (`2 → sm:3 → md:4 → lg:5 → xl:6`) to fit the now-narrower 240px-sidebar content column
- [x] `npx tsc --noEmit`, `eslint`, `next build` all clean; live-verified at 390px (mobile), 834px (tablet, the trickiest width since the admin shell's own sidebar is still visible there), and 1440px (desktop), in both light and dark theme, and confirmed via `scrollWidth`/`clientWidth` inspection that no element overflows its container at 390px anymore

### v2 design/scope decisions worth recording
- **Share link = signed URL, not real public sharing** (user's explicit choice over a public-token route): `GET /api/admin/files/[id]?share=1` returns a 24h presigned R2 URL instead of the default 5-minute one. r2-only — a Drive row's "signed URL" is our own admin-gated proxy, never a real link, so Share doesn't apply to Drive-mirror rows (consistent with why they're never listed independently).
- **Drive organization now needs zero manual setup**: `driveProvider` finds-or-creates its own root folder (`DRIVE_ROOT_FOLDER_NAME`, default "Portfolio Dashboard") and nested subfolders matching each file's actual module/folder path, replacing the old `DRIVE_FOLDER_VAULT`/`DRIVE_FOLDER_BACKUPS` env vars entirely — permanently resolves the open item from `storage-integration-plan.md`.
- **No fabricated storage quota.** The reference design's "62% / 12.4 GB of 20 GB" bar assumes a fixed cap R2 doesn't have; showing a fake percentage would be actively misleading for a real admin tool, so the sidebar shows real total bytes used instead.
- **No separate mobile bottom-nav bar**, even though the reference mobile mockup has one — the dashboard shell already owns mobile navigation (`MobileSidebar`), and a second bottom tab bar scoped to just this page would conflict with it. Mobile gets a horizontal-scroll folder strip in its place.
- Selection and drag-and-drop share one id scheme (`file:<id>` / `folder:<id>`) so a selected item's id and its draggable id are always the same string — no separate bookkeeping.

---

# Phases 1–6 history (original build)

## Phase 1 — Data + API ✅ COMPLETE
- [x] `FileManagerFolder` model + `FileAsset.folderId` added to `prisma/schema.prisma`
- [x] Migration created and applied (`add_file_manager_folder`)
- [x] `POST /api/admin/folders` (create) + `GET /api/admin/folders` (list children / `?tree=1` full tree)
- [x] `GET /api/admin/folders/[id]` (folder + breadcrumb)
- [x] `PATCH /api/admin/folders/[id]` (rename / move, with self/descendant-move guard)
- [x] `DELETE /api/admin/folders/[id]` (recursive: storage bytes deleted per-file, then one cascading DB delete)
- [x] `GET /api/admin/files` extended with `folderId` filter (`root` / id / omitted)
- [x] `POST /api/admin/files` extended to accept `folderId` in the multipart form
- [x] `PATCH /api/admin/files/[id]` (new — rename and/or move a file)
- [x] `npx tsc --noEmit` clean after Phase 1

## Phase 2 — Store ✅ COMPLETE
- [x] `usePortfolioStore.ts`: `FileManagerFolderData` / `FolderTreeItem` / `FileManagerFileData` / `FolderContentsResult` types
- [x] Actions: `fetchFolderTree`, `fetchFolderContents`, `createFolder`, `renameFolder`, `moveFolder`, `deleteFolder`, `uploadFileManagerFile`, `renameFile`, `moveFile`, `deleteFile` (`backupFileToDrive` reused as-is)
- Note: view mode / search / sort / "current folder" are page-local UI state (`FileManagerPageContents`), not global store state.
- [x] `npx tsc --noEmit` clean after Phase 2

## Phase 3 — UI shell ✅ COMPLETE
- [x] `/admin/dashboard/files` route, sidebar nav entry, `FolderTreeSidebar`, `FileManagerBreadcrumb`, `FileManagerToolbar`, `FileManagerGrid`, `FileManagerSkeletonGrid`; reused existing `@/components/admin/EmptyState`

## Phase 4 — File + folder operations ✅ COMPLETE
- [x] `CreateFolderDialog`, `RenameDialog`, `MoveDialog`; reused existing `DeleteDialog`
- [x] Upload button + native OS drag-drop
- [x] `FilePreviewModal` (image / PDF / text)
- [x] "Copy to Drive" wired to the existing `backup-to-drive` route — fixed that route to copy `folderId` onto the mirror row

## Phase 5 — Drag-to-move + context menu ✅ COMPLETE
- [x] dnd-kit `DndContext`, same `PointerSensor`/`closestCenter` pattern as `KanbanBoard.tsx`
- [x] Right-click (and a per-tile "⋮" button) → shared `FileManagerContextMenu`, a controlled `dropdown-menu.tsx` instance positioned at the cursor

## Phase 6 — Verification ✅ COMPLETE
- [x] `tsc`/`eslint`/`next build` clean
- [x] Live smoke test against the real dashboard, real R2/Drive — full click-through (create, upload, preview, rename, copy-to-drive, move, recursive delete)

### Lint fix notes (Phase 3–5)
- **"Cannot create components during render"** — fixed by splitting `getFileIcon` into `getFileIconCategory(mimeType): string` + a static `FILE_ICON_MAP` lookup object, so callers do a property access instead of a function call returning a component.
- **"Avoid calling setState() directly within an effect"** — `RenameDialog` dropped its sync effect for the `key={...}`-remount trick already used by `VaultItemDialog`; the folder-content/tree-loading effects were rewritten as inline promise chains (`.then/.catch/.finally`), matching the exempted pattern already working in `VaultPageContents.tsx`.

### Bugs found and fixed during live testing (Phase 6)
- **Stale mirror location on move** — `PATCH /api/admin/files/[id]` now also updates any Drive-mirror row's `folderId` to match.
- **Orphaned mirror on delete** — `DELETE /api/admin/files/[id]` now also deletes any Drive-mirror row.
- **Pre-existing Vault bug found by the same reasoning**: `DELETE /api/admin/vault/[id]` hardcoded `r2Provider.delete()` for every attachment, including Drive-mirror rows — silently never deleted the real Drive file. Fixed via `getStorageProvider(attachment.provider)`.
- **Client-side empty-state bug**: `isTrulyEmptyFolder` used the raw (unfiltered) file count instead of the filtered r2-only count, so a folder with only an orphaned mirror row read as "no search matches" instead of "empty."
