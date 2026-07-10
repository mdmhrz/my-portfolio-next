import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { APIError } from "better-auth";
import { verifyAdmin } from "@/lib/auth-helpers";
import { auth } from "@/lib/auth";
import { signReauthToken, verifyReauthToken, VAULT_REAUTH_COOKIE, VAULT_REAUTH_TTL_MS } from "@/modules/vault/service/reauth";
import { checkVaultRateLimit, recordVaultAttempt } from "@/modules/vault/service/rate-limit";
import { vaultItemsRepo, vaultHistoryRepo, vaultAuditRepo, restoreVaultItemFromHistory } from "@/modules/vault/queries";

interface HistorySnapshotField {
  label: string;
  type: string;
  encryptedValue: string;
  order: number;
}

// Re-auth gated the same way /reveal is — restoring an old version is exactly
// as sensitive as revealing one (it overwrites the live secret), so it earns
// the same password-or-grace-cookie check.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id, historyId } = await params;
  const target = await vaultHistoryRepo.findOne(historyId, id);
  if (!target) {
    return NextResponse.json({ success: false, error: "History entry not found" }, { status: 404 });
  }
  const current = await vaultItemsRepo.getWithFields(id);
  if (!current) {
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
    const snapshotFields = target.snapshot as unknown as HistorySnapshotField[];

    const item = await restoreVaultItemFromHistory(
      id,
      current.fields.map((f) => ({
        label: f.label,
        type: f.type,
        encryptedValue: f.encryptedValue,
        order: f.order,
      })),
      snapshotFields
    );

    await vaultAuditRepo.create({ vaultItemId: id, action: "restored" });

    const response = NextResponse.json({ success: true, data: item });
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
    console.error("Restore vault item error:", error);
    return NextResponse.json({ success: false, error: "Failed to restore version" }, { status: 500 });
  }
}
