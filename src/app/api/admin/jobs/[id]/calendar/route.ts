import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { createJobCalendarEvent, deleteJobCalendarEvent } from "@/lib/job-calendar";

export const runtime = "nodejs";

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
    if (!body.title || !body.startTime) {
      return NextResponse.json({ success: false, error: "title and startTime are required" }, { status: 400 });
    }

    const job = await createJobCalendarEvent({
      jobId: id,
      title: body.title,
      description: body.description || undefined,
      startTime: new Date(body.startTime),
      durationMinutes: body.durationMinutes,
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("Create job calendar event error:", error);
    const message = error instanceof Error ? error.message : "Failed to create calendar event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
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
    const job = await deleteJobCalendarEvent(id);
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("Delete job calendar event error:", error);
    const message = error instanceof Error ? error.message : "Failed to remove calendar event";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
