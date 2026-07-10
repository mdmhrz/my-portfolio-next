import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { jobsRepo } from "@/modules/jobs/queries";

export async function PUT(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { items } = body; // items: [{id, order}, ...]

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid items array" }, { status: 400 });
    }

    await jobsRepo.reorder(items);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder jobs error:", error);
    return NextResponse.json({ success: false, error: "Failed to reorder jobs" }, { status: 500 });
  }
}
