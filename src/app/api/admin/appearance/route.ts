import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_FONT = {
  type: "default",
  name: "Satoshi",
  weights: ["400", "500", "700", "900"],
  customUrl: null as string | null,
};

export async function GET() {
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

    return NextResponse.json({
      font: {
        type: s?.fontType ?? DEFAULT_FONT.type,
        name: s?.fontName ?? DEFAULT_FONT.name,
        weights: s?.fontWeights?.length ? s.fontWeights : DEFAULT_FONT.weights,
        customUrl: s?.customFontUrl ?? null,
      },
      publicColors: s?.publicColors ?? null,
      dashboardColors: s?.dashboardColors ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch appearance:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.font) {
      data.fontType = body.font.type;
      data.fontName = body.font.name;
      data.fontWeights = body.font.weights;
      data.customFontUrl = body.font.customUrl ?? null;
    }
    // `null` clears the override (DB NULL); an object stores the config.
    if ("publicColors" in body) {
      data.publicColors = body.publicColors ?? Prisma.DbNull;
    }
    if ("dashboardColors" in body) {
      data.dashboardColors = body.dashboardColors ?? Prisma.DbNull;
    }

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });

    // Refresh server-injected appearance CSS on public routes.
    revalidatePath("/");
    revalidatePath("/blogs");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update appearance:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
