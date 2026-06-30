"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles } from "lucide-react";

interface SimpleColorModeProps {
  accentColor: string;
  onChangeAccent: (color: string) => void;
}

const QUICK_PRESETS = [
  { name: "Slate", color: "#0f172a" },
  { name: "Indigo", color: "#6366f1" },
  { name: "Violet", color: "#8b5cf6" },
  { name: "Cyan", color: "#06b6d4" },
  { name: "Emerald", color: "#10b981" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#f43f5e" },
];

export function SimpleColorMode({
  accentColor,
  onChangeAccent,
}: SimpleColorModeProps) {
  const handleInputChange = (val: string) => {
    let cleanVal = val;
    if (cleanVal.length > 0 && !cleanVal.startsWith("#")) {
      cleanVal = "#" + cleanVal;
    }
    onChangeAccent(cleanVal);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Custom Accent Color</Label>
        <div className="flex gap-3">
          {/* Color Preview Block and Picker */}
          <div className="relative h-10 w-14 shrink-0 rounded-lg border border-border overflow-hidden cursor-pointer shadow-sm">
            <Input
              type="color"
              value={accentColor}
              onChange={(e) => onChangeAccent(e.target.value)}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
            />
            <div
              className="h-full w-full"
              style={{ backgroundColor: accentColor }}
            />
          </div>
          <Input
            type="text"
            value={accentColor}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="#000000"
            className="font-mono text-sm w-full border-border bg-background focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Popular Presets</Label>
        <div className="flex flex-wrap gap-3">
          {QUICK_PRESETS.map((preset) => {
            const active = accentColor.toLowerCase() === preset.color.toLowerCase();
            return (
              <button
                key={preset.color}
                type="button"
                onClick={() => onChangeAccent(preset.color)}
                className={`h-10 w-10 rounded-full border-2 transition-all duration-200 hover:scale-110 flex items-center justify-center cursor-pointer shadow-sm relative ${active
                    ? "border-primary ring-2 ring-primary/40 scale-105"
                    : "border-border hover:border-primary/50"
                  }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              >
                {active && (
                  <Check className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2.5 p-4 bg-primary/[0.02] border border-primary/10 rounded-xl items-start">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-normal">
          Hover states, light tint backgrounds, and active highlights are auto-generated from your custom accent color.
        </p>
      </div>
    </div>
  );
}
