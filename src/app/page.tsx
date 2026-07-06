import { prisma } from "@/lib/prisma";
import { PortfolioHome } from "./_components/PortfolioHome";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";

export const revalidate = 3600; // Revalidate every hour; admin mutations call revalidatePath("/")

// Rendered when the DB is unreachable, so the homepage still shows every
// section (each one falls back to its own static/default content) instead
// of a hard 500.
const DEFAULT_SECTIONS = [
  { key: "techMarquee", order: 0, visible: true },
  { key: "journey", order: 1, visible: true },
  { key: "experience", order: 2, visible: true },
  { key: "tools", order: 3, visible: true },
  { key: "caseStudies", order: 4, visible: true },
  { key: "homepageBlogs", order: 5, visible: true },
  { key: "testimonials", order: 6, visible: true },
  { key: "cta", order: 7, visible: true },
  { key: "contact", order: 8, visible: true },
];

export default async function Home() {
  let banner: any, experiences: any[], projects: any[], profile: any, settings: any, skills: any[], homepageBlogs: any[], testimonials: any[], cta: any, footer: any, navLinks: any[], sections: any[];

  try {
    [banner, experiences, projects, profile, settings, skills, homepageBlogs, testimonials, cta, footer, navLinks, sections] = await Promise.all([
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
    prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
    prisma.cta.findUnique({ where: { id: "singleton" } }),
    prisma.footer.findUnique({ where: { id: "singleton" } }),
    prisma.navLink.findMany({ orderBy: { order: "asc" } }),
    prisma.sectionConfig.findMany({ orderBy: { order: "asc" } }),
    ]);
  } catch (error) {
    console.error("Homepage DB query failed, rendering with fallback content:", error);
    banner = null;
    experiences = [];
    projects = [];
    profile = null;
    settings = null;
    skills = [];
    homepageBlogs = [];
    testimonials = [];
    cta = null;
    footer = null;
    navLinks = [];
    sections = DEFAULT_SECTIONS;
  }

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
        testimonials={testimonials}
        cta={cta}
        footer={footer}
        navLinks={navLinks}
        sections={sections}
      />
    </AppearanceColorScope>
  );
}
