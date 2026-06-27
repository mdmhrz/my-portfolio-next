import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

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
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        coverImage: body.coverImage,
        published: body.published ?? false,
      },
    });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("POST blog error:", error);
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}
