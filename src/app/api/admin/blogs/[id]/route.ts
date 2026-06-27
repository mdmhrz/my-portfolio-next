import { NextResponse } from "next/server";
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

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        published: body.published,
      },
    });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PUT blog error:", error);
    return NextResponse.json({ success: false, error: "Failed to update blog" }, { status: 500 });
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
    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("DELETE blog error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 });
  }
}
