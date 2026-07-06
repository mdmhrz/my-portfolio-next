'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Link2, X, Mail } from 'lucide-react';
import { usePortfolioStore, JobApplicationData, UnmatchedJobEmailData } from '@/store/usePortfolioStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JOB_STATUSES, JOB_STATUS_COLORS, labelFor } from './job-constants';

interface UnmatchedEmailsPanelProps {
  jobs: JobApplicationData[];
}

export function UnmatchedEmailsPanel({ jobs }: UnmatchedEmailsPanelProps) {
  const {
    unmatchedJobEmails, fetchUnmatchedJobEmails,
    linkUnmatchedJobEmail, dismissUnmatchedJobEmail,
    jobTrackerSettings, fetchJobTrackerSettings, updateJobTrackerSettings,
    syncJobGmail,
  } = usePortfolioStore();

  // null until the user edits it — falls back to the fetched setting so no
  // effect is needed to "sync" local state from the store.
  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  const label = labelDraft ?? jobTrackerSettings?.gmailLabel ?? 'Jobs';
  const [savingLabel, setSavingLabel] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [linkTargets, setLinkTargets] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchUnmatchedJobEmails();
    fetchJobTrackerSettings();
  }, [fetchUnmatchedJobEmails, fetchJobTrackerSettings]);

  const saveLabel = async () => {
    setSavingLabel(true);
    try {
      await updateJobTrackerSettings({ gmailLabel: label });
      toast.success('Gmail label saved.');
    } catch {
      toast.error('Failed to save label.');
    } finally {
      setSavingLabel(false);
    }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const result = await syncJobGmail();
      toast.success(`Scanned ${result.scanned} email(s) — ${result.matched} matched, ${result.unmatched} need linking.`);
    } catch {
      toast.error('Gmail sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const link = async (email: UnmatchedJobEmailData) => {
    const jobId = linkTargets[email.id];
    if (!jobId) {
      toast.error('Pick a job to link this email to.');
      return;
    }
    setBusyId(email.id);
    try {
      await linkUnmatchedJobEmail(email.id, jobId);
      toast.success('Linked and logged.');
    } catch {
      toast.error('Failed to link email.');
    } finally {
      setBusyId(null);
    }
  };

  const dismiss = async (email: UnmatchedJobEmailData) => {
    setBusyId(email.id);
    try {
      await dismissUnmatchedJobEmail(email.id);
    } catch {
      toast.error('Failed to dismiss.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Gmail Sync</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Scans the Gmail label below for job emails and logs status updates automatically.
          </p>
        </div>
        <Button size="sm" onClick={sync} disabled={syncing}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing…' : 'Sync now'}
        </Button>
      </div>

      <div className="flex items-end gap-2">
        <label className="block flex-1 space-y-1.5">
          <span className="text-xs font-medium text-foreground">Gmail label</span>
          <Input value={label} onChange={(e) => setLabelDraft(e.target.value)} placeholder="Jobs" className="max-w-xs" />
        </label>
        <Button size="sm" variant="outline" onClick={saveLabel} disabled={savingLabel}>
          {savingLabel ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {unmatchedJobEmails.length > 0 && (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Mail className="h-3.5 w-3.5" /> Needs linking ({unmatchedJobEmails.length})
          </p>
          <div className="space-y-2">
            {unmatchedJobEmails.map((email) => (
              <div key={email.id} className="space-y-2 rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{email.fromName || email.fromEmail}</p>
                    <p className="truncate text-xs text-muted-foreground">{email.subject || '(no subject)'}</p>
                  </div>
                  <Badge className={JOB_STATUS_COLORS[email.suggestedStatus]}>
                    {labelFor(JOB_STATUSES, email.suggestedStatus)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={linkTargets[email.id] ?? ''} onValueChange={(v) => setLinkTargets({ ...linkTargets, [email.id]: v })}>
                    <SelectTrigger className="h-8 w-full max-w-xs text-xs"><SelectValue placeholder="Link to job…" /></SelectTrigger>
                    <SelectContent>
                      {jobs.map((j) => (
                        <SelectItem key={j.id} value={j.id}>{j.position} · {j.company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => link(email)} disabled={busyId === email.id}>
                    <Link2 className="mr-1.5 h-3.5 w-3.5" /> Link
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dismiss(email)} disabled={busyId === email.id}>
                    <X className="mr-1.5 h-3.5 w-3.5" /> Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
