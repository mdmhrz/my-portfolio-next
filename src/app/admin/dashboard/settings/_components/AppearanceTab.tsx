'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Type, Palette } from "lucide-react";
import { useAppearanceStore } from "@/store/useAppearanceStore";
import { FontsTab } from "../../appearance/_components/FontsTab";
import { ColorsTab } from "../../appearance/_components/ColorsTab";
import { PreviewPanel } from "../../appearance/_components/PreviewPanel";

export function AppearanceTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { fetchAppearance } = useAppearanceStore();

  useEffect(() => {
    fetchAppearance();
  }, [fetchAppearance]);

  const activeTab = searchParams.get("tab") === "theme" ? "theme" : "typography";

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Control the typography and colors of your public site and dashboard.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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

        <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TabsContent value="typography" className="mt-0 border-0 p-0 focus-visible:ring-0">
              <Card className="rounded-xl border border-border bg-card shadow-sm">
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
              <Card className="rounded-xl border border-border bg-card shadow-sm">
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

          <div className="sticky top-24 lg:col-span-1">
            <PreviewPanel />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
