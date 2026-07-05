import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
    });
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

    const testimonial = await prisma.testimonial.create({
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
        order: body.order ?? (await prisma.testimonial.count()),
      },
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
