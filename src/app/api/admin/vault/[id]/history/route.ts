import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-helpers";
import { vaultHistoryRepo } from "@/modules/vault/queries";

interface HistorySnapshotField {
  label: string;
  type: string;
  encryptedValue: string;
  order: number;
}

// Lists snapshot metadata only — field labels/types, never encryptedValue —
// so browsing history doesn't require a reveal. Restoring is a separate,
// re-auth-gated action (see ./[historyId]/restore).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const history = await vaultHistoryRepo.list(id);

  const data = history.map((h) => {
    const snapshot = h.snapshot as unknown as HistorySnapshotField[];
    return {
      id: h.id,
      changedAt: h.changedAt,
      fieldLabels: snapshot.map((f) => f.label),
    };
  });

  return NextResponse.json({ success: true, data });
}
