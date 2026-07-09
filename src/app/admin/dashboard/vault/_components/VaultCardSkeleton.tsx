import { Skeleton } from '@/components/ui/skeleton';

// Mirrors VaultCard's real layout (icon+title+category, star+menu, description,
// tag pills, footer row) rather than a generic box, so the loading state reads
// as "this content is arriving" instead of an unrelated placeholder shape.
function VaultCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-3 w-full" />

      <div className="flex items-center gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function VaultCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <VaultCardSkeleton key={i} />
      ))}
    </div>
  );
}
