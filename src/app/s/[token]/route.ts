import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2Provider } from "@/lib/storage/r2-provider";

export const runtime = "nodejs";

// Public, unauthenticated — this is the actual link handed out by the File
// Manager's "Share" action. Deliberately short and stable (unlike a raw R2
// presigned URL); the redirect target underneath is re-minted fresh on
// every visit, so a "never expires" share isn't bounded by R2 presign's own
// max-expiry window. See file-manager-plan.md Phase 8.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const asset = await prisma.fileAsset.findUnique({ where: { shareToken: token } });

  if (!asset || !asset.shareEnabled || asset.provider !== "r2") {
    return new NextResponse("This link is no longer valid.", { status: 404 });
  }
  if (asset.shareExpiresAt && asset.shareExpiresAt.getTime() < Date.now()) {
    return new NextResponse("This link has expired.", { status: 410 });
  }

  const url = await r2Provider.getSignedUrl({ id: asset.id, providerFileId: asset.providerFileId }, 300);
  return NextResponse.redirect(url);
}
