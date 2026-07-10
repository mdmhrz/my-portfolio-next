import { Skeleton } from '@/components/ui/skeleton';
import { JOB_STATUSES } from './job-constants';

// Mirrors KanbanBoard's real column + card layout — same column count/labels,
// same card anatomy (avatar+title row, badge row, meta lines, status bar) —
// so the loading state doesn't jump/reflow once real data arrives.
function JobCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-l-2 border-border bg-background p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );
}

export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {JOB_STATUSES.map((status, colIndex) => (
        <div key={status.value} className="w-80 shrink-0 rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-5 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: colIndex === 0 ? 2 : 1 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
