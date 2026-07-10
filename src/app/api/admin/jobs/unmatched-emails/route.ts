import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { unmatchedEmailsRepo } from "@/modules/jobs/queries";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const emails = await unmatchedEmailsRepo.list();
  return NextResponse.json({ success: true, data: emails });
}
