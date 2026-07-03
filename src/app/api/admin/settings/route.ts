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
    // Settings (CTA/footer) and Blog Display Settings save to this same endpoint
    // independently — only touch fields actually present in the request body,
    // or saving one silently wipes the other's fields back to null/default.
    const data: Record<string, unknown> = {};

    if ("ctaHeadline" in body) data.ctaHeadline = body.ctaHeadline || null;
    if ("ctaSubtext" in body) data.ctaSubtext = body.ctaSubtext || null;
    if ("footerText" in body) data.footerText = body.footerText || null;
    // Homepage blog section
    if ("homepageBlogVisible" in body) data.homepageBlogVisible = body.homepageBlogVisible ?? true;
    if ("homepageBlogTitle" in body) data.homepageBlogTitle = body.homepageBlogTitle || null;
    if ("homepageBlogSubtitle" in body) data.homepageBlogSubtitle = body.homepageBlogSubtitle || null;
    if ("homepageBlogTemplate" in body) data.homepageBlogTemplate = body.homepageBlogTemplate || "standard";

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
