import { NextResponse } from "next/server";
import { blogRepo } from "@/modules/portfolio/blog/queries";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await blogRepo.incrementViews(slug);
    return NextResponse.json({ views: blog.views });
  } catch {
    // Silently fail — view count is non-critical
    return NextResponse.json({ views: 0 });
  }
}
