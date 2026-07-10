import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { skillsRepo } from "@/modules/portfolio/skills/queries";

export async function GET() {
  try {
    const skills = await skillsRepo.list();
    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error("GET skills error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const skill = await skillsRepo.create({
      name: body.name,
      category: body.category,
      icon: body.icon || null,
      order: Number(body.order) || 0,
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error("POST skill error:", error);
    return NextResponse.json({ success: false, error: "Failed to create skill" }, { status: 500 });
  }
}
