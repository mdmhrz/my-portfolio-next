'use client';

import { Eye, Download, UploadCloud, Pencil, FolderInput, Trash2, Link2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isPreviewable, ContextMenuTarget } from './file-manager-constants';

export interface ContextMenuState {
  x: number;
  y: number;
  target: ContextMenuTarget;
}

interface FileManagerContextMenuProps {
  state: ContextMenuState | null;
  onClose: () => void;
  onPreview: (target: ContextMenuTarget) => void;
  onDownload: (target: ContextMenuTarget) => void;
  onShare: (target: ContextMenuTarget) => void;
  onCopyToDrive: (target: ContextMenuTarget) => void;
  onRename: (target: ContextMenuTarget) => void;
  onMove: (target: ContextMenuTarget) => void;
  onDelete: (target: ContextMenuTarget) => void;
}

// Right-click (and the per-tile "..." button) both funnel into this single
// controlled menu, positioned at the click point via an invisible 1x1
// trigger — reuses ui/dropdown-menu.tsx instead of adding a Radix
// context-menu dependency (see file-manager-plan.md).
export function FileManagerContextMenu({
  state,
  onClose,
  onPreview,
  onDownload,
  onShare,
  onCopyToDrive,
  onRename,
  onMove,
  onDelete,
}: FileManagerContextMenuProps) {
  if (!state) return null;
  const { target } = state;
  const isFile = target.type === 'file';

  return (
    <DropdownMenu open onOpenChange={(o) => !o && onClose()}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          style={{ position: 'fixed', left: state.x, top: state.y, width: 1, height: 1 }}
          className="pointer-events-none opacity-0"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-44">
        {isFile && isPreviewable(target.file.mimeType) && (
          <DropdownMenuItem onClick={() => onPreview(target)}>
            <Eye className="h-4 w-4" /> Preview
          </DropdownMenuItem>
        )}
        {isFile && (
          <DropdownMenuItem onClick={() => onDownload(target)}>
            <Download className="h-4 w-4" /> Download
          </DropdownMenuItem>
        )}
        {isFile && target.file.provider === 'r2' && (
          <DropdownMenuItem onClick={() => onShare(target)}>
            <Link2 className="h-4 w-4" /> Share
          </DropdownMenuItem>
        )}
        {isFile && target.file.provider === 'r2' && !target.mirrored && (
          <DropdownMenuItem onClick={() => onCopyToDrive(target)}>
            <UploadCloud className="h-4 w-4" /> Copy to Drive
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onRename(target)}>
          <Pencil className="h-4 w-4" /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMove(target)}>
          <FolderInput className="h-4 w-4" /> Move
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(target)}>
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
