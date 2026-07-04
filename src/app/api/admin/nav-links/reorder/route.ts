import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

interface ReorderItem {
  id: string;
  order: number;
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const items: ReorderItem[] = body.items;
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    // Whole-list transaction — a drag-reorder settles into one final array, so this
    // persists it atomically instead of racing N independent per-row requests.
    await prisma.$transaction(
      items.map((item) =>
        prisma.navLink.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT nav-links reorder error:", error);
    return NextResponse.json({ success: false, error: "Failed to reorder nav links" }, { status: 500 });
  }
}
