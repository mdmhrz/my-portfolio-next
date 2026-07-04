import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

interface SectionItem {
  key: string;
  visible: boolean;
  order: number;
}

export async function GET() {
  try {
    const sections = await prisma.sectionConfig.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    console.error("GET sections error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const items: SectionItem[] = body.items;
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    // Whole-list transaction, same reasoning as nav-links/reorder — visibility toggles
    // and drag-reorders both send the full array so the save is atomic and consistent.
    await prisma.$transaction(
      items.map((item) =>
        prisma.sectionConfig.update({
          where: { key: item.key },
          data: { visible: item.visible, order: item.order },
        })
      )
    );

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT sections error:", error);
    return NextResponse.json({ success: false, error: "Failed to update sections" }, { status: 500 });
  }
}
