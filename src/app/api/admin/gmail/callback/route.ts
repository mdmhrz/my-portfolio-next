import { NextResponse } from "next/server";
import { google } from "googleapis";
import { verifyAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { exchangeCodeForTokens, startWatch } from "@/lib/gmail";

export const runtime = "nodejs";

const STATE_COOKIE = "gmail_oauth_state";

export async function GET(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.headers.get("cookie")?.match(new RegExp(`${STATE_COOKIE}=([^;]+)`))?.[1];

  const redirectBase = process.env.BETTER_AUTH_URL || new URL(request.url).origin;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${redirectBase}/admin/dashboard/messages?gmail_error=invalid_state`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.access_token || !tokens.expiry_date) {
      throw new Error("Google did not return an access token");
    }

    const existing = await prisma.gmailAccount.findUnique({ where: { userId: admin.user.id } });
    if (!tokens.refresh_token && !existing) {
      throw new Error("Google did not return a refresh token. Revoke app access at https://myaccount.google.com/permissions and try again.");
    }

    const client = new google.auth.OAuth2();
    client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: client });
    const profile = await gmail.users.getProfile({ userId: "me" });

    const account = await prisma.gmailAccount.upsert({
      where: { userId: admin.user.id },
      create: {
        userId: admin.user.id,
        email: profile.data.emailAddress || "",
        accessToken: tokens.access_token,
        refreshTokenEnc: encrypt(tokens.refresh_token!),
        accessTokenExpiresAt: new Date(tokens.expiry_date),
        scope: tokens.scope || "",
      },
      update: {
        email: profile.data.emailAddress || "",
        accessToken: tokens.access_token,
        accessTokenExpiresAt: new Date(tokens.expiry_date),
        scope: tokens.scope || "",
        ...(tokens.refresh_token ? { refreshTokenEnc: encrypt(tokens.refresh_token) } : {}),
      },
    });

    await startWatch(gmail, account.id);

    const response = NextResponse.redirect(`${redirectBase}/admin/dashboard/messages?connected=1`);
    response.cookies.delete(STATE_COOKIE);
    return response;
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);
    return NextResponse.redirect(`${redirectBase}/admin/dashboard/messages?gmail_error=connect_failed`);
  }
}
