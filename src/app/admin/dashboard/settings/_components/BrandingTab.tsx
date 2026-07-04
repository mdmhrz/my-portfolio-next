'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { ImageUpload } from "@/app/admin/dashboard/_components/ImageUpload";
import { Logo } from "@/components/global/Logo";

export function BrandingTab() {
  const { settings, fetchSettings, updateSettings } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings().finally(() => setIsLoading(false));
  }, [fetchSettings]);

  const save = async (data: Record<string, string | null>, successMessage: string) => {
    try {
      await updateSettings(data);
      toast.success(successMessage);
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo</CardTitle>
          <CardDescription>
            Shown in the navbar and footer. Upload a light-background version and, optionally, a
            dark-background version so it stays legible when visitors switch themes — otherwise the
            built-in mark (which adapts automatically) is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground">For light backgrounds</p>
              <ImageUpload
                value={settings?.logoUrl || ""}
                onChange={(url) => save({ logoUrl: url || null }, url ? "Logo updated!" : "Logo removed.")}
                alt={settings?.logoAlt || ""}
                onAltChange={(alt) => save({ logoAlt: alt || null }, "Alt text saved.")}
                folder="branding"
                previewClassName="aspect-[3/1]"
                containerClassName="max-w-xs"
                objectFit="contain"
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-foreground">For dark backgrounds</p>
              <ImageUpload
                value={settings?.logoUrlDark || ""}
                onChange={(url) => save({ logoUrlDark: url || null }, url ? "Dark logo updated!" : "Dark logo removed.")}
                alt={settings?.logoAltDark || ""}
                onAltChange={(alt) => save({ logoAltDark: alt || null }, "Alt text saved.")}
                folder="branding"
                previewClassName="aspect-[3/1]"
                containerClassName="max-w-xs"
                objectFit="contain"
              />
            </div>
          </div>

          {/* Contrast preview — proves both variants read clearly before they ship. */}
          <div className="space-y-2 border-t border-border pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex h-20 max-w-xs items-center justify-center rounded-xl border border-border bg-white">
                <Logo src={settings?.logoUrl} alt={settings?.logoAlt} className="h-8 w-auto text-black" />
              </div>
              <div className="flex h-20 max-w-xs items-center justify-center rounded-xl border border-border bg-neutral-950">
                <Logo
                  src={settings?.logoUrlDark || settings?.logoUrl}
                  alt={settings?.logoAltDark || settings?.logoAlt}
                  className="h-8 w-auto text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Favicon</CardTitle>
          <CardDescription>The icon shown in browser tabs and bookmarks. Square images work best.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload
            value={settings?.faviconUrl || ""}
            onChange={(url) => save({ faviconUrl: url || null }, url ? "Favicon updated!" : "Favicon removed.")}
            folder="branding"
            previewClassName="aspect-square"
            containerClassName="max-w-[180px]"
            objectFit="contain"
            hideAlt
          />
        </CardContent>
      </Card>
    </div>
  );
}
