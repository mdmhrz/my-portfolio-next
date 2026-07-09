import { isGmailConnected, getGmailClient, sendGmailMime } from "@/lib/gmail";

interface VaultNotifyParams {
  action: "opened" | "locked_out";
  itemTitle?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// Best-effort security notification — reuses the Gmail integration already
// wired for inbox sync (same connected account, same `gmail.send` scope),
// so this is one email call away rather than a new provider/dependency.
// Never throws: a notification failing must not block the reveal itself.
export async function notifyVaultAccess(params: VaultNotifyParams): Promise<void> {
  try {
    if (!(await isGmailConnected())) return;

    const { gmail, account } = await getGmailClient();
    const time = new Date().toUTCString();

    const subject =
      params.action === "locked_out"
        ? "Vault locked — too many failed attempts"
        : `Vault accessed${params.itemTitle ? `: ${params.itemTitle}` : ""}`;

    const bodyHtml = `
      <div style="font-family: sans-serif; font-size: 14px; color: #111;">
        <p><strong>${
          params.action === "locked_out"
            ? "Your vault was locked after too many failed re-auth attempts."
            : `A secret was revealed${params.itemTitle ? `: <strong>${escapeHtml(params.itemTitle)}</strong>` : ""}.`
        }</strong></p>
        <table style="margin-top: 8px; font-size: 13px; color: #444;">
          <tr><td style="padding-right: 12px; color: #888;">Time</td><td>${time}</td></tr>
          <tr><td style="padding-right: 12px; color: #888;">IP address</td><td>${escapeHtml(params.ipAddress || "unknown")}</td></tr>
          <tr><td style="padding-right: 12px; color: #888;">User agent</td><td>${escapeHtml(params.userAgent || "unknown")}</td></tr>
        </table>
        <p style="margin-top: 16px; color: #888; font-size: 12px;">
          If this wasn't you, rotate every secret in your vault immediately and change your admin password.
        </p>
      </div>
    `;

    await sendGmailMime(gmail, {
      fromEmail: account.email,
      to: account.email,
      subject,
      bodyHtml,
    });
  } catch (error) {
    console.error("Failed to send vault notification email:", error);
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]!));
}
