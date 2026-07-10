import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { decrypt } from "@/modules/gmail/service/crypto";
import { gmailAccountRepo } from "@/modules/gmail/queries";

export const runtime = "nodejs";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await gmailAccountRepo.findFirstMasked();

  return NextResponse.json({
    success: true,
    connected: Boolean(account),
    email: account?.email ?? null,
    watchExpiration: account?.watchExpiration ?? null,
  });
}

export async function DELETE() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await gmailAccountRepo.findFirst();
  if (!account) {
    return NextResponse.json({ success: true, message: "No Gmail account connected" });
  }

  try {
    await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `token=${encodeURIComponent(decrypt(account.refreshTokenEnc))}`,
    });
  } catch (error) {
    console.error("Failed to revoke Gmail token with Google (continuing to disconnect locally):", error);
  }

  await gmailAccountRepo.remove(account.id);

  return NextResponse.json({ success: true });
}
