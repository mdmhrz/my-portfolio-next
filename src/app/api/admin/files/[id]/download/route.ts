import { NextResponse } from "next/server";
import { Readable } from "stream";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { r2Provider } from "@/lib/storage/r2-provider";
import { getDriveClient } from "@/modules/gmail/service/client";

export const runtime = "nodejs";

// Only Drive actually needs this — R2 has real presigned URLs (see
// GET /api/admin/files/[id]), so the R2 branch here is just a redirect for
// callers that hit /download uniformly regardless of provider. The Drive
// branch is the real reason this route exists: Drive has no presigned-URL
// equivalent, so this proxies the bytes through our own server instead of
// ever handing the client a raw Drive link or this account's access token.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const asset = await prisma.fileAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  if (asset.provider === "r2") {
    const url = await r2Provider.getSignedUrl({ id: asset.id, providerFileId: asset.providerFileId });
    return NextResponse.redirect(url);
  }

  if (asset.provider === "drive") {
    try {
      const { drive } = await getDriveClient();
      const driveRes = await drive.files.get(
        { fileId: asset.providerFileId, alt: "media" },
        { responseType: "stream" }
      );
      const webStream = Readable.toWeb(driveRes.data as unknown as Readable) as unknown as ReadableStream;
      return new NextResponse(webStream, {
        headers: {
          "Content-Type": asset.mimeType,
          "Content-Disposition": `attachment; filename="${asset.name}"`,
        },
      });
    } catch (error) {
      console.error("Drive download error:", error);
      return NextResponse.json({ success: false, error: "Failed to download from Drive" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: false, error: "Unknown storage provider" }, { status: 500 });
}
