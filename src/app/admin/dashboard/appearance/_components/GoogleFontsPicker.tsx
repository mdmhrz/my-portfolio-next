"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";

interface GoogleFontsPickerProps {
  activeFont: string;
  activeWeights: string[];
  onSelectFont: (font: string) => void;
  onSelectWeights: (weights: string[]) => void;
}

export function GoogleFontsPicker({
  activeFont,
  activeWeights,
  onSelectFont,
  onSelectWeights,
}: GoogleFontsPickerProps) {
  const [search, setSearch] = useState("");
  const [fonts, setFonts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchFonts() {
      setLoading(true);
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`/api/admin/appearance/google-fonts${query}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFonts(data.slice(0, 16));
      } catch (error) {
        console.error("Failed to fetch Google Fonts", error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFonts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Load the Google Font stylesheets dynamically to show font previews in the UI!
  const fontsStylesheetUrl = useMemo(() => {
    if (fonts.length === 0) return null;
    const families = fonts.map((f) => `family=${f.name.replace(/\s+/g, "+")}`).join("&");
    return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  }, [fonts]);

  const handleSelectFont = (font: any) => {
    const defaultWeights = font.weights.slice(0, 4);
    onSelectFont(font.name);
    onSelectWeights(defaultWeights);
  };

  const toggleWeight = (weight: string) => {
    if (activeWeights.includes(weight)) {
      if (activeWeights.length > 1) {
        const newWeights = activeWeights.filter((w) => w !== weight).sort();
        onSelectWeights(newWeights);
      }
    } else {
      const newWeights = [...activeWeights, weight].sort();
      onSelectWeights(newWeights);
    }
  };

  // Check if the currently active font is a Google font that is loaded in our search list
  const selectedFontDetails = useMemo(() => {
    return fonts.find((f) => f.name === activeFont) || null;
  }, [fonts, activeFont]);

  return (
    <div className="space-y-6">
      {/* Inject stylesheet to display live previews */}
      {fontsStylesheetUrl && (
        <link rel="stylesheet" href={fontsStylesheetUrl} crossOrigin="anonymous" />
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Search Google Fonts</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search fonts (e.g. Inter, Playfair Display, Outfit)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-border bg-background focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
          {fonts.map((font) => {
            const active = activeFont === font.name;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => handleSelectFont(font)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 hover:bg-neutral-100/5"
                }`}
              >
                <div 
                  className="text-lg truncate leading-snug mb-1" 
                  style={{ fontFamily: font.name }}
                >
                  {font.name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground flex justify-between">
                  <span>{font.category}</span>
                  <span>{font.weights.length} weights</span>
                </div>
              </button>
            );
          })}
          {fonts.length === 0 && (
            <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
              No Google fonts found. Try another search.
            </div>
          )}
        </div>
      )}

      {/* Show weight selection if the active font is the selected one */}
      {activeFont && (
        <div className="space-y-3 border-t border-border pt-4">
          <div>
            <Label className="text-sm font-medium text-foreground">Selected Font: {activeFont}</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select the weights to import from Google Fonts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["300", "400", "500", "600", "700", "800", "900"].map((weight) => {
              const active = activeWeights.includes(weight);
              return (
                <button
                  key={weight}
                  type="button"
                  onClick={() => toggleWeight(weight)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 cursor-pointer ${
                    active
                      ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-neutral-100/10 text-muted-foreground"
                  }`}
                >
                  {weight}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
