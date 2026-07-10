'use client';

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Paperclip,
  Send,
  Loader2,
  X,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export interface ComposerAttachment {
  url: string;
  fileName: string;
  mimeType: string;
  size?: number;
}

interface PendingAttachment extends ComposerAttachment {
  id: string;
  uploading: boolean;
}

interface EmailComposerProps {
  to: string;
  toName?: string;
  editableRecipient?: boolean;
  onToChange?: (value: string) => void;
  subject: string;
  editableSubject?: boolean;
  onSubjectChange?: (value: string) => void;
  onSend: (payload: { bodyHtml: string; attachments: ComposerAttachment[] }) => Promise<void>;
  placeholder?: string;
  sendLabel?: string;
  /** Shorter editor with an internal scroll — for the pinned reply bar. */
  compact?: boolean;
  /** Drop the outer border/rounding so the composer can act as a card footer. */
  bare?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function EmailComposer({
  to,
  editableRecipient,
  onToChange,
  subject,
  editableSubject,
  onSubjectChange,
  onSend,
  placeholder = "Write your reply…",
  sendLabel = "Send",
  compact = false,
  bare = false,
}: EmailComposerProps) {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral dark:prose-invert max-w-none px-4 py-3 focus:outline-none text-sm leading-relaxed",
          compact
            ? "min-h-[84px] max-h-[34vh] overflow-y-auto scrollbar-hidden"
            : "min-h-[160px]"
        ),
      },
    },
  });

  async function uploadFile(file: File): Promise<ComposerAttachment | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/admin/gmail/upload-attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return {
        url: res.data.url,
        fileName: res.data.fileName,
        mimeType: res.data.mimeType,
        size: res.data.size,
      };
    } catch {
      return null;
    }
  }

  async function handleAttachFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newEntries: PendingAttachment[] = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: "",
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      uploading: true,
    }));
    setAttachments((prev) => [...prev, ...newEntries]);

    await Promise.all(
      Array.from(files).map(async (file, i) => {
        const entry = newEntries[i];
        const uploaded = await uploadFile(file);
        setAttachments((prev) =>
          uploaded
            ? prev.map((a) => (a.id === entry.id ? { ...a, ...uploaded, uploading: false } : a))
            : prev.filter((a) => a.id !== entry.id)
        );
        if (!uploaded) toast.error(`Failed to upload ${file.name}`);
      })
    );
  }

  async function handleInsertImage(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editor) return;
    const uploaded = await uploadFile(file);
    if (uploaded) {
      editor.chain().focus().setImage({ src: uploaded.url, alt: uploaded.fileName }).run();
    } else {
      toast.error("Failed to upload image");
    }
  }

  function handleSetLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function handleSend() {
    if (!editor) return;
    const bodyHtml = editor.getHTML();
    if (editor.isEmpty) {
      toast.error("Write a message before sending");
      return;
    }
    if (attachments.some((a) => a.uploading)) {
      toast.error("Wait for attachments to finish uploading");
      return;
    }

    setSending(true);
    try {
      await onSend({
        bodyHtml,
        attachments: attachments.map(({ url, fileName, mimeType, size }) => ({ url, fileName, mimeType, size })),
      });
      editor.commands.setContent("");
      setAttachments([]);
    } catch {
      // onSend is expected to surface its own error toast
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn("bg-card", !bare && "border border-border rounded-xl overflow-hidden")}>
      {(editableRecipient || editableSubject) && (
        <div className="border-b border-border divide-y divide-border/60">
          {editableRecipient && (
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xs text-muted-foreground w-14 shrink-0">To</span>
              <Input
                value={to}
                onChange={(e) => onToChange?.(e.target.value)}
                placeholder="recipient@email.com"
                className="border-0 shadow-none h-7 px-0 focus-visible:ring-0"
              />
            </div>
          )}
          {editableSubject && (
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xs text-muted-foreground w-14 shrink-0">Subject</span>
              <Input
                value={subject}
                onChange={(e) => onSubjectChange?.(e.target.value)}
                placeholder="Subject"
                className="border-0 shadow-none h-7 px-0 focus-visible:ring-0"
              />
            </div>
          )}
        </div>
      )}

      <EditorContent editor={editor} />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 text-xs bg-muted/50 border border-border rounded-full pl-2.5 pr-1.5 py-1"
            >
              {att.uploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <FileIcon className="h-3 w-3 text-muted-foreground" />
              )}
              <span className="max-w-[140px] truncate">{att.fileName}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/10 px-3 py-2">
        <div className="flex items-center gap-0.5">
          <ToolbarButton label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton label="Link" active={editor?.isActive("link")} onClick={handleSetLink}>
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Insert image" onClick={() => imageInputRef.current?.click()}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Attach file" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-3.5 w-3.5" />
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleAttachFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleInsertImage(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <Button size="sm" onClick={handleSend} disabled={sending} className="gap-1.5">
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {sendLabel}
        </Button>
      </div>
    </div>
  );
}
