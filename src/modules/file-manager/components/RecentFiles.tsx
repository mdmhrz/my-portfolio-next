'use client';

import { useEffect, useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { usePortfolioStore, FileManagerFileData } from '@/store/usePortfolioStore';
import { formatFileSize } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getFileIconCategory, FILE_ICON_MAP, FILE_ICON_BG, humanReadableType, ContextMenuTarget } from './file-manager-constants';

interface RecentFilesProps {
  version: number;
  onOpenFile: (file: FileManagerFileData) => void;
  onContextMenu: (x: number, y: number, target: ContextMenuTarget) => void;
}

// Shown only on the File Manager root, when there's no active search — a
// dashboard-style "what did I touch recently" view across every folder,
// reusing GET /api/admin/files?limit= rather than a dedicated route.
// `version` is bumped by the parent after any mutation (rename/move/delete/
// share/upload/...) so this list stays in sync even though it isn't part of
// the parent's own folder-scoped `files` state.
export function RecentFiles({ version, onOpenFile, onContextMenu }: RecentFilesProps) {
  const { fetchRecentFiles } = usePortfolioStore();
  const [items, setItems] = useState<FileManagerFileData[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRecentFiles(8).then((data) => {
      if (!cancelled) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchRecentFiles, version]);

  if (items !== null && items.length === 0) return null;

  // Recent Files spans every folder, so — unlike the main grid — it doesn't
  // cheaply know whether a given file already has a Drive mirror; "Copy to
  // Drive" is always offered here and is idempotent server-side if one
  // already exists.
  const contextTarget = (file: FileManagerFileData): ContextMenuTarget => ({
    type: 'file',
    id: file.id,
    name: file.name,
    file,
    mirrored: false,
  });

  return (
    <div className="space-y-3 pt-2">
      <h2 className="text-sm font-semibold text-foreground">Recent Files</h2>

      {/* Mobile: card list — a 5-column table has no room on narrow screens,
          so this mirrors the desktop table's data (name, type+size+modified,
          "..." menu) in a stacked layout instead of a horizontal scroller. */}
      <div className="space-y-2 sm:hidden">
        {items === null
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-3">
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          : items.map((file) => {
              const category = getFileIconCategory(file.mimeType);
              const Icon = FILE_ICON_MAP[category];
              return (
                <div
                  key={file.id}
                  onClick={() => onOpenFile(file)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3 active:bg-accent"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${FILE_ICON_BG[category]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatFileSize(file.size)} · {new Date(file.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      onContextMenu(rect.left, rect.bottom, contextTarget(file));
                    }}
                    className="shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
      </div>

      {/* Desktop / tablet: full table */}
      <div className="hidden rounded-xl border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items === null
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : items.map((file) => {
                  const category = getFileIconCategory(file.mimeType);
                  const Icon = FILE_ICON_MAP[category];
                  return (
                    <TableRow key={file.id} className="cursor-pointer" onClick={() => onOpenFile(file)}>
                      <TableCell className="max-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${FILE_ICON_BG[category]}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{humanReadableType(file.mimeType)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{formatFileSize(file.size)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(file.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            onContextMenu(rect.left, rect.bottom, contextTarget(file));
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-muted"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
