import { FileText, FileImage, FileArchive, FileAudio, FileVideo, FileCode, File as FileIcon, LucideIcon } from "lucide-react";
import { FolderTreeItem, FileManagerFileData } from "@/store/usePortfolioStore";

export interface FolderTreeNode extends FolderTreeItem {
  children: FolderTreeNode[];
}

export function buildFolderTree(flat: FolderTreeItem[]): FolderTreeNode[] {
  const map = new Map<string, FolderTreeNode>();
  flat.forEach((f) => map.set(f.id, { ...f, children: [] }));
  const roots: FolderTreeNode[] = [];
  flat.forEach((f) => {
    const node = map.get(f.id)!;
    if (f.parentId && map.has(f.parentId)) {
      map.get(f.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// A folder id and everything under it — used to block "move into own subfolder".
export function collectDescendantIds(flat: FolderTreeItem[], rootId: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  flat.forEach((f) => {
    if (!f.parentId) return;
    childrenOf.set(f.parentId, [...(childrenOf.get(f.parentId) ?? []), f.id]);
  });
  const result = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const id = queue.pop()!;
    for (const childId of childrenOf.get(id) ?? []) {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    }
  }
  return result;
}

export type SortBy = "name" | "date" | "size";
export type ViewMode = "grid" | "list";

// The file variant carries the full FileManagerFileData (not just a subset)
// so callers never need to re-look-up the file in some folder-scoped list —
// this is what lets Recent Files (which spans every folder, not just the
// currently open one) drive the exact same context menu as the grid.
export type ContextMenuTarget =
  | { type: "folder"; id: string; name: string; fileCount: number; subfolderCount: number }
  | { type: "file"; id: string; name: string; file: FileManagerFileData; mirrored: boolean };

type FileIconCategory = "image" | "video" | "audio" | "pdf" | "code" | "archive" | "generic";

// Returns a category key rather than a component reference — callers do a
// plain FILE_ICON_MAP[category] property lookup, the same pattern used for
// icons elsewhere in this codebase (e.g. `item.icon`), which keeps the
// component reference a stable property access instead of a fresh value
// from a function call on every render.
export function getFileIconCategory(mimeType: string): FileIconCategory {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("xml")) return "code";
  if (mimeType.includes("zip") || mimeType.includes("compressed") || mimeType.includes("tar")) return "archive";
  return "generic";
}

export const FILE_ICON_MAP: Record<FileIconCategory, LucideIcon> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  pdf: FileText,
  code: FileCode,
  archive: FileArchive,
  generic: FileIcon,
};

// Tinted tile backgrounds per type, matching the reference design — icon
// color follows the tint so it stays legible in both themes.
export const FILE_ICON_BG: Record<FileIconCategory, string> = {
  image: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  video: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
  audio: "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
  pdf: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  code: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
  archive: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  generic: "bg-muted text-muted-foreground",
};

export const FOLDER_ICON_BG = "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";

// Human-readable "Type" column value, e.g. "PDF Document", "PNG Image".
const MIME_LABEL_OVERRIDES: Record<string, string> = {
  "application/pdf": "PDF Document",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
  "application/vnd.ms-excel": "Excel Spreadsheet",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel Spreadsheet",
  "text/csv": "CSV Spreadsheet",
  "text/plain": "Text File",
  "application/zip": "ZIP Archive",
  "application/json": "JSON File",
};

export function humanReadableType(mimeType: string): string {
  if (MIME_LABEL_OVERRIDES[mimeType]) return MIME_LABEL_OVERRIDES[mimeType];
  const [type, subtype] = mimeType.split("/");
  if (!subtype) return mimeType;
  const label = subtype.split(/[+.-]/)[0].toUpperCase();
  if (type === "image") return `${label} Image`;
  if (type === "video") return `${label} Video`;
  if (type === "audio") return `${label} Audio`;
  return `${label} File`;
}

export function isPreviewable(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf" || mimeType.startsWith("text/");
}

// "dropfolder:<id>" targets accept both file and folder drags; "root" is the
// sentinel for the file-manager top level (no FileManagerFolder row for it).
export function folderDropId(folderId: string | null): string {
  return `dropfolder:${folderId ?? "root"}`;
}

export function parseFolderDropId(dropId: string): string | null {
  const id = dropId.replace(/^dropfolder:/, "");
  return id === "root" ? null : id;
}

// Selection + drag share one id scheme ("file:<id>" / "folder:<id>") so a
// selected item's id and its draggable id are always the same string.
export function fileItemId(id: string): string {
  return `file:${id}`;
}
export function folderItemId(id: string): string {
  return `folder:${id}`;
}
export function parseItemId(itemId: string): { type: "file" | "folder"; id: string } | null {
  if (itemId.startsWith("file:")) return { type: "file", id: itemId.slice(5) };
  if (itemId.startsWith("folder:")) return { type: "folder", id: itemId.slice(7) };
  return null;
}
