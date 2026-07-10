import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { verifyAdmin } from "@/lib/auth-helpers";
import { buildOAuthUrl, isGmailOAuthConfigured } from "@/modules/gmail/service/client";

export const runtime = "nodejs";

const STATE_COOKIE = "gmail_oauth_state";

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isGmailOAuthConfigured()) {
    return NextResponse.json(
      { success: false, error: "Gmail OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI." },
      { status: 500 }
    );
  }

  const state = randomBytes(24).toString("hex");
  const url = buildOAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
