import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const skillsRepo = {
  list: () => prisma.skill.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  create: (data: Prisma.SkillCreateInput) => prisma.skill.create({ data }),
  update: (id: string, data: Prisma.SkillUpdateInput) => prisma.skill.update({ where: { id }, data }),
  remove: (id: string) => prisma.skill.delete({ where: { id } }),
};
