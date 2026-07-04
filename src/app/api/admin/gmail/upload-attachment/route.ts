import { NextResponse } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { verifyAdmin } from "@/lib/auth-helpers";
import { generateImageName, getCloudinaryFolder } from "@/lib/image-naming";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // Gmail's own attachment limit

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { success: false, error: "Cloudinary is not configured." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "File exceeds the 25MB attachment limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicId = generateImageName("attachment", file.name);
    const folder = getCloudinaryFolder("email-attachments");

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: "auto", use_filename: true },
        (err, res) => {
          if (err) return reject(err);
          if (!res) return reject(new Error("Empty upload response"));
          resolve({ secure_url: res.secure_url, public_id: res.public_id });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  } catch (error) {
    console.error("Attachment upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload attachment" }, { status: 500 });
  }
}
