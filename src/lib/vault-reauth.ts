import { createHmac, timingSafeEqual } from "crypto";

// Short-lived "I already typed my password" grace period for the vault, so
// reveal isn't a password prompt on every single click. Signed (not just an
// opaque cookie value) so a tampered cookie can't grant access to another
// user id or extend its own expiry.
export const VAULT_REAUTH_COOKIE = "vault_reauth";
export const VAULT_REAUTH_TTL_MS = 5 * 60 * 1000;

function getSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function signReauthToken(userId: string): string {
  const expiresAt = Date.now() + VAULT_REAUTH_TTL_MS;
  const payload = `${userId}:${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function verifyReauthToken(token: string | undefined | null, userId: string): boolean {
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const expectedSignature = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return false;

  const [tokenUserId, expiresAtStr] = payload.split(":");
  if (tokenUserId !== userId) return false;
  return Date.now() < Number(expiresAtStr);
}
