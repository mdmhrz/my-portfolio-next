'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { JobApplicationData } from '@/store/usePortfolioStore';
import { JOB_STATUSES } from './job-constants';
import { computeJobStats } from './job-analytics';

const chartConfig = {
  count: {
    label: 'Applications',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

// Deterministic-looking bar widths (no randomness) so the skeleton renders
// identically on server and client instead of flashing/mismatching.
const SKELETON_BAR_WIDTHS = ['85%', '60%', '45%', '70%', '35%', '50%', '25%', '40%'];

export function JobFunnelChart({ jobs, loading = false }: { jobs: JobApplicationData[]; loading?: boolean }) {
  const { funnel } = computeJobStats(jobs);

  return (
    <Card className="rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
        <CardDescription>Where applications are right now, by stage</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[260px] flex-col justify-around">
            {JOB_STATUSES.map((status, i) => (
              <div key={status.value} className="flex items-center gap-3">
                <Skeleton className="h-3 w-16 shrink-0" />
                <Skeleton className="h-4 rounded-sm" style={{ width: SKELETON_BAR_WIDTHS[i % SKELETON_BAR_WIDTHS.length] }} />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart accessibilityLayer data={funnel} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="count" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={90}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
