import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { profileRepo } from "@/modules/portfolio/profile/queries";

export async function GET() {
  try {
    const profile = await profileRepo.get();
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
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
      name: body.name,
      designation: body.designation,
      bio: body.bio,
      longBio: body.longBio || null,
      avatarUrl: body.avatarUrl || null,
      avatarAlt: body.avatarAlt || null,
      resumeUrl: body.resumeUrl || null,
      location: body.location || null,
      availability: body.availability || null,
      email: body.email || null,
      whatsapp: body.whatsapp || null,
      github: body.github || null,
      linkedin: body.linkedin || null,
      facebook: body.facebook || null,
    };

    const profile = await profileRepo.upsert(data, { id: "singleton", ...data });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("POST profile error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile"
    }, { status: 500 });
  }
}
