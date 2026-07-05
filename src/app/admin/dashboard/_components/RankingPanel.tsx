import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface RankingItem {
  label: string;
  value: number;
}

interface RankingPanelProps {
  title: string;
  total: number | string;
  trendPct?: number;
  items: RankingItem[];
  valueSuffix?: string;
}

export function RankingPanel({ title, total, trendPct, items, valueSuffix }: RankingPanelProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const display = typeof total === "number" ? total.toLocaleString() : total;

  return (
    <Card className="flex h-full flex-col rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardHeader className="gap-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold tracking-tight text-foreground">{display}</p>
          {typeof trendPct === "number" && (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              {trendPct}%
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center gap-2.5">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          items.map((item, i) => {
            const pct = Math.max(6, (item.value / max) * 100);
            // Chunky bar in a primary tint — leader strongest, each rank a step lighter.
            const opacity = Math.max(0.14, 0.32 - i * 0.05);
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>

                <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-muted/50">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg bg-primary transition-[width] duration-500"
                    style={{ width: `${pct}%`, opacity }}
                  />
                  <span className="absolute inset-y-0 left-0 w-1 rounded-l-lg bg-primary" />
                  <div className="relative flex h-full items-center justify-between gap-3 px-3">
                    <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                      {item.value.toLocaleString()}
                      {valueSuffix}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
