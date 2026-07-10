import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { syncGmailHistory } from "@/modules/gmail/service/sync";

export const runtime = "nodejs";

const oidcClient = new OAuth2Client();

async function verifyPushRequest(request: Request) {
  const audience = process.env.GMAIL_PUBSUB_WEBHOOK_URL;
  const authHeader = request.headers.get("authorization");
  if (!audience || !authHeader?.startsWith("Bearer ")) return false;

  const idToken = authHeader.slice("Bearer ".length);
  try {
    const ticket = await oidcClient.verifyIdToken({ idToken, audience });
    const payload = ticket.getPayload();
    return payload?.iss === "https://accounts.google.com";
  } catch {
    return false;
  }
}

// Gmail push notification via Cloud Pub/Sub. Must always respond quickly and
// with a 2xx (even on internal failure) or Pub/Sub will keep retrying delivery.
export async function POST(request: Request) {
  const verified = await verifyPushRequest(request);
  if (!verified) {
    return NextResponse.json({ success: false, error: "Unverified push request" }, { status: 401 });
  }

  try {
    await syncGmailHistory();
  } catch (error) {
    console.error("Gmail Pub/Sub sync error:", error);
  }

  return NextResponse.json({ success: true });
}
