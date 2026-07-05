import { redirect } from "next/navigation";
import { SETTINGS_DEFAULT_HREF } from "./_components/settings-nav";

export default function SettingsPage() {
  redirect(SETTINGS_DEFAULT_HREF);
}
