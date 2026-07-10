import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const bannerRepo = {
  get: () => prisma.banner.findFirst(),
  upsert: (update: Prisma.BannerUpdateInput, create: Prisma.BannerCreateInput) =>
    prisma.banner.upsert({ where: { id: "singleton" }, update, create }),
};
