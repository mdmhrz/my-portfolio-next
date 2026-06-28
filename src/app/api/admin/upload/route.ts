import { NextResponse } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/auth-helpers";
import { generateImageName, getCloudinaryFolder } from "@/lib/image-naming";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { success: false, error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "portfolio";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Only image files are allowed" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicId = generateImageName(folder, file.name);
    const cloudinaryFolder = getCloudinaryFolder(folder);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: cloudinaryFolder, public_id: publicId, resource_type: "image" },
        (err, res) => {
          if (err) return reject(err);
          if (!res) return reject(new Error("Empty upload response"));
          resolve({ secure_url: res.secure_url, public_id: res.public_id });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}
