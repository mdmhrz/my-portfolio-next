import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

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

    const navLink = await prisma.navLink.update({
      where: { id },
      data: {
        label: body.label,
        href: body.href,
        showInNav: body.showInNav ?? true,
        showInFooter: body.showInFooter ?? true,
      },
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
    await prisma.navLink.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true, message: "Nav link deleted successfully" });
  } catch (error) {
    console.error("DELETE nav-link error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete nav link" }, { status: 500 });
  }
}
