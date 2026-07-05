'use client';

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PERIOD_OPTIONS } from "./period-options";

interface OverviewToolbarProps {
  period: string;
  stats: { label: string; value: number | string }[];
}

export function OverviewToolbar({ period, stats }: OverviewToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = PERIOD_OPTIONS.find((p) => p.value === period) ?? PERIOD_OPTIONS[1];

  const setPeriod = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const exportCsv = () => {
    const csv = [["Metric", "Value"], ...stats.map((s) => [s.label, String(s.value)])]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "overview-summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="h-9 gap-2">
            <Calendar className="h-4 w-4" />
            {current.label}
            <ChevronDown className="h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {PERIOD_OPTIONS.map((p) => (
            <DropdownMenuItem key={p.value} onClick={() => setPeriod(p.value)} className="cursor-pointer">
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button type="button" size="sm" onClick={exportCsv} className="h-9 gap-1.5">
        <Download className="h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
