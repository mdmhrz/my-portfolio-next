import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = new Set(["pageview", "resume_download"]);

// Public, first-party analytics collector. Fire-and-forget from the client.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const type = typeof body.type === "string" && ALLOWED_TYPES.has(body.type) ? body.type : "pageview";

    // Never record admin/dashboard traffic.
    const path = typeof body.path === "string" ? body.path.slice(0, 512) : null;
    if (path && path.startsWith("/admin")) {
      return new NextResponse(null, { status: 204 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        path,
        referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 512) || null : null,
        visitorId: typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : null,
        country: request.headers.get("x-vercel-ip-country"),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("track error:", error);
    // Analytics must never break the page — swallow errors.
    return new NextResponse(null, { status: 204 });
  }
}
