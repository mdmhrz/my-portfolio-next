import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { skillsRepo } from "@/modules/portfolio/skills/queries";

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

    const skill = await skillsRepo.update(id, {
      name: body.name,
      category: body.category,
      icon: body.icon || null,
      order: Number(body.order) || 0,
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("PUT skill error:", error);
    return NextResponse.json({ success: false, error: "Failed to update skill" }, { status: 500 });
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
    await skillsRepo.remove(id);

    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    console.error("DELETE skill error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete skill" }, { status: 500 });
  }
}
