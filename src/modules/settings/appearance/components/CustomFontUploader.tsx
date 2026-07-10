"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CustomFontUploaderProps {
  onUploadFont: (fontName: string, fontUrl: string, weights: string[]) => void;
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
      const validTypes = [
        "font/woff2",
        "font/woff",
        "font/ttf",
        "font/otf",
        "application/x-font-woff2",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid font format. Use .woff2, .woff, .ttf, or .otf");
        return;
      }
      setSelectedFile(file);
      setFontName(file.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fontName) {
      toast.error("Select a font file and enter a name");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("font", selectedFile);
      formData.append("fontName", fontName);
      formData.append("weights", JSON.stringify(["400", "700"]));

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onUploadFont(fontName, data.fontUrl, ["400", "700"]);
          toast.success("Font uploaded successfully!");
          setSelectedFile(null);
          setFontName("");
          setProgress(0);
        } else {
          toast.error("Upload failed");
        }
      });

      xhr.addEventListener("error", () => {
        toast.error("Upload failed");
      });

      xhr.open("POST", "/api/admin/appearance/fonts/upload");
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload font");
    } finally {
      setUploading(false);
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
          <p className="text-xs text-muted-foreground mt-1">
            Supported: .woff2, .woff, .ttf, .otf
          </p>
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
              <p className="text-xs text-muted-foreground">
                Uploading... {Math.round(progress)}%
              </p>
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Font"}
          </Button>
        </div>
      )}
    </div>
  );
}
