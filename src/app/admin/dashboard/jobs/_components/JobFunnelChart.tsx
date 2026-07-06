'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { JobApplicationData } from '@/store/usePortfolioStore';
import { computeJobStats } from './job-analytics';

const chartConfig = {
  count: {
    label: 'Applications',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

export function JobFunnelChart({ jobs }: { jobs: JobApplicationData[] }) {
  const { funnel } = computeJobStats(jobs);

  return (
    <Card className="rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardHeader>
        <CardTitle>Pipeline Funnel</CardTitle>
        <CardDescription>Where applications are right now, by stage</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
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
