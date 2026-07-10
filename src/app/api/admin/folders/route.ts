import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// "root" (or an omitted param) means the top level of the tree — there is no
// row for the root itself, only folders with parentId: null.
function parseParentId(value: string | null): string | null {
  return !value || value === "root" ? null : value;
}

export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Full flat tree, for the sidebar — client builds the nested structure.
  if (searchParams.get("tree") === "1") {
    const folders = await prisma.fileManagerFolder.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: folders });
  }

  const parentId = parseParentId(searchParams.get("parentId"));
  const folders = await prisma.fileManagerFolder.findMany({
    where: { parentId },
    include: { _count: { select: { children: true, files: true } } },
    orderBy: { name: "asc" },
  });

  const data = folders.map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.parentId,
    subfolderCount: f._count.children,
    fileCount: f._count.files,
    createdAt: f.createdAt,
  }));

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const parentId = parseParentId(body?.parentId ?? null);

  if (!name) {
    return NextResponse.json({ success: false, error: "Folder name is required" }, { status: 400 });
  }

  try {
    const folder = await prisma.fileManagerFolder.create({ data: { name, parentId } });
    return NextResponse.json({ success: true, data: folder });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: "A folder with this name already exists here" }, { status: 409 });
    }
    console.error("Folder create error:", error);
    return NextResponse.json({ success: false, error: "Failed to create folder" }, { status: 500 });
  }
}
