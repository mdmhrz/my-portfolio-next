"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { FileText, Wand2, Loader2 } from "lucide-react";
import { ContentTab } from "./_components/ContentTab";
import { TemplateTab } from "./_components/TemplateTab";

export const dynamic = "force-dynamic";

function BannerPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") === "template" ? "template" : "content";

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Banner"
        description="Everything shown in the landing page hero — headline, tagline, template, and design — lives here. Contact links and photo still come from Profile."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b border-border/60 pb-px">
          <TabsList variant="line" className="gap-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="content"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <FileText className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger
              value="template"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <Wand2 className="h-4 w-4" /> Template &amp; Design
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="content" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <ContentTab />
          </TabsContent>

          <TabsContent value="template" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <TemplateTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function BannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BannerPageContent />
    </Suspense>
  );
}
