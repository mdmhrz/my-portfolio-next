"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Sparkles } from "lucide-react";

interface ColorPalette {
  accent: string;
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  border: string;
}

interface AdvancedColorModeProps {
  lightColors: ColorPalette;
  darkColors: ColorPalette;
  onUpdateColors: (mode: "light" | "dark", colors: ColorPalette) => void;
}

// Each token + a plain-English description of where it shows up.
const FIELDS: { key: keyof ColorPalette; label: string; hint: string }[] = [
  { key: "primary", label: "Primary Color", hint: "Main action buttons" },
  { key: "accent", label: "Accent Color", hint: "Hover states & highlights" },
  { key: "secondary", label: "Secondary Color", hint: "Muted card backdrops" },
  { key: "background", label: "Background", hint: "Main page backdrop" },
  { key: "foreground", label: "Foreground Text", hint: "Body titles & copy text" },
  { key: "border", label: "Border Outlines", hint: "Dividers & card borders" },
];

function ColorInput({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const handleTextChange = (val: string) => {
    let cleanVal = val;
    if (cleanVal.length > 0 && !cleanVal.startsWith("#")) {
      cleanVal = "#" + cleanVal;
    }
    onChange(cleanVal);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <div className="min-w-0">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        <p className="text-[10px] text-muted-foreground leading-normal truncate">{hint}</p>
      </div>
      <div className="flex items-center shrink-0 gap-2">
        {/* Color picker bubble */}
        <div className="relative h-7 w-7 rounded-full border border-border shadow-sm overflow-hidden shrink-0 cursor-pointer transition hover:scale-105">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          />
          <div className="h-full w-full" style={{ backgroundColor: value }} />
        </div>
        {/* Hex input */}
        <Input
          type="text"
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="#000000"
          className="h-8 w-20 font-sans text-[11px] px-2 border-border bg-background text-center focus-visible:ring-1 focus-visible:ring-primary"
        />
      </div>
    </div>
  );
}

export function AdvancedColorMode({
  lightColors,
  darkColors,
  onUpdateColors,
}: AdvancedColorModeProps) {
  const renderSet = (mode: "light" | "dark", colors: ColorPalette) => (
    <Card className="border border-border/80 bg-card rounded-xl overflow-hidden shadow-sm">
      <CardHeader className="bg-neutral-50/50 dark:bg-zinc-900/40 border-b border-border/40 py-3.5 px-5">
        <CardTitle className="text-sm font-semibold capitalize text-foreground flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${mode === 'light' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
          {mode} Mode Palette
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-1 bg-transparent">
        {FIELDS.map((f) => (
          <ColorInput
            key={f.key}
            label={f.label}
            hint={f.hint}
            value={colors[f.key] || "#000000"}
            onChange={(val) => onUpdateColors(mode, { ...colors, [f.key]: val })}
          />
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/[0.01] border-primary/10 rounded-xl">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-xs text-muted-foreground leading-normal">
          Ensure there is sufficient color contrast between your Foreground Text and Background colors to satisfy accessibility requirements.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {renderSet("light", lightColors)}
        {renderSet("dark", darkColors)}
      </div>
    </div>
  );
}
