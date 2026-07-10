import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { jobsRepo } from "@/modules/jobs/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await jobsRepo.get(id);

  if (!job) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await jobsRepo.getRaw(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const statusChanged = typeof body.status === "string" && body.status !== existing.status;

    const job = await jobsRepo.update(id, {
      ...(body.company !== undefined && { company: body.company }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.companyLogo !== undefined && { companyLogo: body.companyLogo || null }),
      ...(body.jobUrl !== undefined && { jobUrl: body.jobUrl || null }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.applicationType !== undefined && { applicationType: body.applicationType }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.deadline !== undefined && { deadline: body.deadline ? new Date(body.deadline) : null }),
      ...(body.salaryMin !== undefined && { salaryMin: body.salaryMin }),
      ...(body.salaryMax !== undefined && { salaryMax: body.salaryMax }),
      ...(body.salaryCurrency !== undefined && { salaryCurrency: body.salaryCurrency || null }),
      ...(body.location !== undefined && { location: body.location || null }),
      ...(body.workMode !== undefined && { workMode: body.workMode || null }),
      ...(body.resumeVersion !== undefined && { resumeVersion: body.resumeVersion || null }),
      ...(body.coverLetterVersion !== undefined && { coverLetterVersion: body.coverLetterVersion || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.appliedAt !== undefined && { appliedAt: body.appliedAt ? new Date(body.appliedAt) : null }),
      ...(body.order !== undefined && { order: body.order }),
      ...(statusChanged && { events: { create: { status: body.status, source: "manual" } } }),
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("PATCH job error:", error);
    return NextResponse.json({ success: false, error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await jobsRepo.remove(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE job error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete job" }, { status: 500 });
  }
}
