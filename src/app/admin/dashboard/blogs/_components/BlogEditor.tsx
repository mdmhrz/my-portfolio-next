'use client';

import '@mdxeditor/editor/style.css';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ImageIcon, Loader2 } from "lucide-react";

import {
  MDXEditorMethods,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  Separator,
  UndoRedo,
  ConditionalContents,
  InsertCodeBlock,
  ChangeCodeMirrorLanguage,
  toolbarPlugin,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  imageDialogState$,
  saveImage$,
  closeImageDialog$,
} from "@mdxeditor/editor";
import { useCellValues, usePublisher } from "@mdxeditor/gurx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator as UISeparator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUpload } from "../../_components/ImageUpload";
import { slugify } from "@/lib/utils";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import type { BlogData } from "@/store/usePortfolioStore";
import { BlogEditorTopbar } from "./BlogEditorTopbar";
import { BlogEditorSidebar, type BlogEditorForm } from "./BlogEditorSidebar";

// ── Custom image insert button ────────────────────────────────────────────────
// Replaces MDXEditor's default InsertImage dialog with our Cloudinary uploader.
// Uses insertMarkdown() to inject ![alt](url) at the current cursor position.
function InlineImageButton({ editorRef }: { editorRef: React.RefObject<MDXEditorMethods | null> }) {
  const [open, setOpen] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedAlt, setUploadedAlt] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualAlt, setManualAlt] = useState('');

  const finalUrl = uploadedUrl || manualUrl;
  const finalAlt = uploadedUrl ? uploadedAlt : manualAlt;

  const reset = () => {
    setUploadedUrl(''); setUploadedAlt('');
    setManualUrl(''); setManualAlt('');
  };

  const handleInsert = () => {
    if (!finalUrl) return;
    editorRef.current?.insertMarkdown(`\n![${finalAlt}](${finalUrl})\n`);
    setOpen(false);
    reset();
  };

  const handleClose = () => { setOpen(false); reset(); };

  return (
    <>
      <button
        type="button"
        title="Insert image"
        aria-label="Insert image"
        onClick={() => setOpen(true)}
        className="rounded p-1.5 hover:bg-accent transition-colors text-foreground/80 hover:text-foreground"
      >
        <ImageIcon className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Upload to Cloudinary or paste an external URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ImageUpload
              label="Upload Image"
              folder="blogs"
              value={uploadedUrl}
              onChange={setUploadedUrl}
              alt={uploadedAlt}
              onAltChange={setUploadedAlt}
            />

            {!uploadedUrl && (
              <>
                <div className="flex items-center gap-3">
                  <UISeparator className="flex-1" />
                  <span className="text-xs text-muted-foreground font-medium shrink-0">
                    or external URL
                  </span>
                  <UISeparator className="flex-1" />
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Image URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Alt Text</Label>
                    <Input
                      type="text"
                      placeholder="Describe the image for accessibility…"
                      value={manualAlt}
                      onChange={(e) => setManualAlt(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleInsert} disabled={!finalUrl}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Extract Cloudinary image URLs from markdown ───────────────────────────────
const CLOUDINARY_RE = /!\[[^\]]*\]\((https?:\/\/[^)]*cloudinary\.com[^)]*)\)/g;
function extractCloudinaryUrls(md: string): Set<string> {
  const urls = new Set<string>();
  CLOUDINARY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CLOUDINARY_RE.exec(md)) !== null) urls.add(m[1]);
  return urls;
}

// ── Custom settings dialog for images already in the editor ──────────────────
// Rendered inside MDXEditor's tree (via imagePlugin's ImageDialog prop), giving
// access to MDXEditor hooks. Replaces the broken default gear-icon modal.
function CustomImageDialog() {
  const [dialogState] = useCellValues(imageDialogState$);
  const saveImage = usePublisher(saveImage$);
  const closeImageDialog = usePublisher(closeImageDialog$);

  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedAlt, setUploadedAlt] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualAlt, setManualAlt] = useState('');
  const [deleting, setDeleting] = useState(false);
  const prevStateRef = useRef(dialogState);

  const isEditing = dialogState?.type === 'editing';

  // Populate fields when the dialog opens for a specific image
  useEffect(() => {
    const wasEditing = prevStateRef.current?.type === 'editing';
    if (isEditing && !wasEditing) {
      const src = (dialogState as any).initialValues?.src ?? '';
      const altText = (dialogState as any).initialValues?.altText ?? '';
      if (src.includes('cloudinary.com')) {
        setUploadedUrl(src); setUploadedAlt(altText);
        setManualUrl(''); setManualAlt('');
      } else {
        setUploadedUrl(''); setUploadedAlt('');
        setManualUrl(src); setManualAlt(altText);
      }
    }
    if (!isEditing) {
      setUploadedUrl(''); setUploadedAlt('');
      setManualUrl(''); setManualAlt('');
    }
    prevStateRef.current = dialogState;
  }, [dialogState, isEditing]);

  const finalUrl = uploadedUrl || manualUrl;
  const finalAlt = uploadedUrl ? uploadedAlt : manualAlt;
  const initialSrc = isEditing ? ((dialogState as any).initialValues?.src ?? '') : '';

  const handleSave = async () => {
    if (!finalUrl) return;
    // Delete old Cloudinary image if URL changed
    if (initialSrc.includes('cloudinary.com') && finalUrl !== initialSrc) {
      setDeleting(true);
      try {
        await fetch('/api/admin/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: initialSrc }),
        });
      } catch { /* non-blocking */ } finally {
        setDeleting(false);
      }
    }
    saveImage({ src: finalUrl, altText: finalAlt, title: '' });
    closeImageDialog(undefined as any);
  };

  const handleClose = () => closeImageDialog(undefined as any);

  return (
    <Dialog open={isEditing} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>Replace the image or update its alt text.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            label="Image"
            folder="blogs"
            value={uploadedUrl}
            onChange={setUploadedUrl}
            alt={uploadedAlt}
            onAltChange={setUploadedAlt}
          />

          {!uploadedUrl && (
            <>
              <div className="flex items-center gap-3">
                <UISeparator className="flex-1" />
                <span className="text-xs text-muted-foreground font-medium shrink-0">or external URL</span>
                <UISeparator className="flex-1" />
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Image URL</Label>
                  <Input type="url" placeholder="https://example.com/image.jpg" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Alt Text</Label>
                  <Input type="text" placeholder="Describe the image…" value={manualAlt} onChange={(e) => setManualAlt(e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={deleting}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={!finalUrl || deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Dynamic import to avoid SSR (MDXEditor uses browser APIs)
const MDXEditor = dynamic(
  () => import("@mdxeditor/editor").then((m) => m.MDXEditor),
  { ssr: false }
);

const CODE_BLOCK_LANGUAGES: Record<string, string> = {
  txt: 'Plain text',
  js: 'JavaScript',
  ts: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TypeScript (React)',
  css: 'CSS',
  html: 'HTML',
  json: 'JSON',
  bash: 'Bash',
  sh: 'Shell',
  go: 'Go',
  py: 'Python',
  sql: 'SQL',
  yaml: 'YAML',
  md: 'Markdown',
  dockerfile: 'Dockerfile',
  prisma: 'Prisma',
};

function computeStats(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  return { words, readingTime };
}

interface BlogEditorProps {
  initialData?: BlogData;
}

export function BlogEditor({ initialData }: BlogEditorProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { createBlog, updateBlog } = usePortfolioStore();
  const editorRef = useRef<MDXEditorMethods>(null);

  const isNew = !initialData;
  const hasMounted = useRef(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const prevContentRef = useRef(initialData?.content ?? '');
  const [blogId, setBlogId] = useState<string | undefined>(initialData?.id);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [content, setContent] = useState(initialData?.content ?? '');

  const [form, setForm] = useState<BlogEditorForm>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    excerpt: initialData?.excerpt ?? '',
    coverImage: initialData?.coverImage ?? '',
    coverImageAlt: initialData?.coverImageAlt ?? '',
    category: initialData?.category ?? '',
    tags: initialData?.tags ?? [],
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? false,
    metaTitle: initialData?.metaTitle ?? '',
    metaDescription: initialData?.metaDescription ?? '',
  });

  const { words, readingTime } = useMemo(() => computeStats(content), [content]);

  // Auto-generate slug from title until user manually edits it
  const handleFormChange = useCallback((patch: Partial<BlogEditorForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if ('title' in patch && !slugTouched) {
        next.slug = slugify(patch.title ?? '');
      }
      if ('slug' in patch) {
        setSlugTouched(true);
      }
      return next;
    });
    if (!isNew) setSaveStatus('idle');
  }, [slugTouched, isNew]);

  const buildPayload = useCallback(() => ({
    ...form,
    content,
    coverImage: form.coverImage || null,
    coverImageAlt: form.coverImageAlt || null,
    category: form.category || null,
    metaTitle: form.metaTitle || null,
    metaDescription: form.metaDescription || null,
  }), [form, content]);

  const doSave = useCallback(async (overrides?: Partial<BlogEditorForm>) => {
    const payload = { ...buildPayload(), ...overrides };
    if (!payload.title.trim()) {
      toast.error('Title is required before saving.');
      return;
    }
    setSaving(true);
    setSaveStatus('saving');
    try {
      if (blogId) {
        await updateBlog(blogId, payload);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        // Create mode — navigate to edit page after first save
        await createBlog(payload as any);
        // Get the newly created blog from the store
        const store = usePortfolioStore.getState();
        const newest = store.blogs[0];
        if (newest?.id) {
          setBlogId(newest.id);
          router.replace(`/admin/dashboard/blogs/${newest.id}/edit`);
          toast.success('Draft saved!');
        }
      }
    } catch {
      setSaveStatus('error');
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [blogId, buildPayload, createBlog, updateBlog, router]);

  // Auto-save: debounce 3s, only on existing posts
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isNew || !blogId) return;
    if (saveStatus === 'saving') return;
    autoSaveTimer.current && clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      doSave();
    }, 3000);
    return () => {
      autoSaveTimer.current && clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, form, blogId]);

  // Ctrl/Cmd+S manual save
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        doSave();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [doSave]);

  // Mark mounted — prevents MDXEditor's initial onChange from firing before mount
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Auto-resize title textarea (cross-browser, no fieldSizing dependency)
  const autoResizeTitle = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => {
    autoResizeTitle(titleRef.current);
  // Only run on initial mount to size for existing content
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePublish = () => doSave({ published: !form.published });
  const handleSaveDraft = () => doSave();

  const isDark = resolvedTheme === 'dark';

  const plugins = useMemo(() => [
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <Separator />
          <BlockTypeSelect />
          <Separator />
          <BoldItalicUnderlineToggles />
          <CodeToggle />
          <Separator />
          <ListsToggle />
          <Separator />
          <CreateLink />
          <InlineImageButton editorRef={editorRef} />
          <InsertTable />
          <InsertThematicBreak />
          <Separator />
          <ConditionalContents
            options={[
              {
                when: (editor) => editor?.editorType === 'codeblock',
                contents: () => <ChangeCodeMirrorLanguage />,
              },
              {
                fallback: () => <InsertCodeBlock />,
              },
            ]}
          />
        </>
      ),
    }),
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    thematicBreakPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ ImageDialog: CustomImageDialog }),
    tablePlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'ts' }),
    codeMirrorPlugin({ codeBlockLanguages: CODE_BLOCK_LANGUAGES }),
    markdownShortcutPlugin(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  return (
    <div className="flex h-full flex-col bg-background">
      <BlogEditorTopbar
        saveStatus={saveStatus}
        published={form.published}
        wordCount={words}
        readingTime={readingTime}
        saving={saving}
        isNew={isNew}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      {/*
       * Middle row: editor column + sidebar.
       * overflow-hidden here bounds the row to its flex height so both
       * children can independently scroll with overflow-y-auto.
       */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Editor column ──
         * Block layout (no flex-col) so content grows naturally.
         * overflow-y-auto here IS the scroll container MDXEditor's
         * sticky toolbar references — the toolbar stays visible while typing.
         */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden">

          {/* Title — big, auto-expanding textarea */}
          <div className="border-b border-border px-8 py-6">
            <textarea
              ref={titleRef}
              value={form.title}
              onChange={(e) => {
                handleFormChange({ title: e.target.value });
                autoResizeTitle(e.target);
              }}
              placeholder="Post title…"
              rows={1}
              className="w-full resize-none overflow-hidden bg-transparent text-3xl font-medium tracking-tight text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>

          {/* MDXEditor — dark classes go on the component, not a wrapper */}
          <MDXEditor
            ref={editorRef}
            markdown={content}
            onChange={(md) => {
              if (!hasMounted.current) return;
              // Auto-delete Cloudinary images removed via the editor trash icon
              const prevUrls = extractCloudinaryUrls(prevContentRef.current);
              const nextUrls = extractCloudinaryUrls(md);
              prevUrls.forEach((url) => {
                if (!nextUrls.has(url)) {
                  fetch('/api/admin/delete-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url }),
                  }).catch(() => {});
                }
              });
              prevContentRef.current = md;
              setContent(md);
              if (!isNew) setSaveStatus('idle');
            }}
            plugins={plugins}
            contentEditableClassName="prose prose-neutral dark:prose-invert max-w-none min-h-[75vh] !px-10 !py-8 focus:outline-none text-base leading-relaxed"
            className={isDark ? 'dark-theme dark-editor' : undefined}
          />
        </div>

        {/* ── Sidebar ── */}
        <BlogEditorSidebar
          form={form}
          wordCount={words}
          readingTime={readingTime}
          onChange={handleFormChange}
        />
      </div>
    </div>
  );
}
