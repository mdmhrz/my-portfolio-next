import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const experienceRepo = {
  list: () => prisma.experience.findMany({ include: { projects: true }, orderBy: { order: "asc" } }),
  create: (data: Prisma.ExperienceCreateInput) => prisma.experience.create({ data }),
  update: (id: string, data: Prisma.ExperienceUpdateInput) =>
    prisma.experience.update({ where: { id }, data }),
  remove: (id: string) => prisma.experience.delete({ where: { id } }),
};
