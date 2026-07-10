import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { jobsRepo } from "@/modules/jobs/queries";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await jobsRepo.list();
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error("GET jobs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const status = body.status || "saved";

    const job = await jobsRepo.create({
      company: body.company,
      position: body.position,
      companyLogo: body.companyLogo || null,
      jobUrl: body.jobUrl || null,
      source: body.source,
      applicationType: body.applicationType,
      status,
      deadline: body.deadline ? new Date(body.deadline) : null,
      salaryMin: body.salaryMin ?? null,
      salaryMax: body.salaryMax ?? null,
      salaryCurrency: body.salaryCurrency || null,
      location: body.location || null,
      workMode: body.workMode || null,
      resumeVersion: body.resumeVersion || null,
      coverLetterVersion: body.coverLetterVersion || null,
      notes: body.notes || null,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : null,
      order: body.order ?? (await jobsRepo.count()),
      events: { create: { status, source: "manual" } },
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("POST jobs error:", error);
    return NextResponse.json({ success: false, error: "Failed to create job" }, { status: 500 });
  }
}
