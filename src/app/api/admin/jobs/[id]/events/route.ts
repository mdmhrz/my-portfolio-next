import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

// Manual note/status log entry — does not touch the job's own `status` field,
// for logging things like "followed up" without moving the pipeline stage.
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

    const job = await prisma.jobApplication.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    const event = await prisma.jobStatusEvent.create({
      data: {
        jobId: id,
        status: body.status || job.status,
        note: body.note || null,
        source: "manual",
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("POST job event error:", error);
    return NextResponse.json({ success: false, error: "Failed to add event" }, { status: 500 });
  }
}
