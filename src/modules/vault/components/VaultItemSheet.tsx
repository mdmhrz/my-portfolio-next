'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Eye, EyeOff, Copy, ShieldCheck, FileText, History as HistoryIcon, Paperclip, Download, Loader2, UploadCloud, Check } from 'lucide-react';
import { usePortfolioStore, VaultItemData, VaultFieldData, VaultAuditLogData, VaultHistoryData, VaultAttachmentData } from '@/store/usePortfolioStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FormDialog } from '@/components/admin/FormDialog';
import { formatDate, formatFileSize, prettyJson, CategoryIcon } from './vault-constants';
import { useVaultReveal, useVaultRestore, useVaultAttachmentReveal } from './useVaultReauth';

interface VaultItemSheetProps {
  item: VaultItemData | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: VaultItemData) => void;
  onDelete: (item: VaultItemData) => void;
  // Restoring changes the item's fields server-side — the parent's `detailItem`
  // state doesn't auto-refresh from the store, so this hands the updated item back.
  onRestored: (item: VaultItemData) => void;
}

const MULTILINE_TYPES = ['textarea', 'json', 'env'];
const CLIPBOARD_CLEAR_MS = 30000;

const AUDIT_ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  opened: 'Revealed values',
  copied: 'Copied a value',
  updated: 'Updated',
  deleted: 'Deleted',
  restored: 'Restored a previous version',
};

// After a copy, best-effort clear the clipboard 30s later — but only if it
// still holds exactly what we put there, so we don't clobber something the
// user copied from elsewhere in the meantime. Clipboard read can fail/be
// denied by the browser; that's fine, it just means no auto-clear happens.
function scheduleClipboardClear(copiedValue: string) {
  setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === copiedValue) await navigator.clipboard.writeText('');
    } catch {
      // no-op — read/write permission denied or unsupported
    }
  }, CLIPBOARD_CLEAR_MS);
}

// Parent remounts this component (via `key={item?.id}`) whenever it points at
// a different item, so plain useState is enough to reset revealed/visible —
// no effect needed, and plaintext never persists past the item it belongs to.
export function VaultItemSheet({ item, onOpenChange, onEdit, onDelete, onRestored }: VaultItemSheetProps) {
  const { fetchVaultAuditLog, fetchVaultHistory, fetchVaultAttachments, uploadVaultAttachment, deleteVaultAttachment, backupFileToDrive, logVaultCopy } = usePortfolioStore();
  const { reveal, PasswordPrompt } = useVaultReveal();
  const { restore, PasswordPrompt: RestorePasswordPrompt } = useVaultRestore();
  const { reveal: revealAttachment, PasswordPrompt: AttachmentPasswordPrompt } = useVaultAttachmentReveal();
  const [revealed, setRevealed] = useState<VaultFieldData[] | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [auditLog, setAuditLog] = useState<VaultAuditLogData[] | null>(null);
  const [history, setHistory] = useState<VaultHistoryData[] | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VaultHistoryData | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [attachments, setAttachments] = useState<VaultAttachmentData[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [backingUpId, setBackingUpId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks must run unconditionally, so the data fetches live above the `if
  // (!item)` guard below — it's a no-op render (Sheet closed) either way.
  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    Promise.all([fetchVaultAuditLog(item.id), fetchVaultHistory(item.id), fetchVaultAttachments(item.id)]).then(
      ([logs, hist, files]) => {
        if (!cancelled) {
          setAuditLog(logs);
          setHistory(hist);
          setAttachments(files);
        }
      }
    );
    return () => { cancelled = true; };
  }, [item, fetchVaultAuditLog, fetchVaultHistory, fetchVaultAttachments]);

  if (!item) return null;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadVaultAttachment(item.id, file);
      setAttachments((prev) => [asset, ...(prev ?? [])]);
      toast.success('Attachment uploaded.');
    } catch {
      toast.error('Failed to upload attachment.');
    } finally {
      setUploading(false);
    }
  };

  const downloadAttachment = async (attachment: VaultAttachmentData) => {
    setDownloadingId(attachment.id);
    try {
      const result = await revealAttachment(item.id, attachment.id);
      if (result) window.open(result.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingId(null);
    }
  };

  const removeAttachment = async (attachment: VaultAttachmentData) => {
    try {
      await deleteVaultAttachment(attachment.id);
      setAttachments((prev) => (prev ?? []).filter((a) => a.id !== attachment.id));
      toast.success('Attachment deleted.');
    } catch {
      toast.error('Failed to delete attachment.');
    }
  };

  const backupAttachment = async (attachment: VaultAttachmentData) => {
    setBackingUpId(attachment.id);
    try {
      const mirror = await backupFileToDrive(attachment.id);
      setAttachments((prev) => [...(prev ?? []), mirror]);
      toast.success('Backed up to Drive.');
    } catch {
      toast.error('Failed to back up to Drive.');
    } finally {
      setBackingUpId(null);
    }
  };

  // Only R2-original rows are ever listed/interactive — a Drive-mirror row's
  // download would need the reauth gate carried into the generic download
  // proxy first (see storage-integration-plan.md Phase 3's "known gap"), so
  // for now a mirror only ever shows up as a badge on its R2 source, never
  // as its own list item.
  const r2Attachments = (attachments ?? []).filter((a) => a.provider === 'r2');
  const mirroredSourceIds = new Set(
    (attachments ?? []).filter((a) => a.provider === 'drive' && a.mirrorOfId).map((a) => a.mirrorOfId)
  );

  const doReveal = async () => {
    setRevealing(true);
    try {
      const fields = await reveal(item.id);
      if (fields) setRevealed(fields);
    } finally {
      setRevealing(false);
    }
  };

  const toggleVisible = (fieldId?: string) => {
    if (!fieldId) return;
    setVisible((v) => ({ ...v, [fieldId]: !v[fieldId] }));
  };

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
      scheduleClipboardClear(value);
      logVaultCopy(item.id, label);
    } catch {
      toast.error('Clipboard write failed.');
    }
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setRestoring(true);
    try {
      const updated = await restore(item.id, restoreTarget.id);
      if (updated) {
        onRestored(updated);
        // Values just changed server-side — force a fresh reveal rather than
        // show stale plaintext under the old labels/order.
        setRevealed(null);
        setVisible({});
        setRestoreTarget(null);
        toast.success('Version restored.');
        const [logs, hist] = await Promise.all([fetchVaultAuditLog(item.id), fetchVaultHistory(item.id)]);
        setAuditLog(logs);
        setHistory(hist);
      }
    } finally {
      setRestoring(false);
    }
  };

  // Bundle detection is structural, not a stored flag — an item counts as an
  // ".env" if every one of its fields happens to be type "env".
  const isEnvBundle = !!revealed && revealed.length > 0 && revealed.every((f) => f.type === 'env');

  const copyEnvBundle = async () => {
    if (!revealed) return;
    const blob = revealed.map((f) => `${f.label}=${f.value}`).join('\n');
    try {
      await navigator.clipboard.writeText(blob);
      toast.success('.env copied.');
      scheduleClipboardClear(blob);
      logVaultCopy(item.id, '.env bundle');
    } catch {
      toast.error('Clipboard write failed.');
    }
  };

  const displayFields = revealed ?? item.fields;

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CategoryIcon category={item.category} className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate">{item.title}</SheetTitle>
              <SheetDescription>{item.category}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{item.category}</Badge>
            {item.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            {item.expiresAt && <Badge variant="outline">Expires {formatDate(item.expiresAt)}</Badge>}
          </div>

          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(item)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5 text-destructive" /> Delete
            </Button>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Fields</p>
              <div className="flex items-center gap-2">
                {isEnvBundle && (
                  <Button variant="outline" size="sm" onClick={copyEnvBundle}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" /> Copy .env
                  </Button>
                )}
                {!revealed && (
                  <Button size="sm" onClick={doReveal} disabled={revealing}>
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    {revealing ? 'Revealing…' : 'Reveal values'}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {displayFields.map((field) => {
                const isRevealed = !!revealed && field.value !== undefined;
                const shown = isRevealed && visible[field.id ?? field.label];
                return (
                  <div key={field.id ?? field.label} className="rounded-lg border border-border p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{field.label}</span>
                      {isRevealed && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => toggleVisible(field.id ?? field.label)}
                          >
                            {shown ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => copyValue(field.label, field.type === 'json' ? prettyJson(field.value!) : field.value!)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {!isRevealed ? (
                      <p className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••</p>
                    ) : shown ? (
                      MULTILINE_TYPES.includes(field.type) ? (
                        <pre className="whitespace-pre-wrap break-all rounded-md bg-muted/40 p-2 font-mono text-xs text-foreground">
                          {field.type === 'json' ? prettyJson(field.value!) : field.value}
                        </pre>
                      ) : (
                        <p className="break-all font-mono text-sm text-foreground">{field.value}</p>
                      )
                    ) : (
                      <p className="font-mono text-sm tracking-widest text-muted-foreground">••••••••••••</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground">Attachments</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-1.5 h-3.5 w-3.5" />}
                {uploading ? 'Uploading…' : 'Add file'}
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
            </div>

            {!attachments ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-7 w-16 shrink-0 rounded-md" />
                  </div>
                ))}
              </div>
            ) : r2Attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No attachments yet.</p>
            ) : (
              <ul className="space-y-2">
                {r2Attachments.map((attachment) => {
                  const backedUp = mirroredSourceIds.has(attachment.id);
                  return (
                    <li key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-xs">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{attachment.name}</p>
                        <p className="text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {backedUp ? (
                          <Badge variant="outline" className="gap-1">
                            <Check className="h-3 w-3" /> Backed up to Drive
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Back up to Drive"
                            onClick={() => backupAttachment(attachment)}
                            disabled={backingUpId === attachment.id}
                          >
                            {backingUpId === attachment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => downloadAttachment(attachment)}
                          disabled={downloadingId === attachment.id}
                        >
                          {downloadingId === attachment.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeAttachment(attachment)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground">Activity</p>
            {!auditLog ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    <Skeleton className="h-3 w-3/5" />
                  </div>
                ))}
              </div>
            ) : auditLog.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-3">
                {auditLog.map((log) => (
                  <li key={log.id} className="flex gap-3 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                        {log.fieldLabel && <span className="font-normal text-muted-foreground"> — {log.fieldLabel}</span>}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          · {new Date(log.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground">History</p>
            {!history ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                    <Skeleton className="h-7 w-16 shrink-0 rounded-md" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-muted-foreground">No previous versions yet — edits that change fields will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{formatDate(h.changedAt)}</p>
                      <p className="truncate text-muted-foreground">{h.fieldLabels.join(', ') || 'No fields'}</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => setRestoreTarget(h)}>
                      <HistoryIcon className="mr-1.5 h-3.5 w-3.5" /> Restore
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>

      {restoreTarget && (
        <FormDialog
          open={!!restoreTarget}
          onOpenChange={(open) => { if (!open) setRestoreTarget(null); }}
          title="Restore this version?"
          description={`Replaces the current values with the version from ${formatDate(restoreTarget.changedAt)}. The current values are saved to history first, so this can be undone too.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setRestoreTarget(null)}>Cancel</Button>
              <Button onClick={confirmRestore} disabled={restoring}>{restoring ? 'Restoring…' : 'Restore'}</Button>
            </>
          }
        >
          <p className="text-xs text-muted-foreground">
            Fields in this version: {restoreTarget.fieldLabels.join(', ') || 'None'}
          </p>
        </FormDialog>
      )}

      {PasswordPrompt}
      {RestorePasswordPrompt}
      {AttachmentPasswordPrompt}
    </Sheet>
  );
}
