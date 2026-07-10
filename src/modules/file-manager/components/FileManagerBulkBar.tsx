'use client';

import { Download, FolderInput, Link2, Trash2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileManagerBulkBarProps {
  count: number;
  canDownload: boolean;
  canShare: boolean;
  canCopyToDrive: boolean;
  onMove: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
  onCopyToDrive: () => void;
  onDeselect: () => void;
}

// Replaces the toolbar's action buttons once 1+ items are selected — search/
// sort/view-mode stay put, only the right-hand actions change context.
export function FileManagerBulkBar({
  count,
  canDownload,
  canShare,
  canCopyToDrive,
  onMove,
  onDelete,
  onDownload,
  onShare,
  onCopyToDrive,
  onDeselect,
}: FileManagerBulkBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
      <span className="text-sm font-medium whitespace-nowrap">
        {count} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
        {canDownload && (
          <Button variant="outline" size="sm" onClick={onDownload} className="bg-background" aria-label="Download">
            <Download className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Download</span>
          </Button>
        )}
        {canShare && (
          <Button variant="outline" size="sm" onClick={onShare} className="bg-background" aria-label="Share">
            <Link2 className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Share</span>
          </Button>
        )}
        {canCopyToDrive && (
          <Button variant="outline" size="sm" onClick={onCopyToDrive} className="bg-background" aria-label="Copy to Drive">
            <UploadCloud className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Copy to Drive</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onMove} className="bg-background" aria-label="Move">
          <FolderInput className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Move</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="bg-background text-destructive hover:text-destructive" aria-label="Delete">
          <Trash2 className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Delete</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onDeselect} aria-label="Deselect">
          <X className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Deselect</span>
        </Button>
      </div>
    </div>
  );
}
