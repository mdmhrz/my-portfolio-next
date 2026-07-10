import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const blogRepo = {
  list: () => prisma.blog.findMany({ orderBy: { createdAt: "desc" } }),
  get: (id: string) => prisma.blog.findUnique({ where: { id } }),
  findFirstPublished: (orderBy: Prisma.BlogOrderByWithRelationInput[]) =>
    prisma.blog.findFirst({
      where: { published: true },
      orderBy,
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
  create: (data: Prisma.BlogCreateInput) => prisma.blog.create({ data }),
  update: (id: string, data: Prisma.BlogUpdateInput) => prisma.blog.update({ where: { id }, data }),
  remove: (id: string) => prisma.blog.delete({ where: { id } }),
  incrementViews: (slug: string) =>
    prisma.blog.update({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
      select: { views: true },
    }),
};
