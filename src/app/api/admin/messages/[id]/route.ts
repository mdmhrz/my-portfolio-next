import { NextResponse } from "next/server";
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

    const message = await prisma.message.update({
      where: { id },
      data: {
        read: body.read,
      },
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("PUT message error:", error);
    return NextResponse.json({ success: false, error: "Failed to update message" }, { status: 500 });
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
    await prisma.message.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("DELETE message error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete message" }, { status: 500 });
  }
}
