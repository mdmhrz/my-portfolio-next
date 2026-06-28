import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("GET settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = {
      ctaHeadline: body.ctaHeadline || null,
      ctaSubtext: body.ctaSubtext || null,
      footerText: body.footerText || null,
    };

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("POST settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
