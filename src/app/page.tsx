import { prisma } from "@/lib/prisma";
import { PortfolioHome } from "./_components/PortfolioHome";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";

export const revalidate = 3600; // Revalidate every hour; admin mutations call revalidatePath("/")

export default async function Home() {
  const [banner, experiences, projects, profile, settings, skills, homepageBlogs, cta, footer, navLinks, sections] = await Promise.all([
    prisma.banner.findFirst(),
    prisma.experience.findMany({
      include: {
        projects: {
          orderBy: {
            order: "asc"
          }
        }
      },
      orderBy: {
        order: "asc"
      }
    }),
    prisma.project.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        category: true,
        role: true,
        company: true,
        timeline: true,
        desc: true,
        fullDesc: true,
        tech: true,
        features: true,
        contributions: true,
        live: true,
        image: true,
        imageAlt: true,
        featured: true,
        span: true,
        architectureTitle: true,
        architectureDesc: true,
        architectureTree: true,
        metrics: true,
        order: true,
        experienceId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        order: "asc"
      }
    }),
    prisma.profile.findUnique({ where: { id: "singleton" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.skill.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    // Featured, published blogs for the landing-page slider. Dates are serialized
    // to ISO strings so they cross the server→client boundary as plain JSON.
    prisma.blog.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        coverImageAlt: true,
        category: true,
        tags: true,
        featured: true,
        readingTime: true,
        views: true,
        createdAt: true,
      },
    }),
    prisma.cta.findUnique({ where: { id: "singleton" } }),
    prisma.footer.findUnique({ where: { id: "singleton" } }),
    prisma.navLink.findMany({ orderBy: { order: "asc" } }),
    prisma.sectionConfig.findMany({ orderBy: { order: "asc" } }),
  ]);

  const serializedBlogs = homepageBlogs.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <AppearanceColorScope scope="public">
      <PortfolioHome
        banner={banner}
        experiences={experiences}
        projects={projects}
        profile={profile}
        settings={settings}
        skills={skills}
        homepageBlogs={serializedBlogs}
        cta={cta}
        footer={footer}
        navLinks={navLinks}
        sections={sections}
      />
    </AppearanceColorScope>
  );
}
