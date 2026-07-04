'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, Loader2, RotateCcw, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";
import { usePortfolioStore, type BannerData } from "@/store/usePortfolioStore";
import { ImageUpload } from "../../../_components/ImageUpload";
import { Hero } from "@/app/_components/Hero";
import { ScaledPreview } from "./ScaledPreview";
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

  const activePremadeId = PREMADE_TEMPLATES.find(
    (p) => p.background === draft.backgroundTemplate && p.layout === draft.layoutTemplate && p.animation === draft.animationTemplate,
  )?.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Template"
        description="Mix and match a 3D background, content layout, and animation style — independently. The preview updates live before you save."
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Preview — sticky on desktop so it stays visible while you tune controls */}
        <div className="space-y-2 lg:sticky lg:top-6">
          <ScaledPreview>
            <Hero start reduced={false} fullHeight={false} banner={previewBanner} profile={profile} />
          </ScaledPreview>
          <p className="text-xs text-muted-foreground">
            Live preview, scaled to fit — reflects your selections on the right. Save to publish to the live site.
          </p>
        </div>

        {/* Controls */}
        <Card className="lg:sticky lg:top-6">
          <CardContent className="pt-6">
            <Tabs defaultValue="templates">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="animation">Animation</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-5 space-y-2">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  One-click presets
                </div>
                {PREMADE_TEMPLATES.map((preset) => (
                  <OptionRow
                    key={preset.id}
                    label={preset.label}
                    description={preset.description}
                    isActive={activePremadeId === preset.id}
                    onClick={() => applyPremade(preset.id)}
                  />
                ))}
                <p className="pt-1 text-xs text-muted-foreground">
                  Applies all three tabs at once. Still requires Save.
                </p>
              </TabsContent>

              <TabsContent value="background" className="mt-5 space-y-2">
                {BACKGROUND_TEMPLATES.map((opt) => (
                  <OptionRow
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    isActive={draft.backgroundTemplate === opt.id}
                    onClick={() => setDraft((d) => ({ ...d, backgroundTemplate: opt.id }))}
                  />
                ))}

                {draft.backgroundTemplate === "none" && (
                  <div className="pt-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      Optional background image
                    </p>
                    <ImageUpload
                      label="Background Image"
                      folder="banner"
                      value={draft.backgroundImg}
                      onChange={(url) => setDraft((d) => ({ ...d, backgroundImg: url }))}
                      alt={draft.backgroundAlt}
                      onAltChange={(alt) => setDraft((d) => ({ ...d, backgroundAlt: alt }))}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="layout" className="mt-5 space-y-2">
                {LAYOUT_TEMPLATES.map((opt) => (
                  <OptionRow
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    isActive={draft.layoutTemplate === opt.id}
                    onClick={() => setDraft((d) => ({ ...d, layoutTemplate: opt.id }))}
                  />
                ))}

                {draft.layoutTemplate === "showcase" && (
                  <div className="pt-3">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      Showcase image (replaces the code card)
                    </p>
                    <ImageUpload
                      label="Showcase Image"
                      folder="banner"
                      value={draft.heroImage}
                      onChange={(url) => setDraft((d) => ({ ...d, heroImage: url }))}
                      alt={draft.heroImageAlt}
                      onAltChange={(alt) => setDraft((d) => ({ ...d, heroImageAlt: alt }))}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="animation" className="mt-5 space-y-2">
                {ANIMATION_TEMPLATES.map((opt) => (
                  <OptionRow
                    key={opt.id}
                    label={opt.label}
                    description={opt.description}
                    isActive={draft.animationTemplate === opt.id}
                    onClick={() => setDraft((d) => ({ ...d, animationTemplate: opt.id }))}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  description,
  isActive,
  onClick,
}: {
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={[
        "flex w-full cursor-pointer items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors",
        isActive ? "border-primary bg-primary/[0.04]" : "border-border hover:border-foreground/25",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</div>
      </div>
      <div
        className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          isActive ? "border-primary bg-primary text-primary-foreground" : "border-border",
        ].join(" ")}
      >
        {isActive && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}
