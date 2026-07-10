import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { testimonialsRepo } from "@/modules/portfolio/testimonials/queries";

export async function PUT(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body; // items: [{id, order}, ...]

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Invalid items array" },
        { status: 400 }
      );
    }

    await testimonialsRepo.reorder(items);

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reorder testimonials" },
      { status: 500 }
    );
  }
}
