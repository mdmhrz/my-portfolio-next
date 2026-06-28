import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await prisma.blog.update({
      where: { slug, published: true },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return NextResponse.json({ views: blog.views });
  } catch {
    // Silently fail — view count is non-critical
    return NextResponse.json({ views: 0 });
  }
}
