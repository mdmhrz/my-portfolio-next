import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-helpers";
import { encrypt } from "@/lib/vault-crypto";

// Masked select — never returns encryptedValue or plaintext. List/detail reads
// only need to know a field exists; actual values come from the /reveal route.
const maskedItemInclude = {
  fields: {
    select: { id: true, label: true, type: true, order: true },
    orderBy: { order: "asc" as const },
  },
};

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.vaultItem.findMany({
      orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
      include: maskedItemInclude,
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET vault error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vault items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fields: { label: string; type?: string; value?: string }[] = body.fields || [];

    const item = await prisma.vaultItem.create({
      data: {
        title: body.title,
        category: body.category,
        description: body.description || null,
        tags: body.tags || [],
        favorite: body.favorite ?? false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        fields: {
          create: fields.map((f, i) => ({
            label: f.label,
            type: f.type || "password",
            encryptedValue: encrypt(f.value ?? ""),
            order: i,
          })),
        },
      },
      include: maskedItemInclude,
    });

    await prisma.vaultAuditLog.create({ data: { vaultItemId: item.id, action: "created" } });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("POST vault error:", error);
    return NextResponse.json({ success: false, error: "Failed to create vault item" }, { status: 500 });
  }
}
