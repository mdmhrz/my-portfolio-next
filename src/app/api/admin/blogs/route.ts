import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error("GET blogs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const blog = await prisma.blog.create({
      data: {
        title: body.title,
        // Always store a URL-safe slug (never spaces or special chars).
        slug: slugify(body.slug || body.title),
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        coverImageAlt: body.coverImageAlt || null,
        category: body.category || null,
        published: body.published ?? false,
      },
    });

    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("POST blog error:", error);
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}
