"use client";

import { DEFAULT_FONTS } from "@/constants/defaultAppearance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
      // Keep at least one weight
      if (selectedWeights.length > 1) {
        onSelectWeights(selectedWeights.filter((w) => w !== weight));
      }
    } else {
      onSelectWeights([...selectedWeights, weight].sort());
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Select Base Font</Label>
        <Select value={selectedFont} onValueChange={onSelectFont}>
          <SelectTrigger className="w-full border-border bg-background focus:ring-1 focus:ring-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {DEFAULT_FONTS.map((f) => (
              <SelectItem key={f.id} value={f.name}>
                <span className="font-medium">{f.name}</span>
                <span className="text-xs text-muted-foreground ml-2">({f.description})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {font && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-foreground">Font Weights</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select the weights to load. More weights can slightly affect page load times.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {font.weights.map((weight) => {
              const active = selectedWeights.includes(String(weight));
              return (
                <button
                  key={weight}
                  type="button"
                  onClick={() => toggleWeight(String(weight))}
                  className={`px-4 py-2 rounded-lg border text-xs font-sans transition-all duration-150 cursor-pointer ${
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
