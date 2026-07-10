import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const navLinksRepo = {
  list: () => prisma.navLink.findMany({ orderBy: { order: "asc" } }),
  count: () => prisma.navLink.count(),
  create: (data: Prisma.NavLinkCreateInput) => prisma.navLink.create({ data }),
  update: (id: string, data: Prisma.NavLinkUpdateInput) => prisma.navLink.update({ where: { id }, data }),
  remove: (id: string) => prisma.navLink.delete({ where: { id } }),
  reorder: (items: { id: string; order: number }[]) =>
    prisma.$transaction(items.map((item) => prisma.navLink.update({ where: { id: item.id }, data: { order: item.order } }))),
};
