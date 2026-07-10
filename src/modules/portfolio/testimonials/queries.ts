import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const testimonialsRepo = {
  list: () => prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
  count: () => prisma.testimonial.count(),
  create: (data: Prisma.TestimonialCreateInput) => prisma.testimonial.create({ data }),
  update: (id: string, data: Prisma.TestimonialUpdateInput) =>
    prisma.testimonial.update({ where: { id }, data }),
  remove: (id: string) => prisma.testimonial.delete({ where: { id } }),
  reorder: (items: { id: string; order: number }[]) =>
    prisma.$transaction(
      items.map((item) =>
        prisma.testimonial.update({ where: { id: item.id }, data: { order: item.order } })
      )
    ),
};
