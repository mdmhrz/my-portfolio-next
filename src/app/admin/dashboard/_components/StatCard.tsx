import Link from "next/link";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number | string;
  prefix?: string;
  /** Small trailing series for the mini bar chart (oldest → newest). */
  spark?: number[];
  /** Period-over-period trend. Omit when no historical data exists. */
  trend?: { pct: number; up: boolean };
  trendNote?: string;
  href?: string;
}

const BAR_COUNT = 7;

function MiniBars({ data }: { data: number[] }) {
  // Always render BAR_COUNT fixed-width bars (front-padded with zeros) so every
  // card's chart is identical regardless of how much data it has.
  const recent = data.slice(-BAR_COUNT);
  const bars = [...Array(Math.max(0, BAR_COUNT - recent.length)).fill(0), ...recent];
  const max = Math.max(...bars, 1);
  const peak = bars.lastIndexOf(max);
  return (
    <div className="flex h-12 items-end gap-1" aria-hidden>
      {bars.map((v, i) => (
        <span
          key={i}
          className={`w-4 rounded-md ${
            i === peak
              ? "bg-gradient-to-t from-primary/40 to-primary"
              : "bg-gradient-to-t from-primary/5 to-primary/30"
          }`}
          style={{ height: `${Math.max(18, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function StatCard({ label, value, prefix, spark, trend, trendNote = "vs last month", href }: StatCardProps) {
  const display = typeof value === "number" ? value.toLocaleString() : value;

  return (
    <Card className="rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardContent className="flex flex-col gap-4 p-5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>

        <div className="flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {prefix}
            {display}
          </p>
          {spark && spark.length > 0 && <MiniBars data={spark} />}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {trend ? (
              <>
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold ${
                    trend.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                  }`}
                >
                  {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {trend.pct}%
                </span>
                {trendNote}
              </>
            ) : (
              trendNote
            )}
          </span>

          {href && (
            <Link href={href} className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline">
              See Details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
