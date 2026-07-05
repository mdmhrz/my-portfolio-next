'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: string; // ISO
  unread: boolean;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function RecentMessagesTable({ rows }: { rows: MessageRow[] }) {
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (unreadOnly && !r.unread) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q)
      );
    });
  }, [rows, query, unreadOnly]);

  const exportCsv = () => {
    const header = ["Name", "Email", "Subject", "Date", "Status"];
    const body = filtered.map((r) => [
      r.name,
      r.email,
      r.subject,
      new Date(r.createdAt).toLocaleDateString(),
      r.unread ? "Unread" : "Read",
    ]);
    const csv = [header, ...body].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "recent-messages.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardContent className="p-5">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-semibold text-foreground">Recent Messages</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-9 w-full pl-9 sm:w-56"
              />
            </div>
            <Button
              type="button"
              variant={unreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setUnreadOnly((v) => !v)}
              className="h-9 gap-1.5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportCsv} className="h-9 gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="py-3 pr-4 font-medium">Customer Name</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Subject</th>
                <th className="py-3 pr-4 font-medium">Date</th>
                <th className="py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No messages found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(r.name) || "?"}
                        </span>
                        <span className="font-medium text-foreground">{r.name}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.email}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.subject || "—"}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          r.unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.unread ? "Unread" : "Read"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Link href="/admin/dashboard/messages" className="text-xs font-semibold text-primary hover:underline">
            View all messages →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
