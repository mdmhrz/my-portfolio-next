import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const banner = await prisma.banner.findFirst();
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("GET banner error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch banner" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // The Banner content page (tagline/chips) and the Hero Template page
    // (background/layout/animation) both save to this same endpoint
    // independently — only touch fields actually present in the request body,
    // or saving one would silently wipe the other's fields back to null/default.
    const data: Record<string, unknown> = {};

    if ("description" in body) data.description = body.description;
    if ("chips" in body) data.chips = body.chips;
    if ("backgroundImg" in body) data.backgroundImg = body.backgroundImg || null;
    if ("backgroundAlt" in body) data.backgroundAlt = body.backgroundAlt || null;
    if ("backgroundTemplate" in body) data.backgroundTemplate = body.backgroundTemplate || "none";
    if ("layoutTemplate" in body) data.layoutTemplate = body.layoutTemplate || "signature";
    if ("animationTemplate" in body) data.animationTemplate = body.animationTemplate || "signature";
    if ("heroImage" in body) data.heroImage = body.heroImage || null;
    if ("heroImageAlt" in body) data.heroImageAlt = body.heroImageAlt || null;

    const banner = await prisma.banner.upsert({
      where: { id: "singleton" },
      update: data,
      create: {
        id: "singleton",
        description: body.description ?? "",
        chips: body.chips ?? [],
        ...data,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("POST banner error:", error);
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 });
  }
}
