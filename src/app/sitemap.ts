import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://mhrazu.com";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
  });

  const blogEntries: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${SITE_URL}/blogs/${blog.slug}`,
    lastModified: blog.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blogs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...blogEntries,
  ];
}
