import { JobApplicationData } from '@/store/usePortfolioStore';
import { StatCard } from '@/app/admin/dashboard/_components/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { computeJobStats } from './job-analytics';

export function JobStatsRow({ jobs }: { jobs: JobApplicationData[] }) {
  const stats = computeJobStats(jobs);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="Total Applications" value={stats.total} trendNote="all time" />
      <StatCard label="Applied" value={stats.applied} trendNote="reached applied stage" />
      <StatCard label="Response Rate" value={`${stats.responseRate}%`} trendNote={`of ${stats.applied} applied`} />
      <StatCard label="Interview Rate" value={`${stats.interviewRate}%`} trendNote={`of ${stats.applied} applied`} />
      <StatCard label="Offer Rate" value={`${stats.offerRate}%`} trendNote={`of ${stats.applied} applied`} />
    </div>
  );
}

export function JobStatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="rounded-xl border border-border shadow-sm dark:shadow-none">
          <CardContent className="flex flex-col gap-4 p-5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-14" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
