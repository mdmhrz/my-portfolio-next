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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role || null,
        company: body.company || null,
        quote: body.quote,
        avatarUrl: body.avatarUrl || null,
        avatarAlt: body.avatarAlt || null,
        rating: body.rating || null,
        videoUrl: body.videoUrl || null,
        highlight: body.highlight || null,
        highlightLabel: body.highlightLabel || null,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error("PUT testimonial error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.testimonial.delete({
      where: { id },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE testimonial error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
