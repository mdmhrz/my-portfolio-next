import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { experienceRepo } from "@/modules/portfolio/experience/queries";

export async function GET() {
  try {
    const experiences = await experienceRepo.list();
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
    const experience = await experienceRepo.create({
      company: body.company,
      role: body.role,
      location: body.location,
      timeline: body.timeline,
      description: body.description,
      order: Number(body.order) || 0,
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error("POST experience error:", error);
    return NextResponse.json({ success: false, error: "Failed to create experience" }, { status: 500 });
  }
}
