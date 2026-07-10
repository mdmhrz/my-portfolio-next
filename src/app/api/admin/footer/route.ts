import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { footerRepo } from "@/modules/portfolio/footer/queries";

export async function GET() {
  try {
    const footer = await footerRepo.get();
    return NextResponse.json({ success: true, data: footer });
  } catch (error) {
    console.error("GET footer error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch footer" }, { status: 500 });
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

    if ("bio" in body) data.bio = body.bio || null;
    if ("availabilityBadge" in body) data.availabilityBadge = body.availabilityBadge || "Open for roles";
    if ("availabilityText" in body) data.availabilityText = body.availabilityText || "";
    if ("location" in body) data.location = body.location || "";
    if ("primaryStack" in body) data.primaryStack = body.primaryStack || "";
    if ("copyrightName" in body) data.copyrightName = body.copyrightName || "MHR.DEV";

    const footer = await footerRepo.upsert(data, { id: "singleton", ...data });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true, data: footer });
  } catch (error) {
    console.error("POST footer error:", error);
    return NextResponse.json({ success: false, error: "Failed to update footer" }, { status: 500 });
  }
}
