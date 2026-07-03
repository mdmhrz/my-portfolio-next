"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, ArrowRight, Laptop } from "lucide-react";
import { useAppearanceStore } from "@/store/useAppearanceStore";
import { resolveTokens, fontFaceCSS } from "@/lib/appearanceInjector";

export function PreviewPanel() {
  const { draftColors, draftFont } = useAppearanceStore();
  const [mode, setMode] = useState<"light" | "dark">("light");

  const tokens = useMemo(() => resolveTokens(draftColors, mode), [draftColors, mode]);
  const faces = useMemo(() => fontFaceCSS(draftFont), [draftFont]);

  const fontFamily =
    draftFont?.name && draftFont.name !== "Satoshi"
      ? `'${draftFont.name}', ui-sans-serif, system-ui, sans-serif`
      : undefined;

  const style = useMemo(() => {
    const s: Record<string, string> = {};
    for (const [k, v] of Object.entries(tokens)) s[`--${k}`] = v;
    if (fontFamily) s.fontFamily = fontFamily;
    return s as React.CSSProperties;
  }, [tokens, fontFamily]);

  return (
    <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-3.5 px-5 bg-neutral-50/50 dark:bg-zinc-900/40">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Laptop className="h-4 w-4 text-primary" />
          <span>Interactive Preview</span>
        </CardTitle>

        {/* Light/Dark Toggle */}
        <div className="flex rounded-lg border border-border/80 p-0.5 bg-background">
          <button
            type="button"
            onClick={() => setMode("light")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
              mode === "light"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3 w-3" /> Light
          </button>
          <button
            type="button"
            onClick={() => setMode("dark")}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
              mode === "dark"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3 w-3" /> Dark
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {faces ? <style dangerouslySetInnerHTML={{ __html: faces }} /> : null}

        {/* Browser Mockup Wrapper */}
        <div className={`border border-border/80 rounded-xl overflow-hidden bg-muted/30 transition-all duration-300 ${
          mode === "dark" ? "dark" : ""
        }`}>
          {/* Browser Address Bar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-zinc-900 border-b border-border/60">
            <div className="flex gap-1 select-none">
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
              <span className="h-2 w-2 rounded-full bg-border" />
            </div>
            <div className="flex-1 max-w-xs mx-auto bg-background text-[10px] text-muted-foreground py-0.5 px-3 rounded text-center border font-sans select-none truncate">
              localhost:3000
            </div>
          </div>

          {/* The preview surface carrying its own token values + font. */}
          <div
            style={style}
            className="space-y-4 bg-background p-5 text-foreground transition-all duration-300"
          >
            {/* Nav Mockup */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-sm font-bold tracking-tight">Portfolio.</span>
              <div className="flex gap-3 text-[10px] font-medium text-muted-foreground">
                <span>About</span>
                <span>Blogs</span>
                <span className="text-primary font-semibold">Contact</span>
              </div>
            </div>

            {/* Hero Mockup */}
            <div className="space-y-1.5 py-2">
              <p className="text-2xl font-bold leading-tight tracking-tight">
                Design System Showcase
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The quick brown fox jumps over the lazy dog. Previewing active theme tokens.
              </p>
            </div>

            {/* UI Actions Mockup */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition">
                Primary Button
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:opacity-90 transition">
                Secondary
              </button>
              <button className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-transparent border border-border text-foreground hover:bg-neutral-100/10 transition">
                Outline
              </button>
            </div>

            {/* Card Mockup */}
            <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-semibold">Mock Card Surface</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                Subtle helper text displayed on a secondary container.
              </p>
              <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 rounded-full" />
              </div>
            </div>

            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              <span>Explore live demo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-sans text-muted-foreground">
          Font: {draftFont?.name || "Satoshi"} · Theme: {mode} mode
        </p>
      </CardContent>
    </Card>
  );
}
