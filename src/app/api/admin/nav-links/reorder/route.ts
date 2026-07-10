import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { navLinksRepo } from "@/modules/portfolio/nav-links/queries";

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
    await navLinksRepo.reorder(items);

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT nav-links reorder error:", error);
    return NextResponse.json({ success: false, error: "Failed to reorder nav links" }, { status: 500 });
  }
}
