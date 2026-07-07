'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { usePortfolioStore, VaultFieldData, VaultItemData } from '@/store/usePortfolioStore';
import { FormDialog } from '@/components/admin/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ReauthResult<T> {
  success: boolean;
  requiresPassword?: boolean;
  error?: string;
  data?: T;
}

// Shared "try the action without a password, prompt for one only if the
// server says it's needed, retry" flow — reveal and restore are both exactly
// this sensitive (restore overwrites the live secret), so they share one
// password-prompt dialog instead of each building their own.
function useVaultReauthFlow<T>() {
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Refs, not state — `attemptWith` must see these set immediately, not after
  // the next render.
  const resolverRef = useRef<((value: T | null) => void) | null>(null);
  const actionRef = useRef<((password?: string) => Promise<ReauthResult<T>>) | null>(null);

  const settle = (value: T | null) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
  };

  const attemptWith = async (pwd?: string) => {
    if (!actionRef.current) return;
    const result = await actionRef.current(pwd);
    if (result.success && result.data !== undefined) {
      setPromptOpen(false);
      setPassword('');
      setPromptError(null);
      settle(result.data);
      return;
    }
    if (result.requiresPassword) {
      setPromptError(result.error ?? null);
      setPromptOpen(true);
      return;
    }
    toast.error(result.error || 'Action failed.');
    settle(null);
  };

  const run = (action: (password?: string) => Promise<ReauthResult<T>>): Promise<T | null> => {
    actionRef.current = action;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      attemptWith();
    });
  };

  const submitPassword = async () => {
    if (!password) return;
    setSubmitting(true);
    try {
      await attemptWith(password);
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => {
    settle(null);
    setPromptOpen(false);
    setPassword('');
    setPromptError(null);
  };

  const PasswordPrompt = (
    <FormDialog
      open={promptOpen}
      onOpenChange={(open) => { if (!open) cancel(); }}
      title="Confirm your password"
      description="Re-enter your admin password to continue."
      footer={
        <>
          <Button variant="outline" onClick={cancel}>Cancel</Button>
          <Button onClick={submitPassword} disabled={submitting || !password}>
            {submitting ? 'Verifying…' : 'Confirm'}
          </Button>
        </>
      }
    >
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-foreground">Password</span>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submitPassword(); }}
          autoFocus
        />
      </label>
      {promptError && <p className="text-xs text-destructive">{promptError}</p>}
    </FormDialog>
  );

  return { run, PasswordPrompt };
}

export function useVaultReveal() {
  const { revealVaultItem } = usePortfolioStore();
  const { run, PasswordPrompt } = useVaultReauthFlow<VaultFieldData[]>();
  const reveal = (id: string) => run((password) => revealVaultItem(id, password));
  return { reveal, PasswordPrompt };
}

export function useVaultRestore() {
  const { restoreVaultItemVersion } = usePortfolioStore();
  const { run, PasswordPrompt } = useVaultReauthFlow<VaultItemData>();
  const restore = (id: string, historyId: string) => run((password) => restoreVaultItemVersion(id, historyId, password));
  return { restore, PasswordPrompt };
}
