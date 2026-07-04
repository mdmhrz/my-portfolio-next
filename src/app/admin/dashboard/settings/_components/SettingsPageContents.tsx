'use client';

import { useEffect, useState } from "react";
import { Reorder } from "motion/react";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore, type SectionConfigData } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUpload } from "@/app/admin/dashboard/_components/ImageUpload";

const SECTION_LABELS: Record<string, string> = {
  techMarquee: "Tech Marquee",
  journey: "Journey",
  experience: "Experience",
  tools: "Skills / Tools",
  caseStudies: "Case Studies",
  homepageBlogs: "Featured Articles",
  cta: "Call to Action",
  contact: "Contact Form",
};

export function SettingsPageContents() {
  const { settings, fetchSettings, updateSettings, sections, fetchSections, updateSections } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<SectionConfigData[]>([]);

  useEffect(() => {
    Promise.all([fetchSettings(), fetchSections()]).finally(() => setIsLoading(false));
  }, [fetchSettings, fetchSections]);

  useEffect(() => {
    setItems(sections);
  }, [sections]);

  const handleReorder = (newOrder: SectionConfigData[]) => {
    setItems(newOrder);
    updateSections(newOrder).catch(() => toast.error("Failed to save new order."));
  };

  const toggleVisible = (key: string) => {
    const newItems = items.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s));
    setItems(newItems);
    updateSections(newItems).catch(() => toast.error("Failed to save."));
  };

  const handleLogoChange = async (url: string) => {
    try {
      await updateSettings({ logoUrl: url });
      toast.success(url ? "Logo updated!" : "Logo removed.");
    } catch {
      toast.error("Failed to update logo.");
    }
  };

  const handleLogoAltChange = async (alt: string) => {
    try {
      await updateSettings({ logoAlt: alt });
    } catch {
      toast.error("Failed to update alt text.");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Site Settings"
        description="Site logo, plus which landing page sections are shown and in what order."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site Logo</CardTitle>
          <CardDescription>Shown in the navbar. Leave empty to use the default mark.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full rounded-xl" />
          ) : (
            <ImageUpload
              value={settings?.logoUrl || ""}
              onChange={handleLogoChange}
              alt={settings?.logoAlt || ""}
              onAltChange={handleLogoAltChange}
              folder="branding"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Landing Page Sections</CardTitle>
          <CardDescription>
            Toggle sections on or off, and drag to reorder how they appear on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
              {items.map((section) => (
                <Reorder.Item
                  key={section.key}
                  value={section}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="flex-1 text-sm font-semibold text-foreground">
                    {SECTION_LABELS[section.key] || section.key}
                  </p>
                  <Switch checked={section.visible} onCheckedChange={() => toggleVisible(section.key)} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
