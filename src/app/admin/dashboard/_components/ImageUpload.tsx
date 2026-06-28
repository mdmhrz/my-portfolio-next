'use client';

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const generateAltText = (filename: string): string => {
  return filename
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[-_]/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ImageUpload({ value, onChange, label, folder = "portfolio", alt = "", onAltChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
        return `Invalid file format. Allowed formats: JPG, PNG, GIF, WebP, SVG`;
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 5 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
    }

    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      setUploading(true);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setProgress(percentComplete);
          }
        });

        await new Promise<void>((resolve, reject) => {
          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload cancelled"));
          });

          xhr.open("POST", "/api/admin/upload");
          xhr.send(formData);
        });

        const response = JSON.parse(xhr.responseText);
        if (!response.url) {
          throw new Error(response.error || "Upload failed - no URL returned");
        }

        const generatedAlt = generateAltText(file.name);
        onChange(response.url);

        if (!alt && onAltChange) {
          onAltChange(generatedAlt);
        }

        setProgress(100);
        toast.success("Image uploaded successfully!");
      } catch (err: any) {
        const errorMessage = err.message || "Failed to upload image";
        toast.error(errorMessage);
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

      for (let item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            uploadFile(file);
            return;
          }
        }
      }
    },
    [uploadFile]
  );

  const handleRemoveImage = useCallback(async () => {
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
        throw new Error(data.error || "Failed to delete image");
      }

      onChange("");
      toast.success("Image removed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove image.");
    } finally {
      setDeleting(false);
    }
  }, [value, onChange]);

  const hasImage = Boolean(value);

  return (
    <div className="space-y-3">
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </label>
      )}

      {!hasImage ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer ${
            dragging
              ? "border-accent bg-accent/5"
              : "border-border bg-background hover:border-foreground/20 hover:bg-foreground/2"
          }`}
          tabIndex={0}
        >
          <div className="rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>

          <div className="text-center space-y-1.5">
            <p className="font-semibold text-foreground">
              Drop your files or{" "}
              <span className="text-accent hover:underline">Browse</span>
            </p>
            <p className="text-[13px] text-muted-foreground">
              Paste images directly (Ctrl+V / Cmd+V)
            </p>
            <p className="text-[12px] text-muted-foreground">
              Allowed formats: JPG, PNG, GIF, WebP, SVG
            </p>
            <p className="text-[12px] text-muted-foreground/70">
              Max file size: 5 MB
            </p>
          </div>

          {uploading && (
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {progress}%
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative h-64 w-full overflow-hidden rounded-xl border border-border bg-muted/30">
            <Image
              src={value}
              alt={alt || "Uploaded preview"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {progress}%
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Alt Text (For Accessibility)
            </label>
            <Input
              type="text"
              placeholder="Describe the image for screen readers..."
              value={alt}
              onChange={(e) => onAltChange?.(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground/70">
              Helpful for SEO and accessibility. Be descriptive.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              size="sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Change Image
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleRemoveImage}
              disabled={deleting}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
