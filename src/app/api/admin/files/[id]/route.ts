import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";

export const runtime = "nodejs";

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

  try {
    const url = await getStorageProvider(asset.provider).getSignedUrl({ id: asset.id, providerFileId: asset.providerFileId });
    return NextResponse.json({ success: true, data: { url, name: asset.name, mimeType: asset.mimeType } });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json({ success: false, error: "Failed to get file URL" }, { status: 500 });
  }
}

// Rename and/or move a file within the File Manager tree. Vault/other-module
// FileAsset rows never call this — nothing else exposes a rename/move UI.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.fileAsset.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const data: { name?: string; folderId?: string | null } = {};

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "File name cannot be empty" }, { status: 400 });
    }
    data.name = name;
  }

  if ("folderId" in (body ?? {})) {
    data.folderId = !body.folderId || body.folderId === "root" ? null : body.folderId;
  }

  try {
    const asset = await prisma.fileAsset.update({ where: { id }, data });
    // A Drive mirror is a bookkeeping copy of its source, not an independent
    // file — move it along so it stays colocated. Otherwise the mirror is
    // left behind in the old folder: the "backed up to Drive" badge (which
    // is computed per-folder from mirror rows) disappears after a move, and
    // the old folder never reads as empty even though nothing in it is
    // reachable anymore.
    if ("folderId" in data) {
      await prisma.fileAsset.updateMany({ where: { mirrorOfId: id }, data: { folderId: data.folderId } });
    }
    return NextResponse.json({ success: true, data: asset });
  } catch (error) {
    console.error("File update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update file" }, { status: 500 });
  }
}

export async function DELETE(
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

  try {
    // Deleting an r2 source must also take its Drive mirror with it —
    // otherwise the mirror is orphaned: its bytes stay in Drive forever and
    // its DB row's mirrorOfId points at nothing.
    const mirrors = await prisma.fileAsset.findMany({ where: { mirrorOfId: id } });
    for (const mirror of mirrors) {
      await getStorageProvider(mirror.provider).delete(mirror.providerFileId);
      await prisma.fileAsset.delete({ where: { id: mirror.id } });
    }
    await getStorageProvider(asset.provider).delete(asset.providerFileId);
    await prisma.fileAsset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete file" }, { status: 500 });
  }
}
