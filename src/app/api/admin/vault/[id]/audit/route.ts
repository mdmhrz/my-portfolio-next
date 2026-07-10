import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAdmin } from "@/lib/auth-helpers";
import { vaultAuditRepo } from "@/modules/vault/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const logs = await vaultAuditRepo.list(id);

  return NextResponse.json({ success: true, data: logs });
}

// Server has no visibility into clipboard writes (they happen entirely in the
// browser), so "copied" is the one audit action the client reports itself —
// fire-and-forget from the UI, never blocking the copy.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const log = await vaultAuditRepo.create({
    vaultItemId: id,
    action: "copied",
    fieldLabel: body.fieldLabel || null,
    ipAddress,
    userAgent: requestHeaders.get("user-agent"),
  });

  return NextResponse.json({ success: true, data: log });
}
