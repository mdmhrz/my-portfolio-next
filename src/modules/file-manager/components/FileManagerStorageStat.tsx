'use client';

import { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { formatFileSize } from '@/lib/utils';

// Real usage only — R2 has no fixed quota, so unlike the reference design's
// percentage bar this shows a plain total (see file-manager-plan.md Phase 10).
export function FileManagerStorageStat() {
  const { fetchStorageStats } = usePortfolioStore();
  const [stats, setStats] = useState<{ totalBytes: number; fileCount: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStorageStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchStorageStats]);

  if (!stats) return null;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <HardDrive className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Storage used</p>
        <p className="truncate text-sm font-semibold text-foreground">
          {formatFileSize(stats.totalBytes)}
          <span className="ml-1 font-normal text-muted-foreground">
            · {stats.fileCount} file{stats.fileCount === 1 ? '' : 's'}
          </span>
        </p>
      </div>
    </div>
  );
}
