import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { threadsRepo } from "@/modules/gmail/queries";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const threads = await threadsRepo.list();

    return NextResponse.json({ success: true, data: threads });
  } catch (error) {
    console.error("GET threads error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch threads" }, { status: 500 });
  }
}
