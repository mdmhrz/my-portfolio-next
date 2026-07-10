import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { projectsRepo } from "@/modules/portfolio/projects/queries";

export async function GET() {
  try {
    const projects = await projectsRepo.list();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const project = await projectsRepo.create({
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle,
      category: body.category,
      role: body.role,
      company: body.company,
      timeline: body.timeline,
      desc: body.desc,
      fullDesc: body.fullDesc,
      tech: body.tech || [],
      features: body.features || [],
      contributions: body.contributions || [],
      live: body.live,
      image: body.image,
      imageAlt: body.imageAlt || null,
      featured: Boolean(body.featured),
      span: body.span,
      architectureTitle: body.architectureTitle,
      architectureDesc: body.architectureDesc,
      architectureTree: body.architectureTree,
      metrics: body.metrics || [],
      order: Number(body.order) || 0,
      experienceId: body.experienceId || null,
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("POST project error:", error);
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}
