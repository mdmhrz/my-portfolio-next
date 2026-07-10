import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { threadsRepo } from "@/modules/gmail/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const thread = await threadsRepo.get(id);

  if (!thread) {
    return NextResponse.json({ success: false, error: "Thread not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: thread });
}

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

    const thread = await threadsRepo.update(id, { unread: body.unread });

    return NextResponse.json({ success: true, data: thread });
  } catch (error) {
    console.error("PUT thread error:", error);
    return NextResponse.json({ success: false, error: "Failed to update thread" }, { status: 500 });
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
    const thread = await threadsRepo.getRaw(id);
    if (!thread) {
      return NextResponse.json({ success: false, error: "Thread not found" }, { status: 404 });
    }

    await threadsRepo.removeWithMessage(id, thread.messageId);

    return NextResponse.json({ success: true, message: "Thread deleted successfully" });
  } catch (error) {
    console.error("DELETE thread error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete thread" }, { status: 500 });
  }
}
