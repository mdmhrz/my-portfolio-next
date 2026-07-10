import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { experienceRepo } from "@/modules/portfolio/experience/queries";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const experience = await experienceRepo.update(id, {
      company: body.company,
      role: body.role,
      location: body.location,
      timeline: body.timeline,
      description: body.description,
      order: Number(body.order) || 0,
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("PUT experience error:", error);
    return NextResponse.json({ success: false, error: "Failed to update experience" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await experienceRepo.remove(id);

    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Experience deleted successfully" });
  } catch (error) {
    console.error("DELETE experience error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete experience" }, { status: 500 });
  }
}
