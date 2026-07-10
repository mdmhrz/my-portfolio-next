'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sun, Moon, ImageIcon, CircleCheck, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { Logo } from "@/components/global/Logo";

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const GUIDELINES = [
  'Use transparent backgrounds for all logos and marks',
  'Keep a minimum safe-zone padding around marks so they aren’t cropped tight',
  'Favicons should be square — 32×32 or 48×48px reads best',
];

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
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Branding</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Customize how your brand is represented across the public site and this dashboard.
          Upload assets that adapt to light and dark themes for a consistent experience.
        </p>
      </div>

      <div className="grid max-w-5xl gap-6 lg:grid-cols-3">
        {/* Logo Variants */}
        <Card className="rounded-xl border border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Logo Variants</CardTitle>
            <CardDescription>
              Upload your brand mark for each theme. SVG recommended for crisp scaling and the smallest
              file size — falls back to the built-in mark when left empty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">For light backgrounds</p>
                  <ThemeBadge icon={Sun} label="Default" />
                </div>
                <BrandAssetUpload
                  value={settings?.logoUrl || ""}
                  onChange={(url) => save({ logoUrl: url || null }, url ? "Logo updated!" : "Logo removed.")}
                  folder="branding"
                  aspectClassName="aspect-[3/2]"
                  bgClassName="bg-white"
                  fallback={<Logo className="h-9 w-auto text-black/25" />}
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">For dark backgrounds</p>
                  <ThemeBadge icon={Moon} label="Night" dark />
                </div>
                <BrandAssetUpload
                  value={settings?.logoUrlDark || ""}
                  onChange={(url) => save({ logoUrlDark: url || null }, url ? "Dark logo updated!" : "Dark logo removed.")}
                  folder="branding"
                  aspectClassName="aspect-[3/2]"
                  bgClassName="bg-neutral-950"
                  fallback={<Logo className="h-9 w-auto text-white/25" />}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favicon + Guidelines */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Favicon</CardTitle>
              <CardDescription>The small icon shown in browser tabs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <BrandAssetUpload
                value={settings?.faviconUrl || ""}
                onChange={(url) => save({ faviconUrl: url || null }, url ? "Favicon updated!" : "Favicon removed.")}
                folder="branding"
                aspectClassName="aspect-square"
                bgClassName="bg-muted/40"
                containerClassName="w-16"
                fallback={<ImageIcon className="h-5 w-5 text-muted-foreground/50" />}
              />

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Branding guidelines</p>
                <ul className="space-y-2">
                  {GUIDELINES.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-xs text-foreground/80">
              <strong className="font-semibold text-foreground">Need help?</strong> Removing an asset here
              deletes the uploaded file too — you can re-upload a replacement any time.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

function ThemeBadge({ icon: Icon, label, dark = false }: { icon: React.ComponentType<{ className?: string }>; label: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        dark ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "border border-border bg-muted text-foreground"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

interface BrandAssetUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  aspectClassName: string;
  bgClassName: string;
  containerClassName?: string;
  fallback: React.ReactNode;
}

// Purpose-built for this page's "big preview + text-link actions" design —
// deliberately not the shared ImageUpload (which is a drag-and-drop dropzone
// with a hover-overlay action pattern used everywhere else in the dashboard).
function BrandAssetUpload({ value, onChange, folder, aspectClassName, bgClassName, containerClassName, fallback }: BrandAssetUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const upload = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FORMATS.includes(file.type) && !(ext && ALLOWED_EXTENSIONS.includes(`.${ext}`))) {
      toast.error('Invalid format. Allowed: JPG, PNG, GIF, WebP, SVG');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  const remove = useCallback(async () => {
    if (!value) return;
    setRemoving(true);
    try {
      const res = await fetch('/api/admin/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      onChange('');
      toast.success('Image removed!');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove image.');
    } finally {
      setRemoving(false);
    }
  }, [value, onChange]);

  const busy = uploading || removing;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = '';
        }}
      />

      <div className={cn("relative flex items-center justify-center overflow-hidden rounded-xl border border-border", aspectClassName, bgClassName)}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-contain p-4" />
        ) : (
          fallback
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-primary hover:underline disabled:opacity-50"
        >
          {value ? 'Change' : 'Upload'}
        </button>
        {value && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-destructive hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
