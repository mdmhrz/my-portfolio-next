import { prisma } from "@/lib/prisma";
import { StatCard } from "./_components/StatCard";
import { PerformanceChart } from "./_components/PerformanceChart";
import { RankingPanel } from "./_components/RankingPanel";
import { TopPostsBarChart } from "./_components/TopPostsBarChart";
import { RecentMessagesTable } from "./_components/RecentMessagesTable";
import { GitHubPanel } from "./_components/GitHubPanel";
import { OverviewToolbar } from "./_components/OverviewToolbar";
import { PERIOD_OPTIONS } from "./_components/period-options";
import { DashboardGreeting } from "./_components/DashboardGreeting";
import { getGitHubStats, parseGitHubUsername } from "@/lib/github";

export const dynamic = "force-dynamic";

const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

// --- helpers -----------------------------------------------------------------
function trend(current: number, previous: number): { pct: number; up: boolean } | undefined {
  if (previous === 0) return current > 0 ? { pct: 100, up: true } : undefined;
  const change = ((current - previous) / previous) * 100;
  return { pct: Math.abs(Math.round(change)), up: change >= 0 };
}

const countIn = (dates: Date[], from: Date, to: Date) => dates.filter((d) => d >= from && d < to).length;

function dayBucketsFrom(dates: Date[], start: Date, days: number) {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const keys: string[] = [];
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(s);
    d.setDate(d.getDate() + i);
    const k = d.toISOString().slice(0, 10);
    keys.push(k);
    map.set(k, 0);
  }
  for (const dt of dates) {
    const k = new Date(dt).toISOString().slice(0, 10);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return keys.map((k) => ({ date: k, count: map.get(k) ?? 0 }));
}

function segmentCounts(dates: Date[], start: Date, days: number, segments = 7) {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const startMs = s.getTime();
  const span = (startMs + days * 86_400_000 - startMs) / segments;
  const out = new Array(segments).fill(0);
  for (const dt of dates) {
    const t = new Date(dt).getTime();
    if (t >= startMs && t < startMs + days * 86_400_000) out[Math.min(segments - 1, Math.floor((t - startMs) / span))] += 1;
  }
  return out;
}

// Unique-visitor count per segment (distinct visitorId), for the Visitors sparkline.
function visitorSegments(events: { visitorId: string | null; createdAt: Date }[], start: Date, days: number, segments = 7) {
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const startMs = s.getTime();
  const span = (days * 86_400_000) / segments;
  const sets = Array.from({ length: segments }, () => new Set<string>());
  for (const e of events) {
    if (!e.visitorId) continue;
    const t = new Date(e.createdAt).getTime();
    if (t >= startMs && t < startMs + days * 86_400_000) sets[Math.min(segments - 1, Math.floor((t - startMs) / span))].add(e.visitorId);
  }
  return sets.map((x) => x.size);
}

const distinctVisitors = (events: { visitorId: string | null; createdAt: Date }[], from: Date, to: Date) =>
  new Set(events.filter((e) => e.visitorId && e.createdAt >= from && e.createdAt < to).map((e) => e.visitorId)).size;

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sp = await searchParams;
  const periodKey = sp.period && PERIOD_DAYS[sp.period] ? sp.period : "30d";
  const days = PERIOD_DAYS[periodKey];
  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === periodKey)?.label ?? "Last 30 days";

  const now = new Date();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));
  const prevStart = new Date(since);
  prevStart.setDate(prevStart.getDate() - days);
  const lookback = new Date(prevStart);

  const [
    analyticsEvents,
    messageDates,
    recentMessages,
    profile,
    postsTotal,
    projectsTotal,
    viewsAgg,
    topPosts,
    blogDates,
    projectDates,
  ] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: lookback } },
      select: { type: true, path: true, visitorId: true, createdAt: true },
    }),
    prisma.message.findMany({ where: { createdAt: { gte: lookback } }, select: { createdAt: true } }),
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, name: true, email: true, subject: true, type: true, createdAt: true, read: true },
    }),
    prisma.profile.findUnique({ where: { id: "singleton" }, select: { github: true } }),
    prisma.blog.count(),
    prisma.project.count(),
    prisma.blog.aggregate({ _sum: { views: true } }),
    prisma.blog.findMany({ orderBy: { views: "desc" }, take: 5, select: { title: true, views: true } }),
    prisma.blog.findMany({ select: { createdAt: true } }),
    prisma.project.findMany({ select: { createdAt: true } }),
  ]);

  const github = await getGitHubStats(parseGitHubUsername(profile?.github));

  const pageviews = analyticsEvents.filter((e) => e.type === "pageview");
  const resumeEvents = analyticsEvents.filter((e) => e.type === "resume_download");
  const pageviewDates = pageviews.map((e) => e.createdAt);
  const resumeDates = resumeEvents.map((e) => e.createdAt);
  const msgCreated = messageDates.map((m) => m.createdAt);

  // Period-scoped values + trends
  const visitorsWindow = distinctVisitors(pageviews, since, now);
  const visitorsTrend = trend(visitorsWindow, distinctVisitors(pageviews, prevStart, since));
  const pageViewsWindow = countIn(pageviewDates, since, now);
  const pageViewsTrend = trend(pageViewsWindow, countIn(pageviewDates, prevStart, since));
  const resumeWindow = countIn(resumeDates, since, now);
  const resumeTrend = trend(resumeWindow, countIn(resumeDates, prevStart, since));
  const messagesWindow = countIn(msgCreated, since, now);
  const messagesTrend = trend(messagesWindow, countIn(msgCreated, prevStart, since));

  // Sparklines over the window
  const visitorsSpark = visitorSegments(pageviews, since, days);
  const pageViewsSpark = segmentCounts(pageviewDates, since, days);
  const resumeSpark = segmentCounts(resumeDates, since, days);
  const messagesSpark = segmentCounts(msgCreated, since, days);

  // Performance: page views, current window vs previous window
  const currentBuckets = dayBucketsFrom(pageviewDates, since, days);
  const previousBuckets = dayBucketsFrom(pageviewDates, prevStart, days);
  const performanceData = currentBuckets.map((b, i) => ({
    date: b.date,
    current: b.count,
    previous: previousBuckets[i]?.count ?? 0,
  }));

  // Top pages by views (in window)
  const pageCounts = new Map<string, number>();
  for (const e of pageviews) {
    if (e.createdAt >= since && e.createdAt < now) {
      const p = e.path || "/";
      pageCounts.set(p, (pageCounts.get(p) ?? 0) + 1);
    }
  }
  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([path, count]) => ({ label: path.length > 24 ? `${path.slice(0, 24)}…` : path, value: count }));

  // Content — blogs & projects
  const totalViews = viewsAgg._sum.views ?? 0;
  const blogCreated = blogDates.map((b) => b.createdAt);
  const projectCreated = projectDates.map((p) => p.createdAt);
  const postsTrend = trend(countIn(blogCreated, since, now), countIn(blogCreated, prevStart, since));
  const projectsTrend = trend(countIn(projectCreated, since, now), countIn(projectCreated, prevStart, since));
  const postsSpark = segmentCounts(blogCreated, since, days);
  const projectsSpark = segmentCounts(projectCreated, since, days);
  const viewsSpark = topPosts.map((p) => p.views);
  const topPostsData = topPosts.map((p) => ({
    title: p.title.length > 22 ? `${p.title.slice(0, 22)}…` : p.title,
    views: p.views,
  }));

  // Blog traffic = real page views to /blogs/*, current window vs previous
  const blogPageviewDates = pageviews.filter((e) => (e.path || "").startsWith("/blogs")).map((e) => e.createdAt);
  const blogCurrent = dayBucketsFrom(blogPageviewDates, since, days);
  const blogPrevious = dayBucketsFrom(blogPageviewDates, prevStart, days);
  const blogTrafficData = blogCurrent.map((b, i) => ({ date: b.date, current: b.count, previous: blogPrevious[i]?.count ?? 0 }));
  const blogTrafficWindow = countIn(blogPageviewDates, since, now);

  const rows = recentMessages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject || m.type,
    createdAt: m.createdAt.toISOString(),
    unread: !m.read,
  }));

  const statSummary = [
    { label: `Visitors (${periodLabel})`, value: visitorsWindow },
    { label: `Page Views (${periodLabel})`, value: pageViewsWindow },
    { label: `Resume Downloads (${periodLabel})`, value: resumeWindow },
    { label: `Messages (${periodLabel})`, value: messagesWindow },
  ];

  return (
    <div className="space-y-8">
      <DashboardGreeting />

      {/* ── Overview: all summary cards ─────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <OverviewToolbar period={periodKey} stats={statSummary} />
        </div>

        {/* Traffic + engagement */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Visitors" value={visitorsWindow} spark={visitorsSpark} trend={visitorsTrend} trendNote="vs previous period" href="/admin/dashboard/messages" />
          <StatCard label="Page Views" value={pageViewsWindow} spark={pageViewsSpark} trend={pageViewsTrend} trendNote="vs previous period" />
          <StatCard label="Resume Downloads" value={resumeWindow} spark={resumeSpark} trend={resumeTrend} trendNote="vs previous period" href="/admin/dashboard/profile" />
          <StatCard label="Messages" value={messagesWindow} spark={messagesSpark} trend={messagesTrend} trendNote="vs previous period" href="/admin/dashboard/messages" />
        </div>

        {/* Content counts — below the overview cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Blog Posts" value={postsTotal} spark={postsSpark} trend={postsTrend} trendNote="vs previous period" href="/admin/dashboard/blogs" />
          <StatCard label="Projects" value={projectsTotal} spark={projectsSpark} trend={projectsTrend} trendNote="vs previous period" href="/admin/dashboard/projects" />
          <StatCard label="Blog Views" value={totalViews} spark={viewsSpark} trendNote="all time" href="/admin/dashboard/blogs" />
        </div>
      </section>

      {/* ── Analytics: traffic charts ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart
              title="Page Views"
              headerValue={pageViewsWindow}
              subtitle={`${visitorsWindow.toLocaleString()} visitors · ${periodLabel.toLowerCase()}`}
              data={performanceData}
            />
          </div>
          <RankingPanel title="Top Pages" total={pageViewsWindow} items={topPages} valueSuffix=" views" />
        </div>
      </section>

      {/* ── Content: blog charts ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Content</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PerformanceChart
              title="Blog Traffic"
              headerValue={blogTrafficWindow}
              subtitle={`page views to your blog · ${periodLabel.toLowerCase()}`}
              data={blogTrafficData}
            />
          </div>
          <TopPostsBarChart data={topPostsData} />
        </div>
      </section>

      {/* ── Activity: GitHub + inbox ────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Activity</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <GitHubPanel stats={github} />
          <div className="lg:col-span-2">
            <RecentMessagesTable rows={rows} />
          </div>
        </div>
      </section>
    </div>
  );
}
