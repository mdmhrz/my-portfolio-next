import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { r2Provider, isR2Configured } from "@/lib/storage/r2-provider";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 25 * 1024 * 1024;

// Lists FileAsset metadata (no signed URLs — fetch those per-item via
// GET /api/admin/files/[id]) for a given owner, e.g. a Vault item's attachments.
export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const relatedModule = searchParams.get("relatedModule");
  const relatedId = searchParams.get("relatedId");
  const folderIdParam = searchParams.get("folderId");
  const limitParam = searchParams.get("limit");

  if (!relatedModule) {
    return NextResponse.json({ success: false, error: "relatedModule is required" }, { status: 400 });
  }

  // folderId is File Manager-only: "root" -> folderId: null, a real id ->
  // that folder, omitted entirely -> no filter (Vault/other callers never
  // pass this and are unaffected).
  const folderFilter =
    folderIdParam === null ? {} : { folderId: folderIdParam === "root" ? null : folderIdParam };

  // limit is File Manager's "Recent Files" view — most-recent-first across
  // every folder, reusing this route instead of a dedicated one.
  const limit = limitParam ? Number(limitParam) : undefined;

  const assets = await prisma.fileAsset.findMany({
    where: { relatedModule, ...(relatedId && { relatedId }), ...folderFilter },
    orderBy: { createdAt: "desc" },
    ...(limit && Number.isFinite(limit) && { take: limit }),
  });

  return NextResponse.json({ success: true, data: assets });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { success: false, error: "R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const relatedModule = formData.get("relatedModule");
    const relatedId = formData.get("relatedId") as string | null;
    const folderIdField = formData.get("folderId") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }
    if (!relatedModule || typeof relatedModule !== "string") {
      return NextResponse.json({ success: false, error: "relatedModule is required" }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "File exceeds the 25MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    const { providerFileId } = await r2Provider.upload({
      buffer,
      fileName: file.name,
      mimeType,
      folder: relatedModule,
    });

    const asset = await prisma.fileAsset.create({
      data: {
        provider: "r2",
        providerFileId,
        folder: relatedModule,
        name: file.name,
        mimeType,
        size: file.size,
        relatedModule,
        relatedId: relatedId || null,
        folderId: folderIdField && folderIdField !== "root" ? folderIdField : null,
      },
    });

    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
  }
}
