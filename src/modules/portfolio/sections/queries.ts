import { prisma } from "@/lib/prisma";

export const sectionsRepo = {
  list: () => prisma.sectionConfig.findMany({ orderBy: { order: "asc" } }),
  reorder: (items: { key: string; visible: boolean; order: number }[]) =>
    prisma.$transaction(
      items.map((item) =>
        prisma.sectionConfig.update({
          where: { key: item.key },
          data: { visible: item.visible, order: item.order },
        })
      )
    ),
};
