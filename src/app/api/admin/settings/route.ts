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
    // Site logo, Blog Display Settings, Testimonials Display Settings, and other settings
    // save to this same endpoint independently — only touch fields actually present in the
    // request body, or saving one silently wipes the other's fields back to null/default.
    const data: Record<string, unknown> = {};

    if ("logoUrl" in body) data.logoUrl = body.logoUrl || null;
    if ("logoAlt" in body) data.logoAlt = body.logoAlt || null;
    if ("logoUrlDark" in body) data.logoUrlDark = body.logoUrlDark || null;
    if ("logoAltDark" in body) data.logoAltDark = body.logoAltDark || null;
    if ("faviconUrl" in body) data.faviconUrl = body.faviconUrl || null;
    // Homepage blog section (visibility now lives in SectionConfig, key="homepageBlogs")
    if ("homepageBlogTitle" in body) data.homepageBlogTitle = body.homepageBlogTitle || null;
    if ("homepageBlogSubtitle" in body) data.homepageBlogSubtitle = body.homepageBlogSubtitle || null;
    if ("homepageBlogTemplate" in body) data.homepageBlogTemplate = body.homepageBlogTemplate || "standard";
    // Homepage testimonials section (visibility now lives in SectionConfig, key="testimonials")
    if ("homepageTestimonialsTitle" in body) data.homepageTestimonialsTitle = body.homepageTestimonialsTitle || null;
    if ("homepageTestimonialsSubtitle" in body) data.homepageTestimonialsSubtitle = body.homepageTestimonialsSubtitle || null;
    if ("homepageTestimonialsTemplate" in body) data.homepageTestimonialsTemplate = body.homepageTestimonialsTemplate || "carousel";
    if ("homepageTestimonialsStat" in body) data.homepageTestimonialsStat = body.homepageTestimonialsStat || null;
    if ("homepageTestimonialsStatLabel" in body) data.homepageTestimonialsStatLabel = body.homepageTestimonialsStatLabel || null;
    if ("homepageTestimonialsCtaText" in body) data.homepageTestimonialsCtaText = body.homepageTestimonialsCtaText || null;
    if ("homepageTestimonialsCtaLink" in body) data.homepageTestimonialsCtaLink = body.homepageTestimonialsCtaLink || null;

    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    // Favicon lives in the root layout, which every route shares — revalidate the
    // whole layout tree for it instead of just the homepage/about/contact paths.
    if ("faviconUrl" in body) {
      revalidatePath("/", "layout");
    } else {
      revalidatePath("/");
      revalidatePath("/about");
      revalidatePath("/contact");
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("POST settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
