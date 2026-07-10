import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { blogRepo } from "@/modules/portfolio/blog/queries";

export async function GET() {
  try {
    const blogs = await blogRepo.list();
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
    const content: string = body.content || "";
    const readingTime = Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200));

    const blog = await blogRepo.create({
      title: body.title,
      slug: slugify(body.slug || body.title),
      content,
      excerpt: body.excerpt || "",
      coverImage: body.coverImage || null,
      coverImageAlt: body.coverImageAlt || null,
      category: body.category || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      featured: body.featured ?? false,
      published: body.published ?? false,
      readingTime,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
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
