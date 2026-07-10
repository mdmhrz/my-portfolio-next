'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Link2, Loader2, Copy, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolioStore, FileManagerFileData } from '@/store/usePortfolioStore';

interface ShareDialogProps {
  file: FileManagerFileData | null;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

type ExpiryChoice = '24' | '168' | '720' | 'never';

// Caller must remount this on a new file (key={file.id}) — same "fresh
// instance per target" pattern as RenameDialog, so state doesn't need to
// sync via an effect when the dialog is reused for a different file.
export function ShareDialog({ file, onOpenChange, onChanged }: ShareDialogProps) {
  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent>{file && <ShareDialogBody file={file} onChanged={onChanged} />}</DialogContent>
    </Dialog>
  );
}

// Manages its own share state locally (seeded from `file`, then updated
// directly from each API response) instead of re-deriving from a
// folder-scoped `files` list — that list may not contain this file at all
// when opened from Recent Files, which spans every folder. `onChanged` only
// needs to tell the caller to refresh whatever list is showing the badge.
function ShareDialogBody({ file, onChanged }: { file: FileManagerFileData; onChanged: () => void }) {
  const { createShareLink, revokeShareLink } = usePortfolioStore();
  const [expiry, setExpiry] = useState<ExpiryChoice>('168');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(
    file.shareEnabled && file.shareToken ? `${window.location.origin}/s/${file.shareToken}` : null
  );
  const [shareExpiresAt, setShareExpiresAt] = useState<string | null>(file.shareExpiresAt ?? null);

  const isShared = shareUrl !== null;
  const expiresInHours = expiry === 'never' ? null : Number(expiry);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const result = await createShareLink(file.id, expiresInHours);
      setShareUrl(result.url);
      setShareExpiresAt(result.shareExpiresAt);
      toast.success('Share link created.');
      onChanged();
    } catch {
      toast.error('Failed to create share link.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async () => {
    setSaving(true);
    try {
      await revokeShareLink(file.id);
      setShareUrl(null);
      setShareExpiresAt(null);
      toast.success('Sharing turned off.');
      onChanged();
    } catch {
      toast.error('Failed to stop sharing.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4" /> Share &quot;{file.name}&quot;
        </DialogTitle>
      </DialogHeader>

      {isShared ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input readOnly value={shareUrl ?? ''} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {shareExpiresAt
              ? `Expires ${new Date(shareExpiresAt).toLocaleString()}`
              : 'Never expires — stays public until you turn it off.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Anyone with the link can view this file until it expires or you turn it off.</p>
          <Select value={expiry} onValueChange={(v) => setExpiry(v as ExpiryChoice)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24">Expires in 1 day</SelectItem>
              <SelectItem value="168">Expires in 7 days</SelectItem>
              <SelectItem value="720">Expires in 30 days</SelectItem>
              <SelectItem value="never">Never — keep public until I turn it off</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        {isShared ? (
          <Button variant="outline" onClick={handleRevoke} disabled={saving} className="text-destructive hover:text-destructive">
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <X className="mr-1.5 h-4 w-4" />}
            Stop sharing
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Create link
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
