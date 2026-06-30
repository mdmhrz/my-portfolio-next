"use client";

import { COLOR_THEMES } from "@/constants/defaultAppearance";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface ThemesColorModeProps {
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

export function ThemesColorMode({
  selectedTheme,
  onSelectTheme,
}: ThemesColorModeProps) {
  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-foreground">Select Preset Theme</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(COLOR_THEMES).map(([key, theme]) => {
          const active = selectedTheme === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTheme(key)}
              className={`p-4 rounded-xl border text-left transition-all duration-250 hover:shadow-md cursor-pointer relative ${active
                ? "border-primary bg-primary/[0.02] ring-1 ring-primary shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-neutral-100/5"
                }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm text-foreground">{theme.name}</div>
                {active && (
                  <div className="bg-primary text-primary-foreground p-0.5 rounded-full">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mb-4 leading-normal truncate">{theme.description}</div>

              {/* Color Strips Preview */}
              <div className="space-y-2">
                {/* Light Palette Preview */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-muted-foreground w-8">Light</span>
                  <div className="flex -space-x-1.5">
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.light.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.light.primary }}
                      title="Primary"
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.light.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.light.background }}
                      title="Background"
                    />
                  </div>
                </div>

                {/* Dark Palette Preview */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-muted-foreground w-8">Dark</span>
                  <div className="flex -space-x-1.5">
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.dark.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.dark.primary }}
                      title="Primary"
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.dark.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="h-5 w-5 rounded-full border border-background shadow-sm"
                      style={{ backgroundColor: theme.dark.background }}
                      title="Background"
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
