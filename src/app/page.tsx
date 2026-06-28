import { prisma } from "@/lib/prisma";
import { PortfolioHome } from "./_components/PortfolioHome";

export const revalidate = 3600; // Revalidate every hour; admin mutations call revalidatePath("/")

export default async function Home() {
  const [banner, experiences, projects, about, settings, skills] = await Promise.all([
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
    prisma.about.findUnique({ where: { id: "singleton" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.skill.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);

  return (
    <PortfolioHome
      banner={banner}
      experiences={experiences}
      projects={projects}
      about={about}
      settings={settings}
      skills={skills}
    />
  );
}
