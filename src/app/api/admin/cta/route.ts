import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { ctaRepo } from "@/modules/portfolio/cta/queries";

export async function GET() {
  try {
    const cta = await ctaRepo.get();
    return NextResponse.json({ success: true, data: cta });
  } catch (error) {
    console.error("GET cta error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch CTA" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if ("headline" in body) data.headline = body.headline || "Let's build something solid.";
    if ("subtext" in body) data.subtext = body.subtext || "";
    if ("buttonLabel" in body) data.buttonLabel = body.buttonLabel || "Get in touch";
    if ("buttonHref" in body) data.buttonHref = body.buttonHref || "#contact";

    const cta = await ctaRepo.upsert(data, { id: "singleton", ...data });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: cta });
  } catch (error) {
    console.error("POST cta error:", error);
    return NextResponse.json({ success: false, error: "Failed to update CTA" }, { status: 500 });
  }
}
