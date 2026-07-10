import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function siteOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
}

// Creates (or updates the expiry of) a public share link. The token is
// short and permanent — the actual bytes are always served through a
// freshly-minted short-lived R2 presigned URL at request time (see
// GET /s/[token]), so a "never expires" share isn't limited by R2 presign's
// own max-expiry window. See file-manager-plan.md Phase 8.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const asset = await prisma.fileAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }
  // A Drive row's "signed URL" is our own admin-gated download proxy, never
  // a real public link — sharing only makes sense for r2 originals.
  if (asset.provider !== "r2") {
    return NextResponse.json({ success: false, error: "This file can't be shared" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const expiresInHours: number | null = typeof body?.expiresInHours === "number" ? body.expiresInHours : null;
  const shareExpiresAt = expiresInHours ? new Date(Date.now() + expiresInHours * 60 * 60 * 1000) : null;

  const shareToken = asset.shareToken ?? randomBytes(9).toString("base64url");

  const updated = await prisma.fileAsset.update({
    where: { id },
    data: { shareEnabled: true, shareToken, shareExpiresAt },
  });

  return NextResponse.json({
    success: true,
    data: { url: `${siteOrigin(request)}/s/${shareToken}`, shareEnabled: updated.shareEnabled, shareExpiresAt: updated.shareExpiresAt },
  });
}

// Revoke — clears the token entirely (not just the enabled flag), so a
// previously-distributed link can never be reused even if sharing is turned
// back on later; a fresh Share always mints a brand new token.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const asset = await prisma.fileAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  await prisma.fileAsset.update({
    where: { id },
    data: { shareEnabled: false, shareToken: null, shareExpiresAt: null },
  });

  return NextResponse.json({ success: true });
}
