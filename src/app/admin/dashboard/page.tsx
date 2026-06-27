import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/admin/DashboardClient";

export const revalidate = 0; // Always fetch fresh database records on load

export default async function AdminDashboardPage() {
  // 1. Verify that the user is authenticated and is an admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // 2. Query initial data on the server
  const banner = await prisma.banner.findFirst();
  const experiences = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  const projects = await prisma.project.findMany({
    orderBy: { order: "asc" },
  });
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
  });
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardClient
      initialBanner={banner}
      initialExperiences={experiences}
      initialProjects={projects}
      initialMessages={messages}
      initialBlogs={blogs}
    />
  );
}
