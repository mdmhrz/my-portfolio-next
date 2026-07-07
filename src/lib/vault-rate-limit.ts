import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000;

export async function checkVaultRateLimit(): Promise<{ locked: boolean; retryAfterMinutes?: number }> {
  const since = new Date(Date.now() - COOLDOWN_MS);
  const recentFailures = await prisma.vaultLoginAttempt.findMany({
    where: { success: false, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: MAX_FAILED_ATTEMPTS,
  });

  if (recentFailures.length < MAX_FAILED_ATTEMPTS) return { locked: false };

  const oldestOfBatch = recentFailures[recentFailures.length - 1].createdAt;
  const retryAfterMs = oldestOfBatch.getTime() + COOLDOWN_MS - Date.now();
  return { locked: true, retryAfterMinutes: Math.max(1, Math.ceil(retryAfterMs / 60000)) };
}

export async function recordVaultAttempt(success: boolean, ipAddress?: string | null): Promise<void> {
  await prisma.vaultLoginAttempt.create({ data: { success, ipAddress: ipAddress || null } });
}
