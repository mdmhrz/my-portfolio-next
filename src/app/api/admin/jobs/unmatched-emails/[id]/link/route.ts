import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

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
      prisma.unmatchedJobEmail.findUnique({ where: { id } }),
      prisma.jobApplication.findUnique({ where: { id: jobId } }),
    ]);
    if (!email) {
      return NextResponse.json({ success: false, error: "Email not found" }, { status: 404 });
    }
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const [, updatedJob] = await prisma.$transaction([
      prisma.jobStatusEvent.create({
        data: {
          jobId,
          status: email.suggestedStatus,
          source: "gmail",
          gmailMessageId: email.gmailMessageId,
          note: email.subject,
        },
      }),
      prisma.jobApplication.update({
        where: { id: jobId },
        data: {
          status: email.suggestedStatus,
          gmailThreadId: job.gmailThreadId ?? email.gmailThreadId ?? undefined,
        },
        include: { events: { orderBy: { createdAt: "desc" } } },
      }),
      prisma.unmatchedJobEmail.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    console.error("Link unmatched job email error:", error);
    return NextResponse.json({ success: false, error: "Failed to link email" }, { status: 500 });
  }
}
