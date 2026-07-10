import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth";
import { verifyAdmin } from "@/lib/auth-helpers";
import { auth } from "@/lib/auth";
import { decrypt } from "@/modules/vault/service/crypto";
import { signReauthToken, verifyReauthToken, VAULT_REAUTH_COOKIE, VAULT_REAUTH_TTL_MS } from "@/modules/vault/service/reauth";
import { checkVaultRateLimit, recordVaultAttempt } from "@/modules/vault/service/rate-limit";
import { notifyVaultAccess } from "@/modules/vault/service/notify";
import { vaultItemsRepo, vaultAuditRepo } from "@/modules/vault/queries";

// The only route that ever decrypts field values. Deliberately separate from
// GET/PATCH so revealing a secret is always a distinct, auditable action —
// re-auth, rate limiting, and audit logging all hang off this one route.
//
// Responds 200 even when re-auth is still needed — this is an expected step
// in the normal flow, not an error, so the client can branch on the body
// without axios treating it as a request failure.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await vaultItemsRepo.getWithOrderedFields(id);
  if (!item) {
    return NextResponse.json({ success: false, error: "Vault item not found" }, { status: 404 });
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
      notifyVaultAccess({
        action: "locked_out",
        ipAddress,
        userAgent: requestHeaders.get("user-agent"),
      });
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
    const fields = item.fields.map((f) => ({
      id: f.id,
      label: f.label,
      type: f.type,
      order: f.order,
      value: decrypt(f.encryptedValue),
    }));

    const userAgent = requestHeaders.get("user-agent");
    await vaultAuditRepo.create({ vaultItemId: id, action: "opened", ipAddress, userAgent });
    notifyVaultAccess({ action: "opened", itemTitle: item.title, ipAddress, userAgent });

    const response = NextResponse.json({ success: true, data: fields });
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
    console.error("Reveal vault item error:", error);
    return NextResponse.json({ success: false, error: "Failed to decrypt vault item" }, { status: 500 });
  }
}
