import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const emails = await prisma.unmatchedJobEmail.findMany({
    orderBy: { receivedAt: "desc" },
  });
  return NextResponse.json({ success: true, data: emails });
}
