import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/modules/vault/service/crypto";
import { getStorageProvider } from "@/lib/storage";
import { vaultItemsRepo, vaultAuditRepo, updateVaultItemWithHistory } from "@/modules/vault/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const item = await vaultItemsRepo.get(id);

  if (!item) {
    return NextResponse.json({ success: false, error: "Vault item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: item });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await vaultItemsRepo.getWithFields(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vault item not found" }, { status: 404 });
    }

    const newFields: { label: string; type?: string; value?: string }[] | undefined = body.fields;

    const item = await updateVaultItemWithHistory(
      id,
      existing.fields.map((f) => ({
        label: f.label,
        type: f.type,
        encryptedValue: f.encryptedValue,
        order: f.order,
      })),
      {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.favorite !== undefined && { favorite: body.favorite }),
        ...(body.expiresAt !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(newFields !== undefined && {
          fields: {
            create: newFields.map((f, i) => ({
              label: f.label,
              type: f.type || "password",
              encryptedValue: encrypt(f.value ?? ""),
              order: i,
            })),
          },
        }),
      },
      newFields !== undefined
    );

    // A bare favorite-star toggle isn't a substantive edit — skip logging it
    // so the audit trail doesn't fill up with noise from one click.
    const isFavoriteOnlyToggle = Object.keys(body).length === 1 && "favorite" in body;
    if (!isFavoriteOnlyToggle) {
      await vaultAuditRepo.create({ vaultItemId: id, action: "updated" });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("PATCH vault item error:", error);
    return NextResponse.json({ success: false, error: "Failed to update vault item" }, { status: 500 });
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

  try {
    const { id } = await params;

    // No DB-level cascade across the module boundary (FileAsset.relatedId is
    // a soft link, not an FK) — attachments must be deleted explicitly,
    // storage object first, before the owning VaultItem goes away. Query
    // catches both the r2 original and any Drive backup (both carry the
    // same relatedModule/relatedId) — each must go through its own
    // provider, not a hardcoded r2Provider, or a Drive-backed attachment's
    // real Drive file is silently never deleted.
    const attachments = await prisma.fileAsset.findMany({ where: { relatedModule: "vault", relatedId: id } });
    for (const attachment of attachments) {
      await getStorageProvider(attachment.provider).delete(attachment.providerFileId);
    }
    if (attachments.length > 0) {
      await prisma.fileAsset.deleteMany({ where: { id: { in: attachments.map((a) => a.id) } } });
    }

    await vaultItemsRepo.remove(id);
    await vaultAuditRepo.create({ vaultItemId: id, action: "deleted" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE vault item error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete vault item" }, { status: 500 });
  }
}
