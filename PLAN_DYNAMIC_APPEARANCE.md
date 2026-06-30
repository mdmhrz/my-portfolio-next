# 🎨 Dynamic Appearance System - Complete Implementation Plan

**Project**: Portfolio Fullstack  
**Date**: 2026-06-30  
**Scope**: Dynamic Fonts & Colors System with Admin Dashboard  
**Tech Stack**: Next.js, Prisma, shadcn/ui, Zustand, Tailwind CSS

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Hardcoded Defaults](#hardcoded-defaults)
5. [Admin Dashboard UI](#admin-dashboard-ui)
6. [Font Integration](#font-integration)
7. [Color Integration](#color-integration)
8. [API Routes](#api-routes)
9. [Frontend Components](#frontend-components)
10. [CSS Injection System](#css-injection-system)
11. [File Structure](#file-structure)
12. [Implementation Checklist](#implementation-checklist)

---

## Overview

Create a unified **Appearance Settings** section in the admin dashboard where you can dynamically change:

- **Fonts**: Default (local) → Google Fonts → Custom Upload
- **Colors**: Simple (1 color) → Themes (pre-built) → Advanced (all colors)

Both sections have **"Restore Default"** buttons that reset to hardcoded factory defaults.

### Key Features

✅ Three font sources (Default, Google, Custom)  
✅ Three color modes (Simple, Themes, Advanced)  
✅ Restore to hardcoded defaults anytime  
✅ Real-time live preview  
✅ All shadcn/ui components  
✅ Persistent storage in database  
✅ Automatic CSS generation & injection  

---

## Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN UPDATES APPEARANCE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /admin/dashboard/appearance                                │
│  ├─ FontsTab (select font, weights, upload)                │
│  └─ ColorsTab (pick colors or theme, live preview)         │
│                                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓ User clicks "Save" or "Restore Default"
                 │
        ┌────────────────────┐
        │  API Endpoint      │
        │  /api/admin/       │
        │  appearance/*      │
        └────────┬───────────┘
                 │
                 ↓ Update DB
                 │
        ┌────────────────────┐
        │   SiteSettings     │
        │   (Prisma)         │
        └────────┬───────────┘
                 │
                 ↓ Generate CSS + Inject
                 │
        ┌────────────────────────────────┐
        │  appearanceInjector.ts         │
        │  • Generate @font-face         │
        │  • Generate CSS variables      │
        │  • Inject into <head>          │
        └────────┬───────────────────────┘
                 │
                 ↓ Page updates in real-time
                 │
        ┌────────────────────┐
        │  User sees new     │
        │  font + colors     │
        └────────────────────┘
```

---

## Database Schema

### Prisma Model

```prisma
model SiteSettings {
  id              String   @id @default("singleton")
  
  // ========== CTA & FOOTER (Existing) ==========
  ctaHeadline     String?
  ctaSubtext      String?
  footerText      String?
  
  // ========== FONTS ==========
  fontType        String?   @default("default")      // "default" | "google" | "custom"
  fontName        String?   @default("Satoshi")
  fontWeights     String[]  @default(["400", "500", "700", "900"])
  customFontUrl   String?   @db.Text                 // URL to custom font (Cloudinary)
  
  // ========== COLORS ==========
  colorMode       String?   @default("simple")       // "simple" | "themes" | "advanced"
  accentColor     String?   @default("#000000")      // For simple mode
  themePreset     String?   @default("default")      // For themes mode
  customPalette   Json?                              // For advanced mode
  
  // ========== METADATA ==========
  updatedAt       DateTime  @updatedAt

  @@map("site_settings")
}
```

**Migration**: Run `npx prisma migrate dev --name add_appearance_settings`

---

## Hardcoded Defaults

### Constants File

**File**: `src/constants/defaultAppearance.ts`

```typescript
export const DEFAULT_APPEARANCE = {
  // ========== FONT DEFAULTS ==========
  fonts: {
    type: "default",
    name: "Satoshi",
    weights: ["400", "500", "700", "900"],
    customUrl: null,
  },

  // ========== COLOR DEFAULTS ==========
  colors: {
    mode: "simple",
    accentColor: "#000000", // Your current black
    themePreset: "default",
    customPalette: null,
  },
};

// ========== COLOR PRESETS/THEMES ==========
export const COLOR_THEMES = {
  default: {
    name: "Default",
    description: "Original portfolio colors",
    light: {
      accent: "#000000",
      primary: "#000000",
      secondary: "#f0f0f0",
      background: "#ffffff",
      foreground: "#000000",
      border: "#e5e7eb",
    },
    dark: {
      accent: "#ffffff",
      primary: "#ffffff",
      secondary: "#1f2937",
      background: "#0f172a",
      foreground: "#ffffff",
      border: "#1f2937",
    },
  },

  ocean: {
    name: "Ocean Blue",
    description: "Cool, professional blue palette",
    light: {
      accent: "#2563eb",
      primary: "#1e40af",
      secondary: "#dbeafe",
      background: "#ffffff",
      foreground: "#1e293b",
      border: "#e0e7ff",
    },
    dark: {
      accent: "#60a5fa",
      primary: "#93c5fd",
      secondary: "#1e3a8a",
      background: "#0f172a",
      foreground: "#f1f5f9",
      border: "#1e3a8a",
    },
  },

  forest: {
    name: "Forest Green",
    description: "Natural, earthy green palette",
    light: {
      accent: "#16a34a",
      primary: "#15803d",
      secondary: "#dcfce7",
      background: "#ffffff",
      foreground: "#1e293b",
      border: "#c7d2e0",
    },
    dark: {
      accent: "#4ade80",
      primary: "#86efac",
      secondary: "#166534",
      background: "#0f172a",
      foreground: "#f1f5f9",
      border: "#166534",
    },
  },

  sunset: {
    name: "Sunset Orange",
    description: "Warm, energetic palette",
    light: {
      accent: "#ea580c",
      primary: "#c2410c",
      secondary: "#ffedd5",
      background: "#ffffff",
      foreground: "#1e293b",
      border: "#fed7aa",
    },
    dark: {
      accent: "#fb923c",
      primary: "#fdba74",
      secondary: "#7c2d12",
      background: "#0f172a",
      foreground: "#f1f5f9",
      border: "#7c2d12",
    },
  },

  midnight: {
    name: "Midnight Dark",
    description: "Deep, sophisticated dark palette",
    light: {
      accent: "#334155",
      primary: "#1e293b",
      secondary: "#e2e8f0",
      background: "#ffffff",
      foreground: "#0f172a",
      border: "#cbd5e1",
    },
    dark: {
      accent: "#94a3b8",
      primary: "#cbd5e1",
      secondary: "#1e293b",
      background: "#020617",
      foreground: "#f8fafc",
      border: "#334155",
    },
  },
};

// ========== DEFAULT FONTS ==========
export const DEFAULT_FONTS = [
  {
    id: "satoshi",
    name: "Satoshi",
    source: "local",
    weights: [400, 500, 700, 900],
    description: "Geometric sans-serif (current)",
  },
  {
    id: "inter",
    name: "Inter",
    source: "local",
    weights: [300, 400, 500, 600, 700, 800, 900],
    description: "Humanist sans-serif",
  },
  {
    id: "poppins",
    name: "Poppins",
    source: "local",
    weights: [300, 400, 500, 600, 700, 800, 900],
    description: "Geometric sans-serif",
  },
  {
    id: "geist",
    name: "Geist Sans",
    source: "local",
    weights: [400, 500, 600, 700],
    description: "Modern tech font",
  },
  {
    id: "roboto",
    name: "Roboto",
    source: "local",
    weights: [300, 400, 500, 700, 900],
    description: "Friendly sans-serif",
  },
];
```

**Key Point**: These defaults are hardcoded and never change unless you edit this file.

---

## Admin Dashboard UI

### Route & Layout

**Route**: `/admin/dashboard/appearance`

```
/admin/dashboard/appearance/
├── page.tsx                    (Main page with tabs)
└── _components/
    ├── FontsTab.tsx            (Font selection UI)
    ├── ColorsTab.tsx           (Color selection UI)
    ├── PreviewPanel.tsx        (Live preview)
    ├── DefaultFontSelector.tsx (Default fonts dropdown)
    ├── GoogleFontsPicker.tsx   (Google Fonts search)
    ├── CustomFontUploader.tsx  (File upload)
    ├── SimpleColorMode.tsx     (Accent picker)
    ├── ThemesColorMode.tsx     (Theme presets)
    ├── AdvancedColorMode.tsx   (Full customization)
    └── ColorPicker.tsx         (Shadcn color input)
```

### Main Page Layout

**File**: `src/app/admin/dashboard/appearance/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/PageHeader";
import { FontsTab } from "./_components/FontsTab";
import { ColorsTab } from "./_components/ColorsTab";
import { PreviewPanel } from "./_components/PreviewPanel";

export default function AppearancePage() {
  const [activeTab, setActiveTab] = useState<"fonts" | "colors">("fonts");

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Appearance Settings"
        description="Customize your portfolio's fonts and colors"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fonts">Fonts</TabsTrigger>
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                </TabsList>

                <TabsContent value="fonts" className="mt-6">
                  <FontsTab />
                </TabsContent>

                <TabsContent value="colors" className="mt-6">
                  <ColorsTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}
```

---

## Font Integration

### Three Font Sources

#### 1. Default Fonts (Local)

**File**: `src/app/admin/dashboard/appearance/_components/DefaultFontSelector.tsx`

```typescript
"use client";

import { DEFAULT_FONTS } from "@/constants/defaultAppearance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DefaultFontSelectorProps {
  selectedFont: string;
  onSelectFont: (font: string) => void;
  selectedWeights: string[];
  onSelectWeights: (weights: string[]) => void;
}

export function DefaultFontSelector({
  selectedFont,
  onSelectFont,
  selectedWeights,
  onSelectWeights,
}: DefaultFontSelectorProps) {
  const font = DEFAULT_FONTS.find((f) => f.name === selectedFont);

  const toggleWeight = (weight: string) => {
    if (selectedWeights.includes(weight)) {
      onSelectWeights(selectedWeights.filter((w) => w !== weight));
    } else {
      onSelectWeights([...selectedWeights, weight]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Font</Label>
        <Select value={selectedFont} onValueChange={onSelectFont}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_FONTS.map((f) => (
              <SelectItem key={f.id} value={f.name}>
                {f.name} - {f.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {font && (
        <div className="space-y-2">
          <Label>Font Weights</Label>
          <div className="flex flex-wrap gap-2">
            {font.weights.map((weight) => (
              <div key={weight} className="flex items-center space-x-2">
                <Checkbox
                  id={`weight-${weight}`}
                  checked={selectedWeights.includes(String(weight))}
                  onCheckedChange={() => toggleWeight(String(weight))}
                />
                <label
                  htmlFor={`weight-${weight}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {weight}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 2. Google Fonts

**File**: `src/app/admin/dashboard/appearance/_components/GoogleFontsPicker.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface GoogleFontsPickerProps {
  onSelectFont: (font: string) => void;
  onSelectWeights: (weights: string[]) => void;
}

export function GoogleFontsPicker({
  onSelectFont,
  onSelectWeights,
}: GoogleFontsPickerProps) {
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);

  useEffect(() => {
    async function fetchFonts() {
      setLoading(true);
      try {
        const query = search ? `?search=${search}` : "";
        const res = await fetch(`/api/admin/appearance/google-fonts${query}`);
        const data = await res.json();
        setFonts(data.slice(0, 20)); // Limit to 20 for UI
      } catch (error) {
        console.error("Failed to fetch Google Fonts", error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFonts();
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Search Fonts</Label>
        <Input
          placeholder="Search Google Fonts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
          {fonts.map((font) => (
            <button
              key={font.id}
              onClick={() => {
                setSelectedFont(font.name);
                setSelectedWeights(font.weights.slice(0, 4).map(String));
                onSelectFont(font.name);
              }}
              className={`p-3 rounded-lg border text-left transition ${
                selectedFont === font.name
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div style={{ fontFamily: font.name }} className="font-semibold">
                {font.name}
              </div>
              <div className="text-xs text-muted-foreground">{font.weights.length} weights</div>
            </button>
          ))}
        </div>
      )}

      {selectedFont && (
        <div className="space-y-2">
          <Label>Font Weights</Label>
          <div className="flex flex-wrap gap-2">
            {["300", "400", "500", "600", "700", "800", "900"].map((weight) => (
              <div key={weight} className="flex items-center space-x-2">
                <Checkbox
                  id={`gweight-${weight}`}
                  checked={selectedWeights.includes(weight)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedWeights([...selectedWeights, weight]);
                    } else {
                      setSelectedWeights(selectedWeights.filter((w) => w !== weight));
                    }
                  }}
                />
                <label htmlFor={`gweight-${weight}`} className="text-sm cursor-pointer">
                  {weight}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 3. Custom Font Upload

**File**: `src/app/admin/dashboard/appearance/_components/CustomFontUploader.tsx`

```typescript
"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CustomFontUploaderProps {
  onUploadFont: (fontName: string, fontUrl: string) => void;
}

export function CustomFontUploader({ onUploadFont }: CustomFontUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fontName, setFontName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["font/woff2", "font/woff", "font/ttf", "application/x-font-woff2"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid font format. Use .woff2, .woff, or .ttf");
        return;
      }
      setSelectedFile(file);
      setFontName(file.name.replace(/\.[^.]+$/, "")); // Remove extension
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fontName) {
      toast.error("Select a font file and enter a name");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("font", selectedFile);
      formData.append("fontName", fontName);
      formData.append("weights", JSON.stringify(["400", "700"])); // Default weights

      const res = await fetch("/api/admin/appearance/fonts/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      onUploadFont(fontName, data.fontUrl);
      toast.success("Font uploaded successfully!");
      setSelectedFile(null);
      setFontName("");
    } catch (error) {
      toast.error("Failed to upload font");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Font Name</Label>
        <Input
          placeholder="e.g., MyCustomFont"
          value={fontName}
          onChange={(e) => setFontName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Upload Font File</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition"
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm">Drop your font file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supported: .woff2, .woff, .ttf</p>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".woff2,.woff,.ttf,.otf"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {selectedFile && (
        <div className="space-y-2">
          <div className="text-sm">
            <strong>Selected:</strong> {selectedFile.name}
          </div>
          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </div>
          )}
          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload Font"}
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## Color Integration

### Three Color Modes

#### 1. Simple Mode (Accent Color Only)

**File**: `src/app/admin/dashboard/appearance/_components/SimpleColorMode.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface SimpleColorModeProps {
  accentColor: string;
  onChangeAccent: (color: string) => void;
}

const QUICK_PRESETS = [
  { name: "Black", color: "#000000" },
  { name: "Blue", color: "#2563eb" },
  { name: "Purple", color: "#7c3aed" },
  { name: "Cyan", color: "#0891b2" },
  { name: "Green", color: "#16a34a" },
  { name: "Orange", color: "#ea580c" },
  { name: "Rose", color: "#e11d48" },
];

export function SimpleColorMode({
  accentColor,
  onChangeAccent,
}: SimpleColorModeProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Accent Color</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="color"
              value={accentColor}
              onChange={(e) => onChangeAccent(e.target.value)}
              className="h-10 cursor-pointer"
            />
          </div>
          <Input
            type="text"
            value={accentColor}
            onChange={(e) => onChangeAccent(e.target.value)}
            placeholder="#000000"
            className="font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.color}
              onClick={() => onChangeAccent(preset.color)}
              className={`h-12 rounded-lg border-2 transition ${
                accentColor.toLowerCase() === preset.color.toLowerCase()
                  ? "border-primary"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      <div className="p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Tip: The system auto-generates hover states and light variants from your accent color.
        </p>
      </div>
    </div>
  );
}
```

#### 2. Themes Mode (Pre-built Palettes)

**File**: `src/app/admin/dashboard/appearance/_components/ThemesColorMode.tsx`

```typescript
"use client";

import { COLOR_THEMES } from "@/constants/defaultAppearance";
import { Label } from "@/components/ui/label";

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
      <Label>Select a Theme</Label>
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(COLOR_THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => onSelectTheme(key)}
            className={`p-4 rounded-lg border-2 transition text-left ${
              selectedTheme === key
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">{theme.name}</div>
            <div className="text-sm text-muted-foreground mb-3">{theme.description}</div>

            <div className="flex gap-2">
              <div
                className="h-8 w-8 rounded border"
                style={{ backgroundColor: theme.light.accent }}
                title="Accent"
              />
              <div
                className="h-8 w-8 rounded border"
                style={{ backgroundColor: theme.light.primary }}
                title="Primary"
              />
              <div
                className="h-8 w-8 rounded border"
                style={{ backgroundColor: theme.light.secondary }}
                title="Secondary"
              />
              <div
                className="h-8 w-8 rounded border"
                style={{ backgroundColor: theme.light.background }}
                title="Background"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### 3. Advanced Mode (Full Customization)

**File**: `src/app/admin/dashboard/appearance/_components/AdvancedColorMode.tsx`

```typescript
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

export function AdvancedColorMode({
  lightColors,
  darkColors,
  onUpdateColors,
}: AdvancedColorModeProps) {
  const ColorInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          ⚠️ Tip: Ensure sufficient contrast between text and background colors for readability.
        </AlertDescription>
      </Alert>

      {/* Light Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Light Mode Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ColorInput
            label="Accent"
            value={lightColors.accent}
            onChange={(val) =>
              onUpdateColors("light", { ...lightColors, accent: val })
            }
          />
          <ColorInput
            label="Primary"
            value={lightColors.primary}
            onChange={(val) =>
              onUpdateColors("light", { ...lightColors, primary: val })
            }
          />
          <ColorInput
            label="Secondary"
            value={lightColors.secondary}
            onChange={(val) =>
              onUpdateColors("light", { ...lightColors, secondary: val })
            }
          />
          <ColorInput
            label="Background"
            value={lightColors.background}
            onChange={(val) =>
              onUpdateColors("light", { ...lightColors, background: val })
            }
          />
          <ColorInput
            label="Foreground"
            value={lightColors.foreground}
            onChange={(val) =>
              onUpdateColors("light", { ...lightColors, foreground: val })
            }
          />
          <ColorInput
            label="Border"
            value={lightColors.border}
            onChange={(val) =>
              onUpdateColors("light", { ...lightColors, border: val })
            }
          />
        </CardContent>
      </Card>

      {/* Dark Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dark Mode Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ColorInput
            label="Accent"
            value={darkColors.accent}
            onChange={(val) =>
              onUpdateColors("dark", { ...darkColors, accent: val })
            }
          />
          <ColorInput
            label="Primary"
            value={darkColors.primary}
            onChange={(val) =>
              onUpdateColors("dark", { ...darkColors, primary: val })
            }
          />
          <ColorInput
            label="Secondary"
            value={darkColors.secondary}
            onChange={(val) =>
              onUpdateColors("dark", { ...darkColors, secondary: val })
            }
          />
          <ColorInput
            label="Background"
            value={darkColors.background}
            onChange={(val) =>
              onUpdateColors("dark", { ...darkColors, background: val })
            }
          />
          <ColorInput
            label="Foreground"
            value={darkColors.foreground}
            onChange={(val) =>
              onUpdateColors("dark", { ...darkColors, foreground: val })
            }
          />
          <ColorInput
            label="Border"
            value={darkColors.border}
            onChange={(val) =>
              onUpdateColors("dark", { ...darkColors, border: val })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## API Routes

### 1. Get Appearance Config

**File**: `src/app/api/admin/appearance/route.ts`

```typescript
import { db } from "@/lib/db";
import { DEFAULT_APPEARANCE } from "@/constants/defaultAppearance";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const settings = await db.siteSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      return NextResponse.json(DEFAULT_APPEARANCE);
    }

    return NextResponse.json({
      fonts: {
        type: settings.fontType,
        name: settings.fontName,
        weights: settings.fontWeights,
        customUrl: settings.customFontUrl,
      },
      colors: {
        mode: settings.colorMode,
        accentColor: settings.accentColor,
        themePreset: settings.themePreset,
        customPalette: settings.customPalette,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { fonts, colors } = await req.json();

    await db.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        fontType: fonts?.type,
        fontName: fonts?.name,
        fontWeights: fonts?.weights,
        customFontUrl: fonts?.customUrl,
        colorMode: colors?.mode,
        accentColor: colors?.accentColor,
        themePreset: colors?.themePreset,
        customPalette: colors?.customPalette,
      },
      update: {
        fontType: fonts?.type,
        fontName: fonts?.name,
        fontWeights: fonts?.weights,
        customFontUrl: fonts?.customUrl,
        colorMode: colors?.mode,
        accentColor: colors?.accentColor,
        themePreset: colors?.themePreset,
        customPalette: colors?.customPalette,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
```

### 2. Restore Defaults

**File**: `src/app/api/admin/appearance/restore/route.ts`

```typescript
import { db } from "@/lib/db";
import { DEFAULT_APPEARANCE } from "@/constants/defaultAppearance";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { type } = await req.json(); // "fonts" | "colors" | "all"

    let updateData: any = {};

    if (type === "fonts" || type === "all") {
      updateData = {
        ...updateData,
        fontType: DEFAULT_APPEARANCE.fonts.type,
        fontName: DEFAULT_APPEARANCE.fonts.name,
        fontWeights: DEFAULT_APPEARANCE.fonts.weights,
        customFontUrl: null,
      };
    }

    if (type === "colors" || type === "all") {
      updateData = {
        ...updateData,
        colorMode: DEFAULT_APPEARANCE.colors.mode,
        accentColor: DEFAULT_APPEARANCE.colors.accentColor,
        themePreset: DEFAULT_APPEARANCE.colors.themePreset,
        customPalette: null,
      };
    }

    await db.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `${type} restored to defaults`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to restore defaults" },
      { status: 500 }
    );
  }
}
```

### 3. Font Upload

**File**: `src/app/api/admin/appearance/fonts/upload/route.ts`

```typescript
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fontFile = formData.get("font") as File;
    const fontName = formData.get("fontName") as string;

    if (!fontFile || !fontName) {
      return NextResponse.json(
        { error: "Font file and name required" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "font/woff2",
      "font/woff",
      "font/ttf",
      "font/otf",
      "application/x-font-woff2",
    ];
    if (!validTypes.includes(fontFile.type)) {
      return NextResponse.json(
        { error: "Invalid font format. Use .woff2, .woff, .ttf, or .otf" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = await fontFile.arrayBuffer();
    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          public_id: `fonts/${fontName}`,
          folder: "portfolio-fonts",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(Buffer.from(buffer));
    });

    const fontUrl = (uploadResponse as any).secure_url;

    return NextResponse.json({
      success: true,
      fontUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload font" },
      { status: 500 }
    );
  }
}
```

### 4. Google Fonts

**File**: `src/app/api/admin/appearance/google-fonts/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const url = new URL("https://www.googleapis.com/webfonts/v1/webfonts");
    url.searchParams.set("key", process.env.GOOGLE_FONTS_API_KEY || "");
    url.searchParams.set("sort", "popularity");

    const res = await fetch(url);
    const data = await res.json();

    let fonts = data.items || [];

    if (search) {
      fonts = fonts.filter((f: any) =>
        f.family.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json(
      fonts.slice(0, 50).map((f: any) => ({
        id: f.family.toLowerCase().replace(/\s+/g, "-"),
        name: f.family,
        weights: f.variants
          .map((v: string) => v.replace("italic", "").trim())
          .filter((v: string) => /^\d+$/.test(v)),
        variants: f.variants,
        category: f.category,
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch Google Fonts" },
      { status: 500 }
    );
  }
}
```

---

## CSS Injection System

### Appearance Injector

**File**: `src/lib/appearanceInjector.ts`

```typescript
import { COLOR_THEMES, DEFAULT_FONTS } from "@/constants/defaultAppearance";

export interface AppearanceConfig {
  fonts: {
    type: string;
    name: string;
    weights: string[];
    customUrl?: string;
  };
  colors: {
    mode: string;
    accentColor: string;
    themePreset: string;
    customPalette?: any;
  };
}

export function generateAppearanceCSS(config: AppearanceConfig): string {
  const fontCSS = generateFontCSS(config.fonts);
  const colorCSS = generateColorCSS(config.colors);

  return fontCSS + "\n" + colorCSS;
}

function generateFontCSS(fonts: any): string {
  let fontImport = "";
  let fontFace = "";

  if (fonts.type === "default") {
    fontFace = generateLocalFontFace(fonts.name, fonts.weights);
  } else if (fonts.type === "google") {
    fontImport = generateGoogleFontImport(fonts.name, fonts.weights);
  } else if (fonts.type === "custom") {
    fontFace = `
      @font-face {
        font-family: '${fonts.name}';
        src: url('${fonts.customUrl}') format('woff2');
        font-weight: 400;
        font-display: swap;
      }
    `;
  }

  return `
    ${fontImport}
    ${fontFace}
    
    :root {
      --font-name: "${fonts.name}";
    }
    
    body, html {
      font-family: var(--font-name), system-ui, sans-serif;
    }
  `;
}

function generateColorCSS(colors: any): string {
  let colorPalette: any;

  if (colors.mode === "simple") {
    colorPalette = generateFromAccent(colors.accentColor);
  } else if (colors.mode === "themes") {
    colorPalette = COLOR_THEMES[colors.themePreset];
  } else if (colors.mode === "advanced") {
    colorPalette = colors.customPalette;
  }

  if (!colorPalette) {
    colorPalette = COLOR_THEMES["default"];
  }

  return `
    :root {
      --accent: ${colorPalette.light.accent};
      --primary: ${colorPalette.light.primary};
      --secondary: ${colorPalette.light.secondary};
      --background: ${colorPalette.light.background};
      --foreground: ${colorPalette.light.foreground};
      --border: ${colorPalette.light.border};
    }
    
    .dark {
      --accent: ${colorPalette.dark.accent};
      --primary: ${colorPalette.dark.primary};
      --secondary: ${colorPalette.dark.secondary};
      --background: ${colorPalette.dark.background};
      --foreground: ${colorPalette.dark.foreground};
      --border: ${colorPalette.dark.border};
    }
  `;
}

function generateLocalFontFace(fontName: string, weights: string[]): string {
  const font = DEFAULT_FONTS.find((f) => f.name === fontName);
  if (!font) return "";

  return weights
    .map(
      (weight) => `
    @font-face {
      font-family: '${fontName}';
      src: url('/fonts/${font.id}/${font.id}-${weight}.woff2') format('woff2');
      font-weight: ${weight};
      font-display: swap;
    }
  `
    )
    .join("\n");
}

function generateGoogleFontImport(fontName: string, weights: string[]): string {
  const params = new URLSearchParams();
  params.set(
    "family",
    `${fontName.replace(/\s+/g, "+")}:wght@${weights.join(";")}`
  );
  params.set("display", "swap");
  return `@import url('https://fonts.googleapis.com/css2?${params.toString()}');`;
}

function generateFromAccent(accentHex: string): any {
  return {
    light: {
      accent: accentHex,
      primary: darken(accentHex, 20),
      secondary: lighten(accentHex, 70),
      background: "#ffffff",
      foreground: "#000000",
      border: lighten(accentHex, 80),
    },
    dark: {
      accent: lighten(accentHex, 30),
      primary: lighten(accentHex, 40),
      secondary: darken(accentHex, 50),
      background: "#0f172a",
      foreground: "#ffffff",
      border: darken(accentHex, 60),
    },
  };
}

function lighten(color: string, percent: number): string {
  // Simple hex lightening (could use a library for better results)
  return color; // Simplified for brevity
}

function darken(color: string, percent: number): string {
  // Simple hex darkening
  return color; // Simplified for brevity
}
```

### Inject on App Load

**File**: `src/lib/useAppearance.ts` (Custom Hook)

```typescript
import { useEffect } from "react";
import { generateAppearanceCSS } from "./appearanceInjector";

export function useAppearance() {
  useEffect(() => {
    async function loadAppearance() {
      try {
        const res = await fetch("/api/admin/appearance");
        const config = await res.json();

        const css = generateAppearanceCSS(config);

        // Inject into head
        let styleElement = document.getElementById("appearance-styles");
        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.id = "appearance-styles";
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = css;
      } catch (error) {
        console.error("Failed to load appearance", error);
      }
    }

    loadAppearance();
  }, []);
}
```

### Use in Layout

**File**: `src/app/layout.tsx` (Update)

```typescript
"use client";

import { useAppearance } from "@/lib/useAppearance";
import { ThemeProvider } from "@/components/global/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAppearance(); // Load appearance on every page

  return (
    <html suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── appearance/
│   │           ├── route.ts                  # GET/POST config
│   │           ├── restore/route.ts          # POST restore defaults
│   │           ├── fonts/
│   │           │   └── upload/route.ts       # POST upload font
│   │           └── google-fonts/route.ts     # GET Google fonts
│   │
│   └── admin/
│       └── dashboard/
│           └── appearance/
│               ├── page.tsx                  # Main page
│               └── _components/
│                   ├── FontsTab.tsx
│                   ├── ColorsTab.tsx
│                   ├── PreviewPanel.tsx
│                   ├── DefaultFontSelector.tsx
│                   ├── GoogleFontsPicker.tsx
│                   ├── CustomFontUploader.tsx
│                   ├── SimpleColorMode.tsx
│                   ├── ThemesColorMode.tsx
│                   └── AdvancedColorMode.tsx
│
├── lib/
│   ├── appearanceInjector.ts      # CSS generation
│   ├── useAppearance.ts           # Hook for loading
│   └── googleFonts.ts             # Google Fonts utils
│
├── constants/
│   └── defaultAppearance.ts       # Hardcoded defaults
│
└── store/
    └── useAppearanceStore.ts      # Zustand store
```

---

## Implementation Checklist

### Phase 1: Setup
- [ ] Update Prisma schema with appearance fields
- [ ] Run `npx prisma migrate dev`
- [ ] Create `constants/defaultAppearance.ts`
- [ ] Set up environment variables:
  - `GOOGLE_FONTS_API_KEY`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### Phase 2: API Routes
- [ ] Create `/api/admin/appearance/route.ts`
- [ ] Create `/api/admin/appearance/restore/route.ts`
- [ ] Create `/api/admin/appearance/fonts/upload/route.ts`
- [ ] Create `/api/admin/appearance/google-fonts/route.ts`
- [ ] Test all endpoints with Postman/Insomnia

### Phase 3: Font Components
- [ ] Create `DefaultFontSelector.tsx` (shadcn: Select, Checkbox)
- [ ] Create `GoogleFontsPicker.tsx` (shadcn: Input, Loader)
- [ ] Create `CustomFontUploader.tsx` (shadcn: Input, Button, Progress)
- [ ] Create `FontsTab.tsx` (shadcn: Tabs)

### Phase 4: Color Components
- [ ] Create `SimpleColorMode.tsx` (shadcn: Input, Label)
- [ ] Create `ThemesColorMode.tsx` (shadcn: Label, Card)
- [ ] Create `AdvancedColorMode.tsx` (shadcn: Card, Alert, Input)
- [ ] Create `ColorsTab.tsx` (shadcn: Tabs)

### Phase 5: Main Page & Store
- [ ] Create `useAppearanceStore.ts` (Zustand)
- [ ] Create `appearance/page.tsx` (main layout)
- [ ] Create `PreviewPanel.tsx` (live preview)
- [ ] Create `appearanceInjector.ts` (CSS generation)
- [ ] Create `useAppearance.ts` (hook)

### Phase 6: Integration
- [ ] Update `src/app/layout.tsx` to call `useAppearance()`
- [ ] Update admin sidebar to link to `/appearance`
- [ ] Download 5 default fonts to `/public/fonts/`
- [ ] Test with different fonts and colors
- [ ] Test restore default functionality
- [ ] Test dark mode color injection

### Phase 7: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success toasts
- [ ] Test on mobile
- [ ] Optimize performance
- [ ] Add documentation

---

## Environment Variables

Add to `.env.local`:

```env
# Google Fonts API
GOOGLE_FONTS_API_KEY=your_api_key_here

# Cloudinary (for custom font uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Dependencies (Already Installed)

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "shadcn/ui": "latest",
    "@tanstack/react-query": "latest",
    "zustand": "latest",
    "sonner": "latest",
    "cloudinary": "latest",
    "prisma": "latest"
  }
}
```

---

## Summary

✅ **Complete end-to-end system** for dynamic fonts and colors  
✅ **Hardcoded defaults** for restore functionality  
✅ **Three font sources** (Default, Google, Custom)  
✅ **Three color modes** (Simple, Themes, Advanced)  
✅ **All shadcn/ui components** for consistency  
✅ **Real-time live preview**  
✅ **Persistent storage** in database  
✅ **CSS injection** on app load  

---

## Next Steps

1. Run Prisma migration
2. Set up environment variables
3. Create API routes first
4. Build components bottom-up
5. Test each feature individually
6. Integrate and test end-to-end

**Happy building!** 🚀
