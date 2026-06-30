import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getFontFormat(mimeType: string): string {
  const formats: Record<string, string> = {
    "font/woff2": "woff2",
    "font/woff": "woff",
    "font/ttf": "truetype",
    "font/otf": "opentype",
    "application/x-font-woff2": "woff2",
  };
  return formats[mimeType] || "woff2";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fontFile = formData.get("font") as File;
    const fontName = formData.get("fontName") as string;
    const weights = JSON.parse((formData.get("weights") as string) || '["400", "700"]');

    if (!fontFile || !fontName) {
      return NextResponse.json(
        { error: "Font file and name required" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "font/woff2",
      "font/woff",
      "font/ttf",
      "font/otf",
      "application/x-font-woff2",
    ];
    if (!validTypes.includes(fontFile.type)) {
      return NextResponse.json(
        { error: "Invalid font format. Use .woff2, .woff, .ttf, or .otf" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = await fontFile.arrayBuffer();

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: `fonts/${fontName}`,
          folder: "portfolio-fonts",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(Buffer.from(buffer));
    });

    const fontUrl = (uploadResponse as any).secure_url;

    return NextResponse.json({
      success: true,
      fontUrl,
      fontName,
      weights,
    });
  } catch (error) {
    console.error("Font upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload font" },
      { status: 500 }
    );
  }
}
