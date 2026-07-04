"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { Palette, LayoutGrid } from "lucide-react";
import { BrandingTab } from "./_components/BrandingTab";
import { SectionsTab } from "./_components/SectionsTab";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";

function SettingsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") === "sections" ? "sections" : "branding";

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Site Settings"
        description="Identity assets shown across the site, and which landing page sections appear where."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b border-border/60 pb-px">
          <TabsList variant="line" className="gap-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="branding"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <Palette className="h-4 w-4" /> Branding
            </TabsTrigger>
            <TabsTrigger
              value="sections"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" /> Sections
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="branding" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <BrandingTab />
          </TabsContent>

          <TabsContent value="sections" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <SectionsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={4} hasGridRow />}>
      <SettingsPageContent />
    </Suspense>
  );
}
