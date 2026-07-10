import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { navLinksRepo } from "@/modules/portfolio/nav-links/queries";

export async function GET() {
  try {
    const navLinks = await navLinksRepo.list();
    return NextResponse.json({ success: true, data: navLinks });
  } catch (error) {
    console.error("GET nav-links error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch nav links" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const count = await navLinksRepo.count();
    const navLink = await navLinksRepo.create({
      label: body.label,
      href: body.href,
      order: count,
      showInNav: body.showInNav ?? true,
      showInFooter: body.showInFooter ?? true,
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true, data: navLink });
  } catch (error) {
    console.error("POST nav-link error:", error);
    return NextResponse.json({ success: false, error: "Failed to create nav link" }, { status: 500 });
  }
}
