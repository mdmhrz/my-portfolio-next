import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const about = await prisma.about.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ success: true, data: about });
  } catch (error) {
    console.error("GET about error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch about" }, { status: 500 });
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
      bio: body.bio,
      longBio: body.longBio || null,
      resumeUrl: body.resumeUrl || null,
      avatarUrl: body.avatarUrl || null,
      avatarAlt: body.avatarAlt || null,
      location: body.location || null,
      availability: body.availability || null,
    };

    const about = await prisma.about.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, data: about });
  } catch (error) {
    console.error("POST about error:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update about"
    }, { status: 500 });
  }
}
