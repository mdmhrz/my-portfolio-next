import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    console.log("Updating project with data:", { id, imageAlt: body.imageAlt });

    const project = await prisma.project.update({
      where: { id },
      data: {
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
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("PUT project error:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update project"
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("DELETE project error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
  }
}
