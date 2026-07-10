import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { testimonialsRepo } from "@/modules/portfolio/testimonials/queries";

export async function GET() {
  try {
    const testimonials = await testimonialsRepo.list();
    return NextResponse.json({ success: true, data: testimonials });
  } catch (error) {
    console.error("GET testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const testimonial = await testimonialsRepo.create({
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
      order: body.order ?? (await testimonialsRepo.count()),
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: testimonial });
  } catch (error) {
    console.error("POST testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
