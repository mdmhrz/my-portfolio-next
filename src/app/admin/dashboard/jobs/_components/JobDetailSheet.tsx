'use client';

import { useState } from 'react';
import { ExternalLink, Pencil, CalendarPlus, CalendarX } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolioStore, JobApplicationData } from '@/store/usePortfolioStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FormDialog } from '@/components/admin/FormDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  JOB_STATUSES,
  JOB_STATUS_COLORS,
  JOB_SOURCES,
  JOB_APPLICATION_TYPES,
  JOB_WORK_MODES,
  labelFor,
  formatSalary,
  formatDate,
} from './job-constants';
import { guessInterviewDateTime } from './job-date-guess';

interface JobDetailSheetProps {
  job: JobApplicationData | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (job: JobApplicationData) => void;
  onAddNote: (id: string, note: string) => Promise<void>;
}

function toLocalDateTimeInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function JobDetailSheet({ job, onOpenChange, onEdit, onAddNote }: JobDetailSheetProps) {
  const { addJobToCalendar, removeJobFromCalendar } = usePortfolioStore();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [calTitle, setCalTitle] = useState('');
  const [calStart, setCalStart] = useState('');
  const [calDuration, setCalDuration] = useState('60');
  const [calDescription, setCalDescription] = useState('');
  const [calSaving, setCalSaving] = useState(false);
  const [removingCalendar, setRemovingCalendar] = useState(false);

  if (!job) return null;

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const events = [...(job.events ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const submitNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await onAddNote(job.id, note.trim());
      setNote('');
      toast.success('Note added.');
    } catch {
      toast.error('Failed to add note.');
    } finally {
      setSaving(false);
    }
  };

  const openCalendarDialog = () => {
    const guessSource = [job.notes, ...events.map((e) => e.note)].filter(Boolean).join(' ');
    const guess = guessInterviewDateTime(guessSource) ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
    guess.setMinutes(0, 0, 0);
    setCalTitle(`Interview: ${job.position} at ${job.company}`);
    setCalStart(toLocalDateTimeInputValue(guess));
    setCalDuration('60');
    setCalDescription(job.jobUrl || '');
    setCalendarDialogOpen(true);
  };

  const submitCalendar = async () => {
    if (!calTitle.trim() || !calStart) {
      toast.error('Title and start time are required.');
      return;
    }
    setCalSaving(true);
    try {
      await addJobToCalendar(job.id, {
        title: calTitle.trim(),
        description: calDescription.trim() || undefined,
        startTime: new Date(calStart).toISOString(),
        durationMinutes: Number(calDuration),
      });
      setCalendarDialogOpen(false);
      toast.success('Added to Google Calendar.');
    } catch {
      toast.error('Failed to create calendar event — has Gmail been reconnected with calendar access?');
    } finally {
      setCalSaving(false);
    }
  };

  const removeCalendar = async () => {
    setRemovingCalendar(true);
    try {
      await removeJobFromCalendar(job.id);
      toast.success('Removed from Google Calendar.');
    } catch {
      toast.error('Failed to remove calendar event.');
    } finally {
      setRemovingCalendar(false);
    }
  };

  return (
    <Sheet open={!!job} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{job.position}</SheetTitle>
          <SheetDescription>{job.company}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={JOB_STATUS_COLORS[job.status]}>{labelFor(JOB_STATUSES, job.status)}</Badge>
            <Badge variant="outline">{labelFor(JOB_SOURCES, job.source)}</Badge>
            <Badge variant="outline">{labelFor(JOB_APPLICATION_TYPES, job.applicationType)}</Badge>
            {job.workMode && <Badge variant="outline">{labelFor(JOB_WORK_MODES, job.workMode)}</Badge>}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {job.location && <Detail label="Location" value={job.location} />}
            {salary && <Detail label="Salary" value={salary} />}
            {job.deadline && <Detail label="Deadline" value={formatDate(job.deadline)!} />}
            {job.resumeVersion && <Detail label="Resume" value={job.resumeVersion} />}
            {job.coverLetterVersion && <Detail label="Cover Letter" value={job.coverLetterVersion} />}
          </dl>

          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              View job posting <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          {job.notes && (
            <div>
              <p className="mb-1 text-xs font-semibold text-foreground">Notes</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{job.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit application
            </Button>
            {job.calendarEventLink ? (
              <>
                <a href={job.calendarEventLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> View in Calendar
                  </Button>
                </a>
                <Button variant="ghost" size="sm" onClick={removeCalendar} disabled={removingCalendar}>
                  <CalendarX className="mr-1.5 h-3.5 w-3.5" /> Remove
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={openCalendarDialog}>
                <CalendarPlus className="mr-1.5 h-3.5 w-3.5" /> Add to Calendar
              </Button>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground">Add a note</p>
            <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Followed up, waiting on recruiter…" />
            <Button size="sm" onClick={submitNote} disabled={saving || !note.trim()}>
              {saving ? 'Saving…' : 'Add note'}
            </Button>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold text-foreground">Timeline</p>
            {events.length === 0 ? (
              <p className="text-xs text-muted-foreground">No history yet.</p>
            ) : (
              <ul className="space-y-3">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium text-foreground">
                        {labelFor(JOB_STATUSES, e.status)}
                        <span className="ml-1.5 font-normal text-muted-foreground">
                          · {new Date(e.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </p>
                      {e.note && <p className="mt-0.5 text-muted-foreground">{e.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>

      <FormDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
        title="Add to Calendar"
        description="Creates an event on your connected Google Calendar."
        footer={
          <>
            <Button variant="outline" onClick={() => setCalendarDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitCalendar} disabled={calSaving}>{calSaving ? 'Adding…' : 'Add event'}</Button>
          </>
        }
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-foreground">Title</span>
          <Input value={calTitle} onChange={(e) => setCalTitle(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground">Start</span>
            <Input type="datetime-local" value={calStart} onChange={(e) => setCalStart(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground">Duration</span>
            <Select value={calDuration} onValueChange={setCalDuration}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
                <SelectItem value="90">90 min</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-foreground">Description</span>
          <Textarea rows={3} value={calDescription} onChange={(e) => setCalDescription(e.target.value)} placeholder="Job link, prep notes…" />
        </label>
      </FormDialog>
    </Sheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
