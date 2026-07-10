import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth";
import { verifyAdmin } from "@/lib/auth-helpers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { r2Provider } from "@/lib/storage/r2-provider";
import { signReauthToken, verifyReauthToken, VAULT_REAUTH_COOKIE, VAULT_REAUTH_TTL_MS } from "@/modules/vault/service/reauth";
import { checkVaultRateLimit, recordVaultAttempt } from "@/modules/vault/service/rate-limit";
import { notifyVaultAccess } from "@/modules/vault/service/notify";
import { vaultAuditRepo } from "@/modules/vault/queries";

// Re-auth gated the same way /reveal and /restore are — an attachment is
// exactly as sensitive as a field's value (often literally a .pem/.key),
// so downloading one earns the same password-or-grace-cookie check rather
// than an "some attachments aren't secrets" exception nobody would maintain.
//
// Named "download", not "reveal", despite doing the identical dance to
// vault/[id]/reveal — a leaf folder literally named "reveal" already exists
// two levels up under the same [id] ancestor, and Turbopack's dev-mode route
// resolver hangs indefinitely (not just slow — a genuine deadlock, verified
// by bisecting down to a 3-line handler at the old path) when two routes
// share a leaf segment name at different depths under one dynamic segment.
// Production `next build` compiled the old path fine; only `next dev` hung.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id, fileId } = await params;
  const asset = await prisma.fileAsset.findFirst({
    where: { id: fileId, relatedModule: "vault", relatedId: id },
  });
  if (!asset) {
    return NextResponse.json({ success: false, error: "Attachment not found" }, { status: 404 });
  }

  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const cookieHeader = requestHeaders.get("cookie") ?? "";
  const existingToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${VAULT_REAUTH_COOKIE}=`))
    ?.slice(VAULT_REAUTH_COOKIE.length + 1);

  const alreadyReauthed = verifyReauthToken(existingToken, admin.user.id);

  if (!alreadyReauthed) {
    const rateLimit = await checkVaultRateLimit();
    if (rateLimit.locked) {
      return NextResponse.json({
        success: false,
        requiresPassword: true,
        error: `Too many failed attempts — try again in ${rateLimit.retryAfterMinutes} minute(s).`,
      });
    }

    const body = await request.json().catch(() => ({}));
    const password: string | undefined = body.password;
    if (!password) {
      return NextResponse.json({ success: false, requiresPassword: true });
    }

    try {
      await auth.api.verifyPassword({ body: { password }, headers: requestHeaders });
      await recordVaultAttempt(true, ipAddress);
    } catch (error) {
      await recordVaultAttempt(false, ipAddress);
      if (error instanceof APIError) {
        return NextResponse.json({ success: false, requiresPassword: true, error: "Incorrect password." });
      }
      throw error;
    }
  }

  try {
    // Deliberately hardcoded to r2Provider, not getStorageProvider(asset.provider)
    // — a Drive-backed FileAsset's getSignedUrl() returns a proxy path through
    // GET /api/admin/files/[id]/download, which is only verifyAdmin()-gated, not
    // re-auth-gated like this route. Vault attachment uploads only ever create
    // "r2" rows today; wiring Drive mirrors into this route is Phase 4 work that
    // needs the reauth gate carried into the proxy route first.
    const url = await r2Provider.getSignedUrl({ id: asset.id, providerFileId: asset.providerFileId });

    const userAgent = requestHeaders.get("user-agent");
    await vaultAuditRepo.create({ vaultItemId: id, action: "opened", fieldLabel: asset.name, ipAddress, userAgent });
    notifyVaultAccess({ action: "opened", itemTitle: `attachment "${asset.name}"`, ipAddress, userAgent });

    const response = NextResponse.json({
      success: true,
      data: { url, name: asset.name, mimeType: asset.mimeType },
    });
    if (!alreadyReauthed) {
      response.cookies.set(VAULT_REAUTH_COOKIE, signReauthToken(admin.user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: VAULT_REAUTH_TTL_MS / 1000,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("Reveal vault attachment error:", error);
    return NextResponse.json({ success: false, error: "Failed to get attachment URL" }, { status: 500 });
  }
}
