'use client';

import { useEffect, useState } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";
import {
  BLOG_CARD_TEMPLATES,
  renderBlogCard,
  normalizeTemplate,
  type BlogCardTemplateId,
  type BlogListItem,
} from "@/components/blog";

interface BlogDisplaySettingsProps {
  /** Real blog used to render the live template previews. May be null. */
  sampleBlog: BlogListItem | null;
}

const DEFAULT_TITLE = "Featured Articles";
const DEFAULT_SUBTITLE =
  "Notes, deep dives, and lessons from building things on the web.";

/** Fallback sample so the preview is meaningful even before any post is published. */
const PLACEHOLDER_BLOG: BlogListItem = {
  id: "preview-sample",
  title: "Designing Resilient Frontend Architecture at Scale",
  slug: "preview-sample",
  excerpt:
    "How we structured a multi-team frontend around feature slices, shared design tokens, and incremental hydration — without the usual performance cliff.",
  coverImage: null,
  coverImageAlt: null,
  category: "Engineering",
  tags: ["Architecture", "Performance", "React"],
  featured: true,
  readingTime: 8,
  views: 1280,
  createdAt: new Date().toISOString(),
};

interface FormState {
  homepageBlogTitle: string;
  homepageBlogSubtitle: string;
  homepageBlogTemplate: BlogCardTemplateId;
}

export function BlogDisplaySettings({ sampleBlog }: BlogDisplaySettingsProps) {
  const { settings, fetchSettings, updateSettings } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    homepageBlogTitle: "",
    homepageBlogSubtitle: "",
    homepageBlogTemplate: "standard",
  });

  useEffect(() => {
    fetchSettings().finally(() => setIsLoading(false));
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setForm({
        homepageBlogTitle: settings.homepageBlogTitle ?? "",
        homepageBlogSubtitle: settings.homepageBlogSubtitle ?? "",
        homepageBlogTemplate: normalizeTemplate(settings.homepageBlogTemplate),
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        homepageBlogTitle: form.homepageBlogTitle.trim() || null,
        homepageBlogSubtitle: form.homepageBlogSubtitle.trim() || null,
        homepageBlogTemplate: form.homepageBlogTemplate,
      });
      toast.success("Homepage settings saved!");
    } catch {
      toast.error("Failed to save homepage settings.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={3} hasGridRow={false} />;
  }

  const previewBlog = sampleBlog ?? PLACEHOLDER_BLOG;

  return (
    <>
      <PageHeader
        title="Display Settings"
        description="Control the Featured Articles slider shown on the homepage."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visibility & copy */}
        <Card>
          <CardHeader>
            <CardTitle>Blog section</CardTitle>
            <CardDescription>
              This section appears between &ldquo;Selected work&rdquo; and the call-to-action.
              It shows posts you&rsquo;ve marked&nbsp;
              <Link href="/admin/dashboard/blogs" className="underline underline-offset-4 hover:text-primary">
                Featured
              </Link>
              . To show or hide this section (or reorder it), use{" "}
              <Link href="/admin/dashboard/settings" className="underline underline-offset-4 hover:text-primary">
                Site Settings
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="homepageBlogTitle" className="text-xs font-semibold">
                Section title
              </Label>
              <Input
                id="homepageBlogTitle"
                type="text"
                placeholder={DEFAULT_TITLE}
                value={form.homepageBlogTitle}
                onChange={(e) => setForm({ ...form, homepageBlogTitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homepageBlogSubtitle" className="text-xs font-semibold">
                Section subtitle
              </Label>
              <Input
                id="homepageBlogSubtitle"
                type="text"
                placeholder={DEFAULT_SUBTITLE}
                value={form.homepageBlogSubtitle}
                onChange={(e) => setForm({ ...form, homepageBlogSubtitle: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Template picker with live preview */}
        <Card>
          <CardHeader>
            <CardTitle>Card template</CardTitle>
            <CardDescription>
              Pick how blog cards look in the slider. The preview uses real card components against
              {!sampleBlog ? " a sample post" : " your latest featured post"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {BLOG_CARD_TEMPLATES.map((tpl) => {
                const isActive = form.homepageBlogTemplate === tpl.id;
                return (
                  <button
                    type="button"
                    key={tpl.id}
                    onClick={() => setForm({ ...form, homepageBlogTemplate: tpl.id })}
                    aria-pressed={isActive}
                    className={[
                      "group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all",
                      isActive
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-foreground/30",
                    ].join(" ")}
                  >
                    {isActive && (
                      <span className="absolute right-3 top-3 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}

                    {/* Live preview — pointer-events disabled so the card's <Link> overlay
                        doesn't hijack clicks meant for selecting the template. */}
                    <div className="pointer-events-none [&_a]:pointer-events-none">
                      {renderBlogCard(previewBlog, tpl.id)}
                    </div>

                    <div className="mt-1 px-1">
                      <div className="text-sm font-semibold">{tpl.label}</div>
                      <div className="text-xs text-muted-foreground">{tpl.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </>
  );
}
