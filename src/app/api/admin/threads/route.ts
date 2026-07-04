import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const threads = await prisma.thread.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: {
        message: true,
        emails: { orderBy: { sentAt: "desc" }, take: 1, include: { attachments: true } },
      },
    });

    return NextResponse.json({ success: true, data: threads });
  } catch (error) {
    console.error("GET threads error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch threads" }, { status: 500 });
  }
}
