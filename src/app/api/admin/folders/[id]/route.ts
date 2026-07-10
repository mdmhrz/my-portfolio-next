import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/storage";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

async function buildBreadcrumb(folderId: string) {
  const crumbs: { id: string; name: string }[] = [];
  let currentId: string | null = folderId;
  while (currentId) {
    const folder: { id: string; name: string; parentId: string | null } | null =
      await prisma.fileManagerFolder.findUnique({
        where: { id: currentId },
        select: { id: true, name: true, parentId: true },
      });
    if (!folder) break;
    crumbs.unshift({ id: folder.id, name: folder.name });
    currentId = folder.parentId;
  }
  return crumbs;
}

// Every folder id in `rootId`'s subtree, including `rootId` itself.
async function collectDescendantIds(rootId: string): Promise<Set<string>> {
  const all = await prisma.fileManagerFolder.findMany({ select: { id: true, parentId: true } });
  const childrenOf = new Map<string, string[]>();
  for (const f of all) {
    if (!f.parentId) continue;
    childrenOf.set(f.parentId, [...(childrenOf.get(f.parentId) ?? []), f.id]);
  }
  const result = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const id = queue.pop()!;
    for (const childId of childrenOf.get(id) ?? []) {
      if (!result.has(childId)) {
        result.add(childId);
        queue.push(childId);
      }
    }
  }
  return result;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const folder = await prisma.fileManagerFolder.findUnique({ where: { id } });
  if (!folder) {
    return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
  }

  const breadcrumb = await buildBreadcrumb(id);
  return NextResponse.json({ success: true, data: { folder, breadcrumb } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const data: { name?: string; parentId?: string | null } = {};

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Folder name cannot be empty" }, { status: 400 });
    }
    data.name = name;
  }

  if ("parentId" in (body ?? {})) {
    const nextParentId: string | null = !body.parentId || body.parentId === "root" ? null : body.parentId;
    if (nextParentId === id) {
      return NextResponse.json({ success: false, error: "A folder cannot be moved into itself" }, { status: 400 });
    }
    if (nextParentId) {
      const descendants = await collectDescendantIds(id);
      if (descendants.has(nextParentId)) {
        return NextResponse.json({ success: false, error: "Cannot move a folder into its own subfolder" }, { status: 400 });
      }
    }
    data.parentId = nextParentId;
  }

  try {
    const folder = await prisma.fileManagerFolder.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: folder });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: "A folder with this name already exists here" }, { status: 409 });
    }
    console.error("Folder update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update folder" }, { status: 500 });
  }
}

// Recursive delete: every FileAsset in the subtree loses its storage bytes
// first, then one cascading DB delete removes the folder tree + FileAsset
// rows together (see file-manager-plan.md — Folder delete is recursive).
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const folder = await prisma.fileManagerFolder.findUnique({ where: { id } });
  if (!folder) {
    return NextResponse.json({ success: false, error: "Folder not found" }, { status: 404 });
  }

  try {
    const subtreeIds = await collectDescendantIds(id);
    const assets = await prisma.fileAsset.findMany({ where: { folderId: { in: [...subtreeIds] } } });

    for (const asset of assets) {
      await getStorageProvider(asset.provider).delete(asset.providerFileId);
    }

    await prisma.fileManagerFolder.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { deletedFolders: subtreeIds.size, deletedFiles: assets.length } });
  } catch (error) {
    console.error("Folder delete error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete folder" }, { status: 500 });
  }
}
