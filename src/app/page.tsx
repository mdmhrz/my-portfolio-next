import { prisma } from "@/lib/prisma";
import { PortfolioHome } from "@/components/home/PortfolioHome";

export const revalidate = 0; // Fetch data dynamically on every request

export default async function Home() {
  const banner = await prisma.banner.findFirst();
  const experiences = await prisma.experience.findMany({
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
  });
  const projects = await prisma.project.findMany({
    orderBy: {
      order: "asc"
    }
  });

  return (
    <PortfolioHome
      banner={banner}
      experiences={experiences}
      projects={projects}
    />
  );
}
