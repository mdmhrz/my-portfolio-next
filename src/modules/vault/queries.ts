import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Masked select — never returns encryptedValue or plaintext. List/detail reads
// only need to know a field exists; actual values come from the /reveal route.
const maskedItemInclude = {
  fields: {
    select: { id: true, label: true, type: true, order: true },
    orderBy: { order: "asc" as const },
  },
};

interface HistorySnapshotField {
  label: string;
  type: string;
  encryptedValue: string;
  order: number;
}

export const vaultItemsRepo = {
  list: () =>
    prisma.vaultItem.findMany({
      orderBy: [{ favorite: "desc" }, { updatedAt: "desc" }],
      include: maskedItemInclude,
    }),
  get: (id: string) => prisma.vaultItem.findUnique({ where: { id }, include: maskedItemInclude }),
  getWithFields: (id: string) =>
    prisma.vaultItem.findUnique({ where: { id }, include: { fields: true } }),
  getWithOrderedFields: (id: string) =>
    prisma.vaultItem.findUnique({
      where: { id },
      include: { fields: { orderBy: { order: "asc" as const } } },
    }),
  create: (data: Prisma.VaultItemCreateInput) =>
    prisma.vaultItem.create({ data, include: maskedItemInclude }),
  remove: (id: string) => prisma.vaultItem.delete({ where: { id } }),
};

export const vaultHistoryRepo = {
  list: (vaultItemId: string) =>
    prisma.vaultItemHistory.findMany({ where: { vaultItemId }, orderBy: { changedAt: "desc" } }),
  findOne: (id: string, vaultItemId: string) =>
    prisma.vaultItemHistory.findFirst({ where: { id, vaultItemId } }),
};

export const vaultAuditRepo = {
  list: (vaultItemId: string) =>
    prisma.vaultAuditLog.findMany({ where: { vaultItemId }, orderBy: { createdAt: "desc" }, take: 50 }),
  create: (data: Prisma.VaultAuditLogUncheckedCreateInput) => prisma.vaultAuditLog.create({ data }),
};

export const vaultLoginAttemptsRepo = {
  recentFailures: (since: Date, take: number) =>
    prisma.vaultLoginAttempt.findMany({
      where: { success: false, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take,
    }),
  record: (success: boolean, ipAddress?: string | null) =>
    prisma.vaultLoginAttempt.create({ data: { success, ipAddress: ipAddress || null } }),
};

// Snapshots `existingFields` into history (only when the fields are actually
// changing), clears the old fields, then applies `data` — same shape as a
// plain vaultItem.update. Used by PATCH, where `data.fields.create` (if
// present) already carries the newly encrypted field values.
export function updateVaultItemWithHistory(
  id: string,
  existingFields: HistorySnapshotField[],
  data: Prisma.VaultItemUpdateInput,
  snapshotBeforeUpdate: boolean
) {
  return prisma.$transaction(async (tx) => {
    if (snapshotBeforeUpdate) {
      await tx.vaultItemHistory.create({
        data: { vaultItemId: id, snapshot: existingFields as unknown as Prisma.InputJsonValue },
      });
      await tx.vaultField.deleteMany({ where: { vaultItemId: id } });
    }
    return tx.vaultItem.update({ where: { id }, data, include: maskedItemInclude });
  });
}

// Push the current field set onto history (restoring is itself undo-able),
// then replace the live fields with the target snapshot's values verbatim
// (already encrypted — no re-encryption needed, they're the same ciphertext).
export function restoreVaultItemFromHistory(
  id: string,
  currentFields: HistorySnapshotField[],
  snapshotFields: HistorySnapshotField[]
) {
  return prisma.$transaction(async (tx) => {
    await tx.vaultItemHistory.create({
      data: { vaultItemId: id, snapshot: currentFields as unknown as Prisma.InputJsonValue },
    });
    await tx.vaultField.deleteMany({ where: { vaultItemId: id } });
    return tx.vaultItem.update({
      where: { id },
      data: {
        fields: {
          create: snapshotFields.map((f) => ({
            label: f.label,
            type: f.type,
            encryptedValue: f.encryptedValue,
            order: f.order,
          })),
        },
      },
      include: maskedItemInclude,
    });
  });
}
