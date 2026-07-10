import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const footerRepo = {
  get: () => prisma.footer.findUnique({ where: { id: "singleton" } }),
  upsert: (update: Prisma.FooterUpdateInput, create: Prisma.FooterCreateInput) =>
    prisma.footer.upsert({ where: { id: "singleton" }, update, create }),
};
