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
    const data = {
      description: body.description,
      chips: body.chips,
      backgroundImg: body.backgroundImg || null,
      backgroundAlt: body.backgroundAlt || null,
    };

    const banner = await prisma.banner.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("POST banner error:", error);
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 });
  }
}
