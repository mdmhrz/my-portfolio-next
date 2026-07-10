import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { jobSettingsRepo } from "@/modules/jobs/queries";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const settings = await jobSettingsRepo.get();
  return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await jobSettingsRepo.update(body.gmailLabel);
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("PATCH job tracker settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
