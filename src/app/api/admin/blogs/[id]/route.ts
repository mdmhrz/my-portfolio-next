import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

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
        slug: slugify(body.slug || body.title),
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        coverImageAlt: body.coverImageAlt || null,
        category: body.category || null,
        published: body.published,
      },
    });

    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PUT blog error:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update blog"
    }, { status: 500 });
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

    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("DELETE blog error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 });
  }
}
