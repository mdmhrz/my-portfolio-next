import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const projectsRepo = {
  list: () => prisma.project.findMany({ orderBy: { order: "asc" } }),
  create: (data: Prisma.ProjectUncheckedCreateInput) => prisma.project.create({ data }),
  update: (id: string, data: Prisma.ProjectUncheckedUpdateInput) => prisma.project.update({ where: { id }, data }),
  remove: (id: string) => prisma.project.delete({ where: { id } }),
};
