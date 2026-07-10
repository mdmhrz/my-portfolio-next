import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { navLinksRepo } from "@/modules/portfolio/nav-links/queries";

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

    const navLink = await navLinksRepo.update(id, {
      label: body.label,
      href: body.href,
      showInNav: body.showInNav ?? true,
      showInFooter: body.showInFooter ?? true,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true, data: navLink });
  } catch (error) {
    console.error("PUT nav-link error:", error);
    return NextResponse.json({ success: false, error: "Failed to update nav link" }, { status: 500 });
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
    await navLinksRepo.remove(id);

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true, message: "Nav link deleted successfully" });
  } catch (error) {
    console.error("DELETE nav-link error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete nav link" }, { status: 500 });
  }
}
