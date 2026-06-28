'use client';

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  alt?: string;
  onAltChange?: (alt: string) => void;
}

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const generateAltText = (filename: string): string =>
  filename
    .split('.').slice(0, -1).join('.')
    .replace(/[-_]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export function ImageUpload({
  value,
  onChange,
  label,
  folder = "portfolio",
  alt = "",
  onAltChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
        return `Invalid format. Allowed: JPG, PNG, GIF, WebP, SVG`;
      }
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`;
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const err = validateFile(file);
      if (err) { toast.error(err); return; }

      setUploading(true);
      setProgress(0);

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        });

        await new Promise<void>((resolve, reject) => {
          xhr.addEventListener("load", () => xhr.status === 200 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));
          xhr.open("POST", "/api/admin/upload");
          xhr.send(fd);
        });

        const res = JSON.parse(xhr.responseText);
        if (!res.url) throw new Error(res.error || "No URL returned");

        onChange(res.url);
        if (!alt && onAltChange) onAltChange(generateAltText(file.name));
        setProgress(100);
        toast.success("Image uploaded!");
      } catch (e: any) {
        toast.error(e.message || "Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder, onChange, onAltChange, alt]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) { e.preventDefault(); uploadFile(file); return; }
        }
      }
    },
    [uploadFile]
  );

  const handleRemove = useCallback(async () => {
    if (!value) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      onChange("");
      toast.success("Image removed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove image.");
    } finally {
      setDeleting(false);
    }
  }, [value, onChange]);

  const busy = uploading || deleting;

  return (
    <div className="space-y-3">
      {label && (
        <Label className="text-xs font-semibold">{label}</Label>
      )}

      {/* Hidden file input — shared between both states */}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
          e.target.value = "";
        }}
      />

      {!value ? (
        /* ── Drop zone ─────────────────────────────────────────── */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => !uploading && inputRef.current?.click()}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-all duration-200 select-none outline-none",
            dragging
              ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.005]"
              : uploading
              ? "border-border bg-muted/20 cursor-wait"
              : "border-border bg-muted/20 hover:border-foreground/30 hover:bg-muted/30 cursor-pointer"
          )}
        >
          {uploading ? (
            /* Upload in progress */
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-muted-foreground animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Uploading… {progress}%</p>
                <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Idle drop zone */
            <>
              <div className={cn(
                "rounded-full p-4 transition-colors",
                dragging ? "bg-primary/10" : "bg-muted"
              )}>
                <Upload className={cn(
                  "h-7 w-7 transition-colors",
                  dragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {dragging ? "Drop to upload" : (
                    <>Drop files or <span className="text-primary underline underline-offset-2">browse</span></>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Paste images directly with Ctrl+V / Cmd+V</p>
                <p className="text-xs text-muted-foreground/70">JPG, PNG, GIF, WebP, SVG · max 5 MB</p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── Image preview ─────────────────────────────────────── */
        <div className="space-y-3">
          <div className="group relative w-full aspect-video overflow-hidden rounded-xl border border-border bg-muted/30">
            <Image
              src={value}
              alt={alt || "Uploaded image"}
              fill
              className="object-cover transition-all duration-300 group-hover:brightness-75"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />

            {/* Busy overlay — shown while uploading replacement or deleting */}
            {busy && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                {uploading && (
                  <>
                    <p className="text-white text-xs font-medium">{progress}%</p>
                    <div className="w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Hover action overlay */}
            {!busy && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shadow-md"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="shadow-md"
                  onClick={handleRemove}
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            )}

            {/* Image icon badge — top-right */}
            {!busy && (
              <div className="absolute top-2 right-2 rounded-md bg-black/40 p-1.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Alt text field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alt Text</Label>
            <Input
              type="text"
              placeholder="Describe the image for screen readers and SEO…"
              value={alt}
              onChange={(e) => onAltChange?.(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground/70">
              Good alt text improves accessibility and search ranking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
