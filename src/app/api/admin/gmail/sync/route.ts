import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { syncGmailHistory } from "@/modules/gmail/service/sync";

export const runtime = "nodejs";

// Manual "Sync now" — safety net for local dev (no public webhook reachable)
// or a missed Pub/Sub push.
export async function POST() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGmailHistory();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Manual Gmail sync error:", error);
    const message = error instanceof Error ? error.message : "Failed to sync";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
