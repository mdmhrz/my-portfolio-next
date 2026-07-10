'use client';

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Sliders } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { BlogsPageContents } from "./BlogsPageContents";
import { BlogDisplaySettings } from "./BlogDisplaySettings";
import type { BlogListItem } from "@/components/blog";

interface BlogsPageTabsProps {
  sampleBlog: BlogListItem | null;
}

export function BlogsPageTabs({ sampleBlog }: BlogsPageTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") === "display" ? "display" : "posts";

  const handleTabChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", val);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description="Manage your posts and how the Featured Articles section looks on the homepage."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="border-b border-border/60 pb-px">
          <TabsList variant="line" className="gap-6 bg-transparent h-auto p-0">
            <TabsTrigger
              value="posts"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <BookOpen className="h-4 w-4" /> Posts
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="gap-2 px-1 pb-3 pt-1 rounded-none shadow-none bg-transparent hover:text-foreground data-[state=active]:text-foreground"
            >
              <Sliders className="h-4 w-4" /> Display Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6">
          <TabsContent value="posts" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <BlogsPageContents />
          </TabsContent>

          <TabsContent value="display" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <BlogDisplaySettings sampleBlog={sampleBlog} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
