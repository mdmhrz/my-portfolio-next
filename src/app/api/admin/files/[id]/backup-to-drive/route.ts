import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { r2Provider } from "@/lib/storage/r2-provider";
import { driveProvider } from "@/lib/storage/drive-provider";

export const runtime = "nodejs";

const MODULE_LABELS: Record<string, string> = { vault: "Vault", "file-manager": "File Manager" };

function moduleLabel(relatedModule: string): string {
  return MODULE_LABELS[relatedModule] ?? relatedModule.replace(/(^|-)(\w)/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase());
}

// Walks a FileManagerFolder's parentId chain to build human-readable path
// segments, so a Drive backup lands in the same place in Drive as the file
// sits in the app's own folder tree (see file-manager-plan.md Phase 9).
async function folderPathSegments(folderId: string | null): Promise<string[]> {
  const segments: string[] = [];
  let currentId = folderId;
  while (currentId) {
    const folder: { name: string; parentId: string | null } | null = await prisma.fileManagerFolder.findUnique({
      where: { id: currentId },
      select: { name: true, parentId: true },
    });
    if (!folder) break;
    segments.unshift(folder.name);
    currentId = folder.parentId;
  }
  return segments;
}

// Explicit, per-file, admin-triggered — never automatic on upload (see
// storage-integration-plan.md Phase 4). Only ever copies an R2 original;
// there's nothing to back up on a row that's already a Drive copy.
export async function POST(
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
  if (asset.provider !== "r2") {
    return NextResponse.json({ success: false, error: "Only R2-stored files can be backed up to Drive" }, { status: 400 });
  }

  // Idempotent — a second click on an already-mirrored file returns the
  // existing copy instead of uploading a duplicate to Drive.
  const existingMirror = await prisma.fileAsset.findFirst({ where: { mirrorOfId: asset.id, provider: "drive" } });
  if (existingMirror) {
    return NextResponse.json({ success: true, data: existingMirror });
  }

  try {
    const sourceUrl = await r2Provider.getSignedUrl({ id: asset.id, providerFileId: asset.providerFileId });
    const sourceRes = await fetch(sourceUrl);
    if (!sourceRes.ok) throw new Error(`Failed to read source file from R2 (${sourceRes.status})`);
    const buffer = Buffer.from(await sourceRes.arrayBuffer());

    const pathSegments = [moduleLabel(asset.relatedModule), ...(await folderPathSegments(asset.folderId))];

    const { providerFileId } = await driveProvider.upload({
      buffer,
      fileName: asset.name,
      mimeType: asset.mimeType,
      folder: pathSegments.join("/"),
    });

    const mirror = await prisma.fileAsset.create({
      data: {
        provider: "drive",
        providerFileId,
        folder: asset.relatedModule,
        name: asset.name,
        mimeType: asset.mimeType,
        size: asset.size,
        relatedModule: asset.relatedModule,
        relatedId: asset.relatedId,
        mirrorOfId: asset.id,
        folderId: asset.folderId,
      },
    });

    return NextResponse.json({ success: true, data: mirror });
  } catch (error) {
    console.error("Backup to Drive error:", error);
    return NextResponse.json({ success: false, error: "Failed to back up file to Drive" }, { status: 500 });
  }
}
