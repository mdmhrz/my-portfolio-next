import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      include: { projects: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error("GET experiences error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch experiences" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const experience = await prisma.experience.create({
      data: {
        company: body.company,
        role: body.role,
        location: body.location,
        timeline: body.timeline,
        description: body.description,
        order: Number(body.order) || 0,
      },
    });

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("POST experience error:", error);
    return NextResponse.json({ success: false, error: "Failed to create experience" }, { status: 500 });
  }
}
