'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface TopPostsBarChartProps {
  data: { title: string; views: number }[];
}

const chartConfig = {
  views: {
    label: "Views",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TopPostsBarChart({ data }: TopPostsBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Posts</CardTitle>
        <CardDescription>Your 5 most-viewed blog posts</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No published posts yet.</p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="views" hide />
              <YAxis
                type="category"
                dataKey="title"
                tickLine={false}
                axisLine={false}
                width={140}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="var(--color-views)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
