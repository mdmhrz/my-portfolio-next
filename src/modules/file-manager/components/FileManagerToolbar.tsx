'use client';

import { LayoutGrid, List, FolderPlus, Upload, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SortBy, ViewMode } from './file-manager-constants';

interface FileManagerToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  onNewFolder: () => void;
  onUploadClick: () => void;
  uploading: boolean;
}

export function FileManagerToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onNewFolder,
  onUploadClick,
  uploading,
}: FileManagerToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-muted/20 p-2.5">
      <div className="relative min-w-0">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search this folder…"
          className="bg-background pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortBy)}>
          <SelectTrigger className="w-[124px] bg-background sm:w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="date">Date added</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex shrink-0 items-center rounded-md border border-border bg-background p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn('rounded p-1.5 cursor-pointer', viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn('rounded p-1.5 cursor-pointer', viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onNewFolder} aria-label="New folder">
            <FolderPlus className="h-4 w-4 md:mr-1.5" /> <span className="hidden md:inline">New Folder</span>
          </Button>
          <Button size="sm" onClick={onUploadClick} disabled={uploading} aria-label="Upload">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin md:mr-1.5" /> : <Upload className="h-4 w-4 md:mr-1.5" />}
            <span className="hidden md:inline">Upload</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
