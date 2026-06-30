"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { Type, Palette, Loader2 } from "lucide-react";
import { useAppearanceStore } from "@/store/useAppearanceStore";
import { FontsTab } from "./_components/FontsTab";
import { ColorsTab } from "./_components/ColorsTab";
import { PreviewPanel } from "./_components/PreviewPanel";

function AppearancePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { fetchAppearance } = useAppearanceStore();

  useEffect(() => {
    fetchAppearance();
  }, [fetchAppearance]);

  // Determine current active tab from query string (default: typography)
  const activeTab = searchParams.get("tab") === "theme" ? "theme" : "typography";

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appearance"
        description="Control the typography and colors of your public site and dashboard."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Page-level Tab Switcher */}
        <div className="border-b border-border/60 pb-px">
          <TabsList variant="line" className="gap-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="typography"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <Type className="h-4 w-4" /> Typography
            </TabsTrigger>
            <TabsTrigger
              value="theme"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <Palette className="h-4 w-4" /> Theme &amp; Colors
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Global Grid containing Tab contents on left and PreviewPanel on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-6">
          <div className="lg:col-span-2">
            <TabsContent value="typography" className="mt-0 border-0 p-0 focus-visible:ring-0">
              <Card className="border border-border bg-card shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">Typography Settings</CardTitle>
                  <CardDescription>
                    Configure default, Google, or custom uploaded fonts to apply across the public site and admin panel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FontsTab />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="mt-0 border-0 p-0 focus-visible:ring-0">
              <Card className="border border-border bg-card shadow-sm rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">Theme &amp; Colors Settings</CardTitle>
                  <CardDescription>
                    Choose between simple theme modes, default presets, or advanced color customization.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColorsTab />
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="lg:col-span-1 sticky top-24">
            <PreviewPanel />
          </div>
        </div>
      </Tabs>
    </div>
  );
}

export default function AppearancePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AppearancePageContent />
    </Suspense>
  );
}
