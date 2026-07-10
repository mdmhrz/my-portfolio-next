'use client';

import { useEffect, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Folder, MoreVertical, Check, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatFileSize } from '@/lib/utils';
import { usePortfolioStore, FileManagerFolderData, FileManagerFileData } from '@/store/usePortfolioStore';
import {
  getFileIconCategory,
  FILE_ICON_MAP,
  FILE_ICON_BG,
  FOLDER_ICON_BG,
  folderDropId,
  fileItemId,
  folderItemId,
  ContextMenuTarget,
  ViewMode,
} from './file-manager-constants';

interface FileManagerGridProps {
  subfolders: FileManagerFolderData[];
  files: FileManagerFileData[];
  mirroredSourceIds: Set<string>;
  viewMode: ViewMode;
  selectedIds: Set<string>;
  onSelect: (itemId: string, e: React.MouseEvent) => void;
  onClearSelection: () => void;
  onNavigateFolder: (id: string) => void;
  onOpenFile: (file: FileManagerFileData) => void;
  onContextMenu: (x: number, y: number, target: ContextMenuTarget) => void;
}

export function FileManagerGrid({
  subfolders,
  files,
  mirroredSourceIds,
  viewMode,
  selectedIds,
  onSelect,
  onClearSelection,
  onNavigateFolder,
  onOpenFile,
  onContextMenu,
}: FileManagerGridProps) {
  const wrapperClass =
    viewMode === 'grid'
      ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      : 'flex flex-col divide-y divide-border rounded-xl border border-border bg-background';

  return (
    <div className={wrapperClass} onClick={onClearSelection}>
      {subfolders.map((folder) => (
        <FolderTile
          key={folder.id}
          folder={folder}
          viewMode={viewMode}
          selected={selectedIds.has(folderItemId(folder.id))}
          onSelect={onSelect}
          onNavigate={onNavigateFolder}
          onContextMenu={onContextMenu}
        />
      ))}
      {files.map((file) => (
        <FileTile
          key={file.id}
          file={file}
          viewMode={viewMode}
          backedUp={mirroredSourceIds.has(file.id)}
          selected={selectedIds.has(fileItemId(file.id))}
          onSelect={onSelect}
          onOpen={onOpenFile}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}

function SelectedCheck() {
  return (
    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
      <Check className="h-3 w-3" />
    </div>
  );
}

function FolderTile({
  folder,
  viewMode,
  selected,
  onSelect,
  onNavigate,
  onContextMenu,
}: {
  folder: FileManagerFolderData;
  viewMode: ViewMode;
  selected: boolean;
  onSelect: (itemId: string, e: React.MouseEvent) => void;
  onNavigate: (id: string) => void;
  onContextMenu: (x: number, y: number, target: ContextMenuTarget) => void;
}) {
  const itemId = folderItemId(folder.id);
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: itemId });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: folderDropId(folder.id) });
  const setRefs = (el: HTMLElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };
  const target: ContextMenuTarget = { type: 'folder', id: folder.id, name: folder.name, fileCount: folder.fileCount, subfolderCount: folder.subfolderCount };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(itemId, e);
  };
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate(folder.id);
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e.clientX, e.clientY, target);
  };
  const handleMenuButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onContextMenu(rect.left, rect.bottom, target);
  };

  if (viewMode === 'list') {
    return (
      <div
        ref={setRefs}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'group flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-accent',
          selected && 'bg-primary/5 ring-1 ring-inset ring-primary/40',
          isOver && 'ring-2 ring-primary/60',
          isDragging && 'opacity-40'
        )}
      >
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', FOLDER_ICON_BG)}>
          <Folder className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{folder.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {folder.subfolderCount + folder.fileCount} item{folder.subfolderCount + folder.fileCount === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={handleMenuButton}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-border bg-background p-3 text-center shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md',
        selected && 'ring-2 ring-primary',
        isOver && 'ring-2 ring-primary/60',
        isDragging && 'opacity-40'
      )}
    >
      <button
        type="button"
        onClick={handleMenuButton}
        className="absolute right-1 top-1 rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
      {selected && <SelectedCheck />}
      <span className={cn('flex h-14 w-14 items-center justify-center rounded-lg', FOLDER_ICON_BG)}>
        <Folder className="h-7 w-7" />
      </span>
      <span className="w-full truncate text-xs font-medium">{folder.name}</span>
      <span className="text-[10px] text-muted-foreground">
        {folder.subfolderCount + folder.fileCount} item{folder.subfolderCount + folder.fileCount === 1 ? '' : 's'}
      </span>
    </div>
  );
}

function FileTile({
  file,
  viewMode,
  backedUp,
  selected,
  onSelect,
  onOpen,
  onContextMenu,
}: {
  file: FileManagerFileData;
  viewMode: ViewMode;
  backedUp: boolean;
  selected: boolean;
  onSelect: (itemId: string, e: React.MouseEvent) => void;
  onOpen: (file: FileManagerFileData) => void;
  onContextMenu: (x: number, y: number, target: ContextMenuTarget) => void;
}) {
  const itemId = fileItemId(file.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: itemId });
  const category = getFileIconCategory(file.mimeType);
  const Icon = FILE_ICON_MAP[category];
  const target: ContextMenuTarget = { type: 'file', id: file.id, name: file.name, file, mirrored: backedUp };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(itemId, e);
  };
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(file);
  };
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e.clientX, e.clientY, target);
  };
  const handleMenuButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onContextMenu(rect.left, rect.bottom, target);
  };

  if (viewMode === 'list') {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'group flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-accent',
          selected && 'bg-primary/5 ring-1 ring-inset ring-primary/40',
          isDragging && 'opacity-40'
        )}
      >
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', FILE_ICON_BG[category])}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
        {file.shareEnabled && (
          <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
            <Link2 className="h-3 w-3" /> Shared
          </Badge>
        )}
        {backedUp && (
          <Badge variant="secondary" className="shrink-0 gap-1 text-[10px]">
            <Check className="h-3 w-3" /> Drive
          </Badge>
        )}
        <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
        <button
          type="button"
          onClick={handleMenuButton}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        'group relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border bg-background p-3 text-center shadow-sm transition-colors hover:bg-accent',
        selected && 'ring-2 ring-primary',
        isDragging && 'opacity-40'
      )}
    >
      <button
        type="button"
        onClick={handleMenuButton}
        className="absolute right-1 top-1 rounded p-1 text-muted-foreground opacity-0 hover:bg-muted group-hover:opacity-100"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </button>
      {(backedUp || file.shareEnabled) && (
        <div className="absolute left-1 top-1 flex flex-col gap-0.5">
          {file.shareEnabled && (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[9px]">
              <Link2 className="h-2.5 w-2.5" />
            </Badge>
          )}
          {backedUp && (
            <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[9px]">
              <Check className="h-2.5 w-2.5" />
            </Badge>
          )}
        </div>
      )}
      {selected && <SelectedCheck />}
      {category === 'image' && file.provider === 'r2' ? (
        <FileThumbnail file={file} />
      ) : (
        <span className={cn('flex h-14 w-14 items-center justify-center rounded-lg', FILE_ICON_BG[category])}>
          <Icon className="h-7 w-7" />
        </span>
      )}
      <span className="w-full truncate text-xs font-medium">{file.name}</span>
      <span className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
    </div>
  );
}

// Lazy-loaded real thumbnail for image files — falls back to the icon tile
// while loading or on failure. Grid view only (list view stays icon-only
// for density, matching the reference design).
function FileThumbnail({ file }: { file: FileManagerFileData }) {
  const { getFileUrl } = usePortfolioStore();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFileUrl(file.id)
      .then(({ url: signedUrl }) => {
        if (!cancelled) setUrl(signedUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [file.id, getFileUrl]);

  if (!url || failed) {
    const Icon = FILE_ICON_MAP.image;
    return (
      <span className={cn('flex h-14 w-14 items-center justify-center rounded-lg', FILE_ICON_BG.image)}>
        <Icon className="h-7 w-7" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={file.name}
      onError={() => setFailed(true)}
      className="h-14 w-14 rounded-lg object-cover"
    />
  );
}
