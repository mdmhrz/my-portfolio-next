import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { scanJobGmail } from "@/lib/job-gmail-scan";

export const runtime = "nodejs";

// Manual "Sync now" trigger — mirrors src/app/api/admin/gmail/sync/route.ts.
export async function POST() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await scanJobGmail();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Job Gmail scan error:", error);
    const message = error instanceof Error ? error.message : "Failed to scan Gmail";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
