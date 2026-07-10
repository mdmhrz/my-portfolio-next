import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const profileRepo = {
  get: () => prisma.profile.findUnique({ where: { id: "singleton" } }),
  upsert: (update: Prisma.ProfileUpdateInput, create: Prisma.ProfileCreateInput) =>
    prisma.profile.upsert({ where: { id: "singleton" }, update, create }),
};
