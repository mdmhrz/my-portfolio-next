import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const siteSettingsRepo = {
  get: () => prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  upsert: (update: Prisma.SiteSettingsUpdateInput, create: Prisma.SiteSettingsCreateInput) =>
    prisma.siteSettings.upsert({ where: { id: "singleton" }, update, create }),
};
