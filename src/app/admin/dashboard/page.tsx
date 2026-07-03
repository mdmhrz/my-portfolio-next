import { BookOpen, Eye, FolderKanban, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "./_components/StatCard";
import { TopPostsBarChart } from "./_components/TopPostsBarChart";
import { MessagesAreaChart } from "./_components/MessagesAreaChart";
import { SkillsPieChart } from "./_components/SkillsPieChart";

export const dynamic = "force-dynamic";

const DAYS_BACK = 30;

export default async function AdminDashboardPage() {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - (DAYS_BACK - 1));
  sinceDate.setHours(0, 0, 0, 0);

  const [
    postsTotal,
    postsPublished,
    viewsAgg,
    projectsTotal,
    projectsFeatured,
    unreadMessages,
    topPosts,
    recentMessages,
    skills,
  ] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { published: true } }),
    prisma.blog.aggregate({ _sum: { views: true } }),
    prisma.project.count(),
    prisma.project.count({ where: { featured: true } }),
    prisma.message.count({ where: { read: false } }),
    prisma.blog.findMany({
      orderBy: { views: "desc" },
      take: 5,
      select: { id: true, title: true, views: true },
    }),
    prisma.message.findMany({
      where: { createdAt: { gte: sinceDate } },
      select: { createdAt: true },
    }),
    prisma.skill.findMany({ select: { category: true } }),
  ]);

  // Bar chart: top 5 posts by views (shortened titles for axis labels).
  const topPostsData = topPosts.map((p) => ({
    title: p.title.length > 24 ? `${p.title.slice(0, 24)}…` : p.title,
    views: p.views,
  }));

  // Area chart: message count per day for the last 30 days, zero-filled so the
  // trend line doesn't look broken on days with no inbound messages.
  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < DAYS_BACK; i++) {
    const d = new Date(sinceDate);
    d.setDate(d.getDate() + i);
    dayBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const m of recentMessages) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }
  const messagesOverTime = Array.from(dayBuckets.entries()).map(([date, count]) => ({
    date,
    messages: count,
  }));

  // Pie chart: skill count per category.
  const categoryCounts = new Map<string, number>();
  for (const s of skills) {
    const cat = s.category || "other";
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }
  const skillsByCategory = Array.from(categoryCounts.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="A snapshot of your content, traffic, and inbound interest."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Blog Posts"
          value={postsTotal}
          sublabel={`${postsPublished} published · ${postsTotal - postsPublished} draft`}
          icon={BookOpen}
        />
        <StatCard
          label="Total Blog Views"
          value={viewsAgg._sum.views ?? 0}
          sublabel="Across all posts"
          icon={Eye}
        />
        <StatCard
          label="Projects"
          value={projectsTotal}
          sublabel={`${projectsFeatured} featured`}
          icon={FolderKanban}
        />
        <StatCard
          label="Unread Messages"
          value={unreadMessages}
          sublabel="In your inbox"
          icon={Mail}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopPostsBarChart data={topPostsData} />
        <SkillsPieChart data={skillsByCategory} />
      </div>

      <MessagesAreaChart data={messagesOverTime} />
    </div>
  );
}
