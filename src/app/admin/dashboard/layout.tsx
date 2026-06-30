import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "./_components/AdminShell";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <AppearanceColorScope scope="admin">
      <AdminShell>{children}</AdminShell>
    </AppearanceColorScope>
  );
}
