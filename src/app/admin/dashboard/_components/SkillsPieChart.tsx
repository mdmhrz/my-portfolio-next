'use client';

import { Cell, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface SkillsPieChartProps {
  data: { category: string; count: number }[];
}

const PALETTE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  tools: "Tools",
  database: "Database",
  other: "Other",
};

export function SkillsPieChart({ data }: SkillsPieChartProps) {
  const chartData = data.map((d, i) => ({
    category: d.category,
    label: CATEGORY_LABELS[d.category] || d.category,
    count: d.count,
    fill: PALETTE[i % PALETTE.length],
  }));

  const chartConfig = chartData.reduce((config, d, i) => {
    config[d.category] = { label: d.label, color: PALETTE[i % PALETTE.length] };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className="border border-border shadow-sm dark:shadow-none rounded-xl">
      <CardHeader>
        <CardTitle>Skills by Category</CardTitle>
        <CardDescription>Breakdown of your skill set</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No skills added yet.</p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
              <Pie data={chartData} dataKey="count" nameKey="category" innerRadius={55} strokeWidth={4}>
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="category" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
