'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MessagesAreaChartProps {
  data: { date: string; messages: number }[];
}

const chartConfig = {
  messages: {
    label: "Messages",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function MessagesAreaChart({ data }: MessagesAreaChartProps) {
  return (
    <Card className="border border-border shadow-sm dark:shadow-none rounded-xl">
      <CardHeader>
        <CardTitle>Inbound Messages</CardTitle>
        <CardDescription>Messages received over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <AreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <defs>
              <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-messages)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-messages)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="messages"
              type="monotone"
              fill="url(#fillMessages)"
              stroke="var(--color-messages)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
