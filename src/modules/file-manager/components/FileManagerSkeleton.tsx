import { Skeleton } from '@/components/ui/skeleton';

export function FileManagerSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border bg-background p-3">
          <Skeleton className="mx-auto h-10 w-10 rounded-md" />
          <Skeleton className="h-3 w-4/5 mx-auto" />
          <Skeleton className="h-2.5 w-2/5 mx-auto" />
        </div>
      ))}
    </div>
  );
}
