import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

export const runtime = "nodejs";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.gmailAccount.findFirst({
    select: { email: true, watchExpiration: true },
  });

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

  const account = await prisma.gmailAccount.findFirst();
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

  await prisma.gmailAccount.delete({ where: { id: account.id } });

  return NextResponse.json({ success: true });
}
