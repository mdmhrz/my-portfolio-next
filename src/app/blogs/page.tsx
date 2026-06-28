import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { BlogListClient } from "@/app/blogs/_components/BlogListClient";

export const revalidate = 3600; // Revalidate hourly; admin mutations call revalidatePath("/blogs")

const SITE_URL = "https://mhrazu.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on full-stack development, system design, Next.js, Go, DevOps, and engineering insights by Mobarak Hossain Razu.",
  alternates: { canonical: `${SITE_URL}/blogs` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/blogs`,
    title: "Blog | Mobarak Hossain Razu",
    description:
      "Articles on full-stack development, system design, Next.js, Go, DevOps, and engineering insights by Mobarak Hossain Razu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Mobarak Hossain Razu",
    description:
      "Articles on full-stack development, system design, Next.js, Go, DevOps, and engineering insights.",
  },
};

export default async function BlogListPage() {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      coverImageAlt: true,
      category: true,
      content: true,
      createdAt: true,
    },
  });

  // Distinct, sorted category list for the filter chips.
  const categories = Array.from(
    new Set(blogs.map((b) => b.category).filter((c): c is string => Boolean(c)))
  ).sort();

  // Serialize dates to strings before passing across the RSC boundary.
  const serialized = blogs.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }));

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.06),rgba(255,255,255,0))]" />
      <div className="relative z-10">
        <BlogListClient blogs={serialized} categories={categories} />
      </div>
    </div>
  );
}
