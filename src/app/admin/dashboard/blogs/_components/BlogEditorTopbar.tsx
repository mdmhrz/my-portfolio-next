'use client';

import Link from "next/link";
import { ArrowLeft, Loader2, Save, Globe, FileText, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BlogEditorTopbarProps {
  saveStatus: SaveStatus;
  published: boolean;
  wordCount: number;
  readingTime: number;
  saving: boolean;
  isNew: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const statusConfig: Record<SaveStatus, { label: string; icon: React.ReactNode; className: string }> = {
  idle:   { label: 'Unsaved changes', icon: null, className: 'text-muted-foreground' },
  saving: { label: 'Saving…',        icon: <Loader2 className="h-3 w-3 animate-spin" />, className: 'text-muted-foreground' },
  saved:  { label: 'Saved',          icon: <Check className="h-3 w-3 text-emerald-500" />, className: 'text-emerald-600 dark:text-emerald-400' },
  error:  { label: 'Save failed',    icon: <AlertCircle className="h-3 w-3 text-red-500" />, className: 'text-red-500' },
};

export function BlogEditorTopbar({
  saveStatus,
  published,
  wordCount,
  readingTime,
  saving,
  isNew,
  onSaveDraft,
  onPublish,
}: BlogEditorTopbarProps) {
  const status = statusConfig[saveStatus];

  return (
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
      {/* Left — back + status */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard/blogs"
          className="group flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Posts
        </Link>

        <span className="h-4 w-px bg-border" />

        {!isNew && (
          <span className={`flex items-center gap-1.5 text-xs font-mono ${status.className}`}>
            {status.icon}
            {status.label}
          </span>
        )}
      </div>

      {/* Centre — stats */}
      <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
        <span>{wordCount.toLocaleString()} words</span>
        <span className="h-3 w-px bg-border" />
        <span>{readingTime} min read</span>
        {published && (
          <>
            <span className="h-3 w-px bg-border" />
            <Badge variant="default" className="h-5 text-xs">Published</Badge>
          </>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={saving}
          onClick={onSaveDraft}
          className="h-8 text-xs"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isNew ? 'Save Draft' : 'Save'}
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={onPublish}
          className="h-8 text-xs"
        >
          {published ? (
            <>
              <FileText className="h-3.5 w-3.5" />
              Unpublish
            </>
          ) : (
            <>
              <Globe className="h-3.5 w-3.5" />
              Publish
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
