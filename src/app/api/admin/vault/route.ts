import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { encrypt } from "@/modules/vault/service/crypto";
import { vaultItemsRepo, vaultAuditRepo } from "@/modules/vault/queries";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await vaultItemsRepo.list();
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

    const item = await vaultItemsRepo.create({
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
    });

    await vaultAuditRepo.create({ vaultItemId: item.id, action: "created" });

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("POST vault error:", error);
    return NextResponse.json({ success: false, error: "Failed to create vault item" }, { status: 500 });
  }
}
