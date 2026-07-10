import { Suspense } from "react";
import { AppearanceTab } from "@/modules/settings/appearance/components/AppearanceTab";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";

export const dynamic = "force-dynamic";

export default function AppearanceSettingsPage() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={4} hasGridRow />}>
      <AppearanceTab />
    </Suspense>
  );
}
