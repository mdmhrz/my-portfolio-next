import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { unmatchedEmailsRepo, jobsRepo, linkUnmatchedEmailToJob } from "@/modules/jobs/queries";

// Manually link an unmatched email to a job — logs the status event the scan
// couldn't confidently attribute, then discards the unmatched record.
export async function POST(
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
    const jobId: string | undefined = body.jobId;
    if (!jobId) {
      return NextResponse.json({ success: false, error: "jobId is required" }, { status: 400 });
    }

    const [email, job] = await Promise.all([
      unmatchedEmailsRepo.get(id),
      jobsRepo.getRaw(jobId),
    ]);
    if (!email) {
      return NextResponse.json({ success: false, error: "Email not found" }, { status: 404 });
    }
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const [, updatedJob] = await linkUnmatchedEmailToJob(email, job);

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    console.error("Link unmatched job email error:", error);
    return NextResponse.json({ success: false, error: "Failed to link email" }, { status: 500 });
  }
}
