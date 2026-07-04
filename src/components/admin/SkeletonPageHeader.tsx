import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonPageHeader() {
  return (
    <div className="space-y-2 pb-2">
      <Skeleton className="h-8 w-48 rounded-md" />
      <Skeleton className="h-4 w-96 rounded-md" />
    </div>
  );
}
