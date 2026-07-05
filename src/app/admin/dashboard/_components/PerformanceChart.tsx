'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface PerformanceChartProps {
  title: string;
  headerValue: number | string;
  subtitle?: string;
  currentLabel?: string;
  previousLabel?: string;
  data: { date: string; current: number; previous: number }[];
}

// "Last month" is a lighter tint of the (dynamic) primary so both lines stay on-brand.
const PREVIOUS_TINT = "color-mix(in oklab, var(--primary) 35%, var(--card))";

export function PerformanceChart({
  title,
  headerValue,
  subtitle,
  currentLabel = "This Month",
  previousLabel = "Last Month",
  data,
}: PerformanceChartProps) {
  const chartConfig = {
    current: { label: currentLabel, color: "var(--primary)" },
    previous: { label: previousLabel, color: PREVIOUS_TINT },
  } satisfies ChartConfig;

  const display = typeof headerValue === "number" ? headerValue.toLocaleString() : headerValue;

  return (
    <Card className="rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">{display}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            {currentLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PREVIOUS_TINT }} />
            {previousLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart accessibilityLayer data={data} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={40}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  }
                />
              }
            />
            <defs>
              <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-current)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-current)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {/* Last month — lighter tint, drawn behind */}
            <Area
              dataKey="previous"
              type="natural"
              fill="none"
              stroke="var(--color-previous)"
              strokeWidth={2}
              dot={false}
            />
            {/* This month — solid primary with soft fill, on top */}
            <Area
              dataKey="current"
              type="natural"
              fill="url(#fillCurrent)"
              stroke="var(--color-current)"
              strokeWidth={2.5}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
