"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, Type } from "lucide-react";
import { toast } from "sonner";
import { useAppearanceStore } from "../store";
import { DefaultFontSelector } from "./DefaultFontSelector";
import { GoogleFontsPicker } from "./GoogleFontsPicker";
import { CustomFontUploader } from "./CustomFontUploader";

export function FontsTab() {
  const { font, updateFont, restore, setDraftFont, loading } = useAppearanceStore();
  const [fontType, setFontType] = useState<"default" | "google" | "custom">(
    (font?.type as any) || "default"
  );
  const [selectedFont, setSelectedFont] = useState(font?.name || "Satoshi");
  const [selectedWeights, setSelectedWeights] = useState(font?.weights || ["400", "500", "700", "900"]);
  const [isSaving, setIsSaving] = useState(false);

  // Mirror the in-progress font to the store so the PreviewPanel updates live.
  useEffect(() => {
    setDraftFont({
      type: fontType,
      name: selectedFont,
      weights: selectedWeights,
      customUrl: fontType === "custom" ? font?.customUrl ?? null : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontType, selectedFont, selectedWeights]);

  const handleSaveFont = async () => {
    setIsSaving(true);
    try {
      await updateFont({
        type: fontType,
        name: selectedFont,
        weights: selectedWeights,
        customUrl: fontType === "custom" ? font?.customUrl ?? null : null,
      });
      toast.success("Font settings saved!");
    } catch (error) {
      toast.error("Failed to save font");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreFonts = async () => {
    try {
      await restore("font");
      setFontType("default");
      setSelectedFont("Satoshi");
      setSelectedWeights(["400", "500", "700", "900"]);
      toast.success("Fonts restored to default!");
    } catch (error) {
      toast.error("Failed to restore fonts");
    }
  };

  const handleUploadFont = (fontName: string, fontUrl: string, weights: string[]) => {
    setSelectedFont(fontName);
    setSelectedWeights(weights);
    setFontType("custom");
  };

  // Google Font URL loader for live preview card
  const activeFontStylesheet = fontType === "google"
    ? `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/\s+/g, "+")}:wght@${selectedWeights.join(";")}&display=swap`
    : null;

  return (
    <div className="space-y-6">
      {activeFontStylesheet && (
        <link rel="stylesheet" href={activeFontStylesheet} crossOrigin="anonymous" />
      )}

      <Tabs value={fontType} onValueChange={(v) => setFontType(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-neutral-100/80 dark:bg-zinc-900/60 p-1 rounded-2xl h-11 border border-border/40 shadow-inner-sm">
          <TabsTrigger value="default" className="rounded-xl flex items-center justify-center text-xs font-semibold">
            System default
          </TabsTrigger>
          <TabsTrigger value="google" className="rounded-xl flex items-center justify-center text-xs font-semibold">
            Google Fonts
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-xl flex items-center justify-center text-xs font-semibold">
            Custom uploader
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 border border-border/50 bg-neutral-50/20 dark:bg-zinc-950/40 p-6 rounded-2xl shadow-sm backdrop-blur-md">
          <TabsContent value="default" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <DefaultFontSelector
              selectedFont={selectedFont}
              onSelectFont={setSelectedFont}
              selectedWeights={selectedWeights}
              onSelectWeights={setSelectedWeights}
            />
          </TabsContent>

          <TabsContent value="google" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <GoogleFontsPicker
              activeFont={selectedFont}
              activeWeights={selectedWeights}
              onSelectFont={setSelectedFont}
              onSelectWeights={setSelectedWeights}
            />
          </TabsContent>

          <TabsContent value="custom" className="mt-0 border-0 p-0 focus-visible:ring-0">
            <CustomFontUploader onUploadFont={handleUploadFont} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Active Font Preview Card */}
      <div className="space-y-3 p-5 bg-neutral-100/30 dark:bg-zinc-950/20 border border-border/50 rounded-2xl relative overflow-hidden backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Type className="h-3.5 w-3.5" />
            <span>Active Font Specimen</span>
          </div>
          <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">
            {fontType}
          </span>
        </div>
        <div className="py-2">
          <p 
            className="text-3xl font-normal leading-tight tracking-tight text-foreground truncate"
            style={{ fontFamily: fontType === 'google' || fontType === 'default' ? selectedFont : undefined }}
          >
            {selectedFont}
          </p>
          <p className="text-[10px] text-muted-foreground mt-3 font-sans">
            Weights loaded: {selectedWeights.join(", ")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 border-t border-border/50 pt-5">
        <Button
          variant="outline"
          onClick={handleRestoreFonts}
          disabled={loading || isSaving}
          size="sm"
          className="w-full sm:w-auto rounded-xl h-10.5 px-5 border-border/80 hover:bg-neutral-100 dark:hover:bg-zinc-800/80 hover:text-foreground transition-all duration-200 cursor-pointer font-medium text-xs"
        >
          <RotateCcw className="h-4 w-4 mr-2 text-muted-foreground" />
          Restore Default
        </Button>
        <Button
          onClick={handleSaveFont}
          disabled={loading || isSaving}
          className="w-full sm:flex-1 rounded-xl h-10.5 font-semibold text-xs tracking-tight shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving changes...
            </>
          ) : (
            "Save Typography Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
