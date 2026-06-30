'use client';

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "../../_components/ImageUpload";

export interface BlogEditorForm {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  coverImageAlt: string;
  category: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
}

interface BlogEditorSidebarProps {
  form: BlogEditorForm;
  wordCount: number;
  readingTime: number;
  onChange: (patch: Partial<BlogEditorForm>) => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs text-muted-foreground font-semibold">
      {children}
    </p>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="mb-1.5 block text-sm text-muted-foreground">
      {children}
    </Label>
  );
}

export function BlogEditorSidebar({ form, wordCount, readingTime, onChange }: BlogEditorSidebarProps) {
  const [tagInput, setTagInput] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/[^a-z0-9-+#.]/g, '').slice(0, 30);
    if (tag && !form.tags.includes(tag)) {
      onChange({ tags: [...form.tags, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onChange({ tags: form.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      onChange({ tags: form.tags.slice(0, -1) });
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 overflow-y-auto border-l border-border bg-background">
      {/* ── Post Details ── */}
      <div className="border-b border-border px-4 py-4">
        <SectionLabel>Post Details</SectionLabel>

        <div className="space-y-3">
          <div>
            <FieldLabel htmlFor="sb-slug">Slug</FieldLabel>
            <Input
              id="sb-slug"
              value={form.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="auto-generated"
              className="h-8 font-mono text-xs"
            />
          </div>

          <div>
            <FieldLabel htmlFor="sb-excerpt">Excerpt</FieldLabel>
            <Textarea
              id="sb-excerpt"
              value={form.excerpt}
              onChange={(e) => onChange({ excerpt: e.target.value })}
              rows={3}
              placeholder="Short description shown in blog listing…"
              className="resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Media ── */}
      <div className="border-b border-border px-4 py-4">
        <SectionLabel>Cover Image</SectionLabel>
        <ImageUpload
          label=""
          folder="blogs"
          value={form.coverImage}
          onChange={(url) => onChange({ coverImage: url })}
          alt={form.coverImageAlt}
          onAltChange={(alt) => onChange({ coverImageAlt: alt })}
        />
      </div>

      {/* ── Taxonomy ── */}
      <div className="border-b border-border px-4 py-4">
        <SectionLabel>Taxonomy</SectionLabel>

        <div className="space-y-3">
          <div>
            <FieldLabel htmlFor="sb-category">Category</FieldLabel>
            <Input
              id="sb-category"
              value={form.category}
              onChange={(e) => onChange({ category: e.target.value })}
              placeholder="Next.js, DevOps, Career…"
              className="h-8 text-sm"
            />
          </div>

          <div>
            <FieldLabel>Tags</FieldLabel>
            <div className="min-h-[36px] rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
              <div className="flex flex-wrap gap-1">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary dark:text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 cursor-pointer opacity-60 hover:opacity-100"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder={form.tags.length === 0 ? 'Add tags… (Enter or comma)' : ''}
                  className="min-w-[80px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Press Enter or comma to add</p>
          </div>
        </div>
      </div>

      {/* ── SEO ── */}
      <div className="border-b border-border px-4 py-4">
        <SectionLabel>SEO Override</SectionLabel>

        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel htmlFor="sb-meta-title">Meta Title</FieldLabel>
              <span className={`text-xs ${form.metaTitle.length > 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {form.metaTitle.length}/60
              </span>
            </div>
            <Input
              id="sb-meta-title"
              value={form.metaTitle}
              onChange={(e) => onChange({ metaTitle: e.target.value })}
              placeholder="Defaults to post title"
              className="h-8 text-sm"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <FieldLabel htmlFor="sb-meta-desc">Meta Description</FieldLabel>
              <span className={`text-[10px] font-mono ${form.metaDescription.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {form.metaDescription.length}/160
              </span>
            </div>
            <Textarea
              id="sb-meta-desc"
              value={form.metaDescription}
              onChange={(e) => onChange({ metaDescription: e.target.value })}
              rows={3}
              placeholder="Defaults to excerpt"
              className="resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="border-b border-border px-4 py-4">
        <SectionLabel>Settings</SectionLabel>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Published</p>
              <p className="text-xs text-muted-foreground">Visible on /blogs</p>
            </div>
            <Switch
              checked={form.published}
              onCheckedChange={(v) => onChange({ published: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Featured</p>
              <p className="text-xs text-muted-foreground">Pinned at top of blog list</p>
            </div>
            <Switch
              checked={form.featured}
              onCheckedChange={(v) => onChange({ featured: v })}
            />
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-4 py-4">
        <SectionLabel>Stats</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Words', value: wordCount.toLocaleString() },
            { label: 'Read time', value: `${readingTime} min` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
              <p className="text-base font-semibold text-foreground">{value}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
