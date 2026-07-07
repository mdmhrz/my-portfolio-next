'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Eye, EyeOff, Copy, ShieldCheck, FileText, History as HistoryIcon } from 'lucide-react';
import { usePortfolioStore, VaultItemData, VaultFieldData, VaultAuditLogData, VaultHistoryData } from '@/store/usePortfolioStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormDialog } from '@/components/admin/FormDialog';
import { formatDate, prettyJson } from './vault-constants';
import { useVaultReveal, useVaultRestore } from './useVaultReauth';

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
  const { fetchVaultAuditLog, fetchVaultHistory, logVaultCopy } = usePortfolioStore();
  const { reveal, PasswordPrompt } = useVaultReveal();
  const { restore, PasswordPrompt: RestorePasswordPrompt } = useVaultRestore();
  const [revealed, setRevealed] = useState<VaultFieldData[] | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [auditLog, setAuditLog] = useState<VaultAuditLogData[] | null>(null);
  const [history, setHistory] = useState<VaultHistoryData[] | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VaultHistoryData | null>(null);
  const [restoring, setRestoring] = useState(false);

  // Hooks must run unconditionally, so the data fetches live above the `if
  // (!item)` guard below — it's a no-op render (Sheet closed) either way.
  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    Promise.all([fetchVaultAuditLog(item.id), fetchVaultHistory(item.id)]).then(([logs, hist]) => {
      if (!cancelled) {
        setAuditLog(logs);
        setHistory(hist);
      }
    });
    return () => { cancelled = true; };
  }, [item, fetchVaultAuditLog, fetchVaultHistory]);

  if (!item) return null;

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
          <SheetTitle>{item.title}</SheetTitle>
          <SheetDescription>{item.category}</SheetDescription>
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
            <p className="text-xs font-semibold text-foreground">Activity</p>
            {!auditLog ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
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
              <p className="text-xs text-muted-foreground">Loading…</p>
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
    </Sheet>
  );
}
