'use client';

import { useEffect, useState } from "react";
import { Reorder } from "motion/react";
import { GripVertical, Layers, Route, Briefcase, Wrench, FolderKanban, Newspaper, MousePointerClick, Mail, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore, type SectionConfigData } from "@/store/usePortfolioStore";

const SECTION_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  techMarquee: { label: "Tech Marquee", icon: Layers },
  journey: { label: "Journey", icon: Route },
  experience: { label: "Experience", icon: Briefcase },
  tools: { label: "Skills / Tools", icon: Wrench },
  caseStudies: { label: "Case Studies", icon: FolderKanban },
  homepageBlogs: { label: "Featured Articles", icon: Newspaper },
  testimonials: { label: "Testimonials", icon: MessageSquareQuote },
  cta: { label: "Call to Action", icon: MousePointerClick },
  contact: { label: "Contact Form", icon: Mail },
};

export function SectionsTab() {
  const { sections, fetchSections, updateSections } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<SectionConfigData[]>([]);

  useEffect(() => {
    fetchSections().finally(() => setIsLoading(false));
  }, [fetchSections]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Landing Page Sections</CardTitle>
        <CardDescription>
          Drag to set the order sections appear on the homepage. Turn a section off to hide it entirely.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
            {items.map((section, index) => {
              const meta = SECTION_META[section.key];
              const Icon = meta?.icon ?? Layers;
              return (
                <Reorder.Item
                  key={section.key}
                  value={section}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>

                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

                  <p
                    className={`flex-1 text-sm font-semibold transition-colors ${
                      section.visible ? "text-foreground" : "text-muted-foreground/60"
                    }`}
                  >
                    {meta?.label ?? section.key}
                  </p>

                  <Switch checked={section.visible} onCheckedChange={() => toggleVisible(section.key)} />
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </CardContent>
    </Card>
  );
}
