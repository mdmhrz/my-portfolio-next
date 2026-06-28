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
    const banner = await prisma.banner.upsert({
      where: { id: "singleton" },
      update: {
        name: body.name,
        title: body.title,
        description: body.description,
        chips: body.chips,
        github: body.github,
        linkedin: body.linkedin,
        facebook: body.facebook,
        email: body.email,
      },
      create: {
        id: "singleton",
        name: body.name,
        title: body.title,
        description: body.description,
        chips: body.chips,
        github: body.github,
        linkedin: body.linkedin,
        facebook: body.facebook,
        email: body.email,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("POST banner error:", error);
    return NextResponse.json({ success: false, error: "Failed to update banner" }, { status: 500 });
  }
}
