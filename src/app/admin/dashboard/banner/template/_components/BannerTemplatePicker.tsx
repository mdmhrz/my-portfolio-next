'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";
import { usePortfolioStore, type BannerData } from "@/store/usePortfolioStore";
import { ImageUpload } from "../../../_components/ImageUpload";
import { Hero } from "@/app/_components/Hero";
import {
  BACKGROUND_TEMPLATES,
  LAYOUT_TEMPLATES,
  ANIMATION_TEMPLATES,
  PREMADE_TEMPLATES,
  normalizeBackground,
  normalizeLayout,
  normalizeAnimation,
  type BackgroundTemplateId,
  type LayoutTemplateId,
  type AnimationTemplateId,
} from "@/components/hero";

interface DraftState {
  backgroundTemplate: BackgroundTemplateId;
  layoutTemplate: LayoutTemplateId;
  animationTemplate: AnimationTemplateId;
  backgroundImg: string;
  backgroundAlt: string;
  heroImage: string;
  heroImageAlt: string;
}

export function BannerTemplatePicker() {
  const { banner, profile, fetchBanner, fetchProfile, updateBanner } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<DraftState>({
    backgroundTemplate: "none",
    layoutTemplate: "signature",
    animationTemplate: "signature",
    backgroundImg: "",
    backgroundAlt: "",
    heroImage: "",
    heroImageAlt: "",
  });

  useEffect(() => {
    Promise.all([fetchBanner(), fetchProfile()]).finally(() => setIsLoading(false));
  }, [fetchBanner, fetchProfile]);

  useEffect(() => {
    if (banner) {
      setDraft({
        backgroundTemplate: normalizeBackground(banner.backgroundTemplate),
        layoutTemplate: normalizeLayout(banner.layoutTemplate),
        animationTemplate: normalizeAnimation(banner.animationTemplate),
        backgroundImg: banner.backgroundImg || "",
        backgroundAlt: banner.backgroundAlt || "",
        heroImage: banner.heroImage || "",
        heroImageAlt: banner.heroImageAlt || "",
      });
    }
  }, [banner]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBanner({
        backgroundTemplate: draft.backgroundTemplate,
        layoutTemplate: draft.layoutTemplate,
        animationTemplate: draft.animationTemplate,
        backgroundImg: draft.backgroundImg || null,
        backgroundAlt: draft.backgroundAlt || null,
        heroImage: draft.heroImage || null,
        heroImageAlt: draft.heroImageAlt || null,
      } as BannerData);
      toast.success("Hero template saved!");
    } catch {
      toast.error("Failed to save hero template.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraft((d) => ({ ...d, backgroundTemplate: "none", layoutTemplate: "signature", animationTemplate: "signature" }));
    toast.info("Reset in the preview — remember to Save to apply.");
  };

  const applyPremade = (id: string) => {
    const preset = PREMADE_TEMPLATES.find((p) => p.id === id);
    if (!preset) return;
    setDraft((d) => ({ ...d, backgroundTemplate: preset.background, layoutTemplate: preset.layout, animationTemplate: preset.animation }));
  };

  if (isLoading) {
    return <FormPageSkeleton fields={4} hasGridRow />;
  }

  const previewBanner = {
    description: banner?.description || "",
    chips: banner?.chips || [],
    backgroundTemplate: draft.backgroundTemplate,
    layoutTemplate: draft.layoutTemplate,
    animationTemplate: draft.animationTemplate,
    backgroundImg: draft.backgroundImg || null,
    backgroundAlt: draft.backgroundAlt || null,
    heroImage: draft.heroImage || null,
    heroImageAlt: draft.heroImageAlt || null,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <PageHeader
        title="Hero Template"
        description="Mix and match a 3D background, content layout, and animation style — independently of each other. The preview below updates live before you save."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Live preview — the actual Hero component, real 3D + GSAP, reflecting the draft below */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>Reflects your selections below in real time. Save to publish to the live site.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-border">
            <Hero start reduced={false} fullHeight={false} banner={previewBanner} profile={profile} />
          </div>
        </CardContent>
      </Card>

      {/* Premade templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Premade Templates
          </CardTitle>
          <CardDescription>One-click shortcuts that set all three selections below at once. Still requires Save.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {PREMADE_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPremade(preset.id)}
              className="max-w-xs rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 cursor-pointer"
            >
              <div className="text-sm font-semibold">{preset.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{preset.description}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Background */}
      <TemplateAxisPicker
        title="Background"
        description="The 3D environment behind your content."
        options={BACKGROUND_TEMPLATES}
        value={draft.backgroundTemplate}
        onChange={(v) => setDraft((d) => ({ ...d, backgroundTemplate: v }))}
      />

      {draft.backgroundTemplate === "none" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Optional Background Image</CardTitle>
            <CardDescription>Shown behind your content when Background is &ldquo;None&rdquo;. Leave empty for a solid color.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label="Background Image"
              folder="banner"
              value={draft.backgroundImg}
              onChange={(url) => setDraft((d) => ({ ...d, backgroundImg: url }))}
              alt={draft.backgroundAlt}
              onAltChange={(alt) => setDraft((d) => ({ ...d, backgroundAlt: alt }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Layout */}
      <TemplateAxisPicker
        title="Layout"
        description="How your content is arranged, and what it shows."
        options={LAYOUT_TEMPLATES}
        value={draft.layoutTemplate}
        onChange={(v) => setDraft((d) => ({ ...d, layoutTemplate: v }))}
      />

      {draft.layoutTemplate === "showcase" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Showcase Image</CardTitle>
            <CardDescription>Shown instead of the code card in the Showcase layout.</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label="Showcase Image"
              folder="banner"
              value={draft.heroImage}
              onChange={(url) => setDraft((d) => ({ ...d, heroImage: url }))}
              alt={draft.heroImageAlt}
              onAltChange={(alt) => setDraft((d) => ({ ...d, heroImageAlt: alt }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Animation */}
      <TemplateAxisPicker
        title="Animation"
        description="How your content enters, and how it reacts to your cursor."
        options={ANIMATION_TEMPLATES}
        value={draft.animationTemplate}
        onChange={(v) => setDraft((d) => ({ ...d, animationTemplate: v }))}
      />
    </div>
  );
}

interface AxisOption<T extends string> {
  id: T;
  label: string;
  description: string;
}

function TemplateAxisPicker<T extends string>({
  title,
  description,
  options,
  value,
  onChange,
}: {
  title: string;
  description: string;
  options: AxisOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((opt) => {
          const isActive = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={isActive}
              className={[
                "cursor-pointer rounded-xl border p-4 text-left transition-all",
                isActive ? "border-primary ring-2 ring-primary" : "border-border hover:border-foreground/30",
              ].join(" ")}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{opt.description}</div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
