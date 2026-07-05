import { Star, Users, ArrowUpRight } from "lucide-react";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { GitHubStats } from "@/lib/github";

export function GitHubPanel({ stats }: { stats: GitHubStats | null }) {
  return (
    <Card className="flex h-full flex-col rounded-xl border border-border shadow-sm dark:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <GithubLogo className="h-4 w-4 text-foreground" />
          <p className="text-sm font-semibold text-foreground">GitHub</p>
        </div>
        {stats && (
          <a
            href={`https://github.com/${stats.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
          >
            @{stats.username}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {!stats ? (
          <p className="py-8 text-center text-sm text-muted-foreground">GitHub stats unavailable.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Stat icon={<GithubLogo className="h-4 w-4" />} label="Repos" value={stats.publicRepos} />
              <Stat icon={<Star className="h-4 w-4" />} label="Stars" value={stats.totalStars} />
              <Stat icon={<Users className="h-4 w-4" />} label="Followers" value={stats.followers} />
            </div>

            {stats.topRepos.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Top repositories</p>
                {stats.topRepos.map((r) => (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
                  >
                    <span className="truncate font-medium text-foreground">{r.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums text-muted-foreground">
                      <Star className="h-3.5 w-3.5" />
                      {r.stars.toLocaleString()}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">{icon}</span>
      <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
