import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGmailClient, startWatch } from "@/lib/gmail";

export const runtime = "nodejs";

// Gmail's users.watch() expires after ~7 days and must be renewed periodically.
// Call this on a schedule (Vercel Cron, or any external scheduler) with
// `Authorization: Bearer ${CRON_SECRET}`.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.gmailAccount.findFirst();
  if (!account) {
    return NextResponse.json({ success: true, message: "No Gmail account connected" });
  }

  try {
    const { gmail } = await getGmailClient();
    const result = await startWatch(gmail, account.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Gmail watch renewal error:", error);
    const message = error instanceof Error ? error.message : "Failed to renew watch";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
