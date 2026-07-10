# File Manager — Implementation Plan
> A standalone document-management module (folders, upload, move, rename, delete, preview, Drive backup) built on top of the existing R2/Drive storage layer from [`storage-integration-plan.md`](./storage-integration-plan.md).

---

## Why this shape

`storage-integration-plan.md` shipped the *storage primitive* — `FileAsset`, `StorageProvider` (R2 + Drive), and one consumer (Vault attachments). This plan adds a second, independent consumer: a real file explorer at `/admin/dashboard/files`, not a Vault feature.

Key decisions:

- **Real folders, not string paths.** New `FileManagerFolder` model, self-referencing (`parentId`), unlimited depth. String-path folders (`"Clients/ABC Ltd/"`) can't be renamed or moved without rewriting every descendant path — a real FK tree makes rename/move O(1) and delete a single cascading query.
- **`FileAsset` gains one new nullable field, nothing else changes.** `folderId` points at a `FileManagerFolder`. Existing rows (Vault attachments, Drive mirrors) keep `folderId: null` — they're untouched, unaffected, and the field is simply irrelevant to them. `relatedModule: "file-manager"` / `relatedId: null` marks a `FileAsset` as belonging to this module, mirroring how `"vault"` rows already work.
- **No new storage code.** Upload goes through the same `r2Provider`; "Copy to Drive" reuses the *exact* existing `POST /api/admin/files/[id]/backup-to-drive` route unchanged — that route already only cares about `provider: "r2"` → `"drive"`, not which module owns the row. This is the payoff of the Phase-1-4 abstraction: a second consumer costs zero storage-layer code.
- **Folder delete is recursive, not blocked.** Matches the precedent already set by `DELETE /api/admin/vault/[id]` (deletes attachments before the item, no orphaned rows). A folder delete: (1) collects every descendant folder id in JS (small personal dataset, no need for a recursive SQL CTE), (2) deletes every `FileAsset` in that subtree from its storage provider first (R2/Drive bytes, not just DB rows), (3) one `prisma.fileManagerFolder.delete()` on the top folder, which cascades the DB-side folder tree and `FileAsset` rows automatically (`onDelete: Cascade` on both self-relation and the `FileAsset.folderId` relation). Confirmation dialog shows the file/subfolder count before this fires.
- **`@dnd-kit` is already a dependency** (used by the Job Tracker Kanban board) — reused for in-app drag-to-move (files/folders onto folder-tree targets), following the exact `PointerSensor` + `closestCenter` + `useDroppable` pattern already established in `KanbanBoard.tsx`. OS-file drag-drop (dragging a file from the desktop into the browser) is separate — plain native `dragover`/`drop` DOM events, since dnd-kit doesn't handle `DataTransfer.files`.
- **Right-click menu reuses `ui/dropdown-menu.tsx`**, not a new `context-menu.tsx` primitive — no new Radix package. `onContextMenu` opens the same dropdown at the cursor position instead of anchored to a trigger button.
- **Preview needs no new backend route.** The existing `GET /api/admin/files/[id]` (signed URL) is enough — the modal just decides how to render based on `mimeType` (image → `<img>`, PDF → `<iframe>`, text/* → fetched and shown as plain text). Anything else falls back to a "no preview available, download instead" state.
- **One Zustand store, no new state library.** File Manager state (current folder, breadcrumb, listing, view mode, search/sort) is added to the existing `usePortfolioStore.ts` as its own section, same pattern as the Vault attachment actions already there.

---

## Data model

```prisma
// --- File Manager ---
// Real folder tree for the standalone /admin/dashboard/files explorer.
// FileAsset.folderId points here; Vault/other-module FileAsset rows leave
// it null and are unaffected. Deleting a folder cascades its subtree (DB
// rows) — application code deletes the underlying storage bytes for every
// FileAsset in that subtree *before* issuing the cascading delete.
model FileManagerFolder {
  id        String              @id @default(uuid())
  name      String
  parentId  String?
  parent    FileManagerFolder?  @relation("FolderTree", fields: [parentId], references: [id], onDelete: Cascade)
  children  FileManagerFolder[] @relation("FolderTree")
  files     FileAsset[]
  createdAt DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  @@unique([parentId, name])
  @@map("file_manager_folder")
}
```

`FileAsset` gains:
```prisma
  folderId  String?
  folderRef FileManagerFolder? @relation(fields: [folderId], references: [id], onDelete: Cascade)
```
(`folder: String`, the existing provider-path-prefix field, is untouched — different concept, same model, kept side by side with a clarifying comment.)

Root of the file manager = `folderId: null` **and** `relatedModule: "file-manager"`.

---

## API routes

- `POST /api/admin/folders` — `{ name, parentId }` → create. 409 on duplicate name within the same parent (`@@unique([parentId, name])`).
- `GET /api/admin/folders?parentId=<id|root>` — list immediate subfolders of a folder (or root), each with `fileCount`/`subfolderCount` for the grid.
- `GET /api/admin/folders?tree=1` — full folder tree (flat list, id/name/parentId), client builds the recursive sidebar tree in memory.
- `GET /api/admin/folders/[id]` — `{ folder, breadcrumb }`, breadcrumb built by walking `parentId` up to root.
- `PATCH /api/admin/folders/[id]` — `{ name? , parentId? }` → rename and/or move.
- `DELETE /api/admin/folders/[id]` — recursive delete as described above.
- `GET /api/admin/files` — **extended**, not duplicated: new optional `folderId` query param (`"root"` → `folderId: null`, uuid → that folder, omitted → unfiltered, preserving existing Vault behavior unchanged).
- `POST /api/admin/files` — **extended**: accepts optional `folderId` field in the multipart form data.
- `PATCH /api/admin/files/[id]` — **new**: `{ name?, folderId? }` → rename and/or move a file. (`GET`/`DELETE` on this route already exist and need no changes.)
- `POST /api/admin/files/[id]/backup-to-drive` — **unchanged, reused as-is**.

All routes `verifyAdmin()`-gated, matching every other admin route. No re-auth gate — this module never touches Vault secrets.

---

## Store (`usePortfolioStore.ts`)

New section, same file: `FileManagerFolderData`/`FileManagerFileData` types; state (`fmCurrentFolderId`, `fmBreadcrumb`, `fmFolders`, `fmFiles`, `fmTree`, `fmViewMode`, `fmSearchQuery`, `fmSortBy`); actions (`fetchFolderContents`, `fetchFolderTree`, `createFolder`, `renameFolder`, `moveFolder`, `deleteFolder`, `uploadFileToFolder`, `renameFile`, `moveFile`, `deleteFile` — `backupFileToDrive` already exists and is reused untouched).

---

## UI — `src/modules/file-manager/` + `/admin/dashboard/files`

- `page.tsx` (thin) → `FileManagerPageContents.tsx` (orchestration: current folder, dnd context, dialogs)
- `FolderTreeSidebar.tsx` — recursive expand/collapse tree, `useDroppable` per node
- `Toolbar.tsx` — search, sort, grid/list toggle, New Folder, Upload
- `FileGrid.tsx` (handles both grid and list layouts via a prop) — draggable items, droppable folder tiles, `onContextMenu` → positioned dropdown
- `CreateFolderDialog.tsx`, `RenameDialog.tsx`, `MoveDialog.tsx`, `DeleteConfirmDialog.tsx` (recursive count warning)
- `FilePreviewModal.tsx` — image/PDF/text preview via the existing signed-URL route
- `FileManagerSkeleton.tsx`, `EmptyState.tsx`
- Sidebar nav: new entry in `NAV_GROUPS` (`_components/nav-items.tsx`) pointing at `/admin/dashboard/files`

Design system: `ui/breadcrumb.tsx`, `ui/dropdown-menu.tsx`, `ui/dialog.tsx`, `ui/alert-dialog.tsx`, `ui/skeleton.tsx`, `ui/card.tsx` — all existing, no new primitives except icons from the already-installed `lucide-react`.

---

## Phases — ✅ ALL SHIPPED

1. **Data + API** — `FileManagerFolder` model, migration, folder CRUD routes, `files` route extensions (`folderId`), new `PATCH /api/admin/files/[id]`.
2. **Store** — Zustand actions/types for folders + files-in-folder.
3. **UI shell** — page route, sidebar nav entry, folder tree, breadcrumb, toolbar, grid/list rendering, skeleton, empty state (no drag/context-menu yet — read/navigate only).
4. **File + folder operations** — create/rename/move/delete dialogs, upload (button + native OS drag-drop), preview modal, "Copy to Drive" button reusing the existing route.
5. **Drag-to-move + right-click menu** — dnd-kit wiring for in-app moves, `onContextMenu` dropdown.
6. **Verification** — `tsc`, `eslint`, `next build`, live smoke test against the real dashboard; update this doc with what shipped.

Detailed per-phase checklist, what deviated from this doc while building, and the bugs live testing turned up (plus their fixes) are tracked in [`file-manager-work-procedure.md`](./file-manager-work-procedure.md) rather than duplicated here. Headline deviations worth calling out at this level:

- `StorageProvider.getSignedUrl`'s existing `{ id, providerFileId }` shape (from `storage-integration-plan.md` Phase 3) needed no changes — the File Manager is a second consumer of the exact same primitive, proving out the abstraction.
- The existing `POST /api/admin/files/[id]/backup-to-drive` route needed one small fix (copy `folderId` onto the mirror row) to keep Drive backups colocated with their source in the tree — a no-op for Vault rows, which never set `folderId`.
- Moving/deleting a file with a Drive backup required teaching `PATCH`/`DELETE /api/admin/files/[id]` to keep the mirror row in sync (move it along / delete it too) — otherwise mirrors silently went stale or orphaned. Fixing this surfaced and fixed a related pre-existing bug in Vault's own item-delete route (see work-procedure doc).

---

## Explicitly out of scope

- Sharing/public links, multi-user permissions (single-admin app).
- File versioning (a second upload with the same name is just a second `FileAsset`, no version history).
- Job Tracker resume/cover-letter wiring, Blog attachment wiring — separate future consumers of the same `FileAsset` primitive, not part of this plan.
