import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return null;
  }
  return session;
}
