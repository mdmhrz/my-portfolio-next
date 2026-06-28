import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface FormPageSkeletonProps {
  fields?: number;
  hasGridRow?: boolean;
  maxWidth?: string;
}

export function FormPageSkeleton({
  fields = 3,
  hasGridRow = true,
  maxWidth = "max-w-3xl",
}: FormPageSkeletonProps) {
  return (
    <div className={`${maxWidth} space-y-6`}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-6">
          {hasGridRow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          )}
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className={i % 2 === 0 ? "h-10 w-full" : "h-20 w-full"} />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
