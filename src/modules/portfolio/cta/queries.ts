import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const ctaRepo = {
  get: () => prisma.cta.findUnique({ where: { id: "singleton" } }),
  upsert: (update: Prisma.CtaUpdateInput, create: Prisma.CtaCreateInput) =>
    prisma.cta.upsert({ where: { id: "singleton" }, update, create }),
};
