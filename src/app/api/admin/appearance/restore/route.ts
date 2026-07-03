import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Restore = clear the override so the target falls back to the built-in
 * globals.css theme (the original committed design). Colors are set to DB NULL;
 * font is reset to the Satoshi default.
 */
export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json(); // "font" | "publicColors" | "dashboardColors" | "all"
    const data: Record<string, unknown> = {};

    if (type === "font" || type === "all") {
      data.fontType = "default";
      data.fontName = "Satoshi";
      data.fontWeights = ["400", "500", "700", "900"];
      data.customFontUrl = null;
    }
    if (type === "publicColors" || type === "all") {
      data.publicColors = Prisma.DbNull;
    }
    if (type === "dashboardColors" || type === "all") {
      data.dashboardColors = Prisma.DbNull;
    }

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });

    revalidatePath("/");
    revalidatePath("/blogs");

    return NextResponse.json({ success: true, message: `${type} restored to default` });
  } catch (error) {
    console.error("Failed to restore defaults:", error);
    return NextResponse.json({ error: "Failed to restore defaults" }, { status: 500 });
  }
}
