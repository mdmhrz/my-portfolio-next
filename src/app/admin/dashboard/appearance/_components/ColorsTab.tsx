"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Globe, LayoutDashboard, Loader2, RotateCcw, Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAppearanceStore, type ColorTarget } from "@/store/useAppearanceStore";
import { COLOR_THEMES } from "@/constants/defaultAppearance";
import type { ColorConfig } from "@/lib/appearanceInjector";
import { SimpleColorMode } from "./SimpleColorMode";
import { ThemesColorMode } from "./ThemesColorMode";
import { AdvancedColorMode } from "./AdvancedColorMode";

interface ColorPalette {
  accent: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  border: string;
}

const TARGETS: { value: ColorTarget; label: string; hint: string; icon: typeof Globe }[] = [
  { value: "publicColors", label: "Public site", hint: "What every visitor sees (/, /blogs …)", icon: Globe },
  { value: "dashboardColors", label: "Dashboard", hint: "Only this admin area", icon: LayoutDashboard },
];

export function ColorsTab() {
  const {
    publicColors,
    dashboardColors,
    updateColors,
    restore,
    setDraftColors,
    loading,
  } = useAppearanceStore();

  const [target, setTarget] = useState<ColorTarget>("publicColors");
  const [colorMode, setColorMode] = useState<"simple" | "themes" | "advanced">("themes");
  const [accentColor, setAccentColor] = useState("#000000");
  const [themePreset, setThemePreset] = useState("default");
  const [lightColors, setLightColors] = useState<ColorPalette>(COLOR_THEMES.default.light);
  const [darkColors, setDarkColors] = useState<ColorPalette>(COLOR_THEMES.default.dark);
  const [isSaving, setIsSaving] = useState(false);

  // Load a target's saved config into the form.
  const loadFromConfig = (cfg: ColorConfig | null) => {
    const mode = cfg?.mode && cfg.mode !== "default" ? cfg.mode : "themes";
    setColorMode(mode);
    setAccentColor(cfg?.accentColor ?? "#000000");
    if (!cfg) {
      setThemePreset("default");
    } else {
      setThemePreset(cfg.mode === "themes" ? (cfg.themePreset ?? "default") : "");
    }
    setLightColors(cfg?.customPalette?.light ?? COLOR_THEMES.default.light);
    setDarkColors(cfg?.customPalette?.dark ?? COLOR_THEMES.default.dark);
  };

  // When the target or the saved values change, reload the form for that target.
  useEffect(() => {
    loadFromConfig(target === "publicColors" ? publicColors : dashboardColors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, publicColors, dashboardColors]);

  const buildColorData = (): ColorConfig => {
    if (colorMode === "simple") return { mode: "simple", accentColor };
    if (colorMode === "themes") return { mode: "themes", themePreset };
    return { mode: "advanced", customPalette: { light: lightColors, dark: darkColors } };
  };

  // Mirror the in-progress edit to the store so the PreviewPanel updates live.
  useEffect(() => {
    setDraftColors(buildColorData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode, accentColor, themePreset, lightColors, darkColors]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateColors(target, buildColorData());
      toast.success(`${target === "publicColors" ? "Public site" : "Dashboard"} colors saved successfully!`);
    } catch {
      toast.error("Failed to save colors");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restore(target);
      loadFromConfig(null);
      setDraftColors(null);
      toast.success("Restored to original built-in design");
    } catch {
      toast.error("Failed to restore");
    }
  };

  const savedConfig = target === "publicColors" ? publicColors : dashboardColors;
  const isSimpleActive = savedConfig?.mode === "simple";
  const isThemesActive = savedConfig === null || savedConfig?.mode === "themes" || savedConfig?.mode === "default";
  const isAdvancedActive = savedConfig?.mode === "advanced";

  return (
    <div className="space-y-6">
      {/* Target switch */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Select Customization Target</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TARGETS.map((t) => {
            const Icon = t.icon;
            const active = target === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTarget(t.value)}
                className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer ${active
                  ? "border-primary bg-primary/[0.03] ring-1 ring-primary shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-neutral-100/5"
                  }`}
              >
                <div className={`p-2 rounded-lg ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 pr-6">
                  <span className="block text-sm font-semibold text-foreground">
                    {t.label}
                  </span>
                  <span className="block text-xs text-muted-foreground mt-0.5 leading-normal">
                    {t.hint}
                  </span>
                </div>
                {active && (
                  <CheckCircle2 className="absolute top-4 right-4 h-4 w-4 text-primary fill-primary/10" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode + options */}
      <Tabs value={colorMode} onValueChange={(v) => setColorMode(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/60 p-1 rounded-xl h-10">
          <TabsTrigger value="simple" className="rounded-lg gap-2 flex items-center justify-center">
            <span>Accent Mode</span>
            {isSimpleActive && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 tracking-wide uppercase">
                Active
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="themes" className="rounded-lg gap-2 flex items-center justify-center">
            <span>Preset Themes</span>
            {isThemesActive && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 tracking-wide uppercase">
                Active
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-lg gap-2 flex items-center justify-center">
            <span>Full Custom Palette</span>
            {isAdvancedActive && (
              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 tracking-wide uppercase">
                Active
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 border border-border/40 bg-neutral-50/30 dark:bg-zinc-950/20 p-5 rounded-xl">
          <TabsContent value="simple" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <SimpleColorMode accentColor={accentColor} onChangeAccent={setAccentColor} />
          </TabsContent>

          <TabsContent value="themes" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <ThemesColorMode selectedTheme={themePreset} onSelectTheme={setThemePreset} />
          </TabsContent>

          <TabsContent value="advanced" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <AdvancedColorMode
              lightColors={lightColors}
              darkColors={darkColors}
              onUpdateColors={(mode, next) =>
                mode === "light" ? setLightColors(next) : setDarkColors(next)
              }
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-border/80 pt-5">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          disabled={loading || isSaving}
          className="rounded-lg h-10 border-border/80 hover:bg-neutral-100 dark:hover:bg-zinc-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restore default
        </Button>
        <Button
          className="flex-1 rounded-lg h-10 shadow-sm"
          size="sm"
          onClick={handleSave}
          disabled={loading || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" /> Save {target === "publicColors" ? "Public" : "Dashboard"} Theme Colors
            </>
          )}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground text-center leading-normal">
        * "Restore default" reverts all override properties to match the system-default layout designs.
      </p>
    </div>
  );
}
