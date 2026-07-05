import { redirect } from "next/navigation";

// Appearance now lives under Settings. Keep this path working for old links.
export default function AppearancePage() {
  redirect("/admin/dashboard/settings/appearance");
}
