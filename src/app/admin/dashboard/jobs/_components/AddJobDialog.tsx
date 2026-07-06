'use client';

import { useState } from 'react';
import { z } from 'zod';
import { JobApplicationData } from '@/store/usePortfolioStore';
import { FormDialog } from '@/components/admin/FormDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/app/admin/dashboard/_components/ImageUpload';
import {
  JOB_STATUSES,
  JOB_SOURCES,
  JOB_APPLICATION_TYPES,
  JOB_WORK_MODES,
} from './job-constants';

const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  source: z.string().min(1, 'Source is required'),
  applicationType: z.string().min(1, 'Application type is required'),
  status: z.string().min(1),
  jobUrl: z.string().optional(),
  companyLogo: z.string().optional(),
  deadline: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  salaryCurrency: z.string().optional(),
  location: z.string().optional(),
  workMode: z.string().optional(),
  resumeVersion: z.string().optional(),
  coverLetterVersion: z.string().optional(),
  notes: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema> & { id?: string };

const emptyForm: JobForm = {
  company: '', position: '', source: 'linkedin', applicationType: 'external_website', status: 'saved',
  jobUrl: '', companyLogo: '', deadline: '', salaryMin: '', salaryMax: '', salaryCurrency: '',
  location: '', workMode: '', resumeVersion: '', coverLetterVersion: '', notes: '',
};

interface AddJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobApplicationData | null;
  resumeVersions: string[];
  coverLetterVersions: string[];
  onSubmit: (id: string | undefined, data: Partial<JobApplicationData>) => Promise<void>;
}

function formFromJob(job?: JobApplicationData | null): JobForm {
  if (!job) return emptyForm;
  return {
    id: job.id,
    company: job.company,
    position: job.position,
    source: job.source,
    applicationType: job.applicationType,
    status: job.status,
    jobUrl: job.jobUrl || '',
    companyLogo: job.companyLogo || '',
    deadline: job.deadline ? job.deadline.slice(0, 10) : '',
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : '',
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : '',
    salaryCurrency: job.salaryCurrency || '',
    location: job.location || '',
    workMode: job.workMode || '',
    resumeVersion: job.resumeVersion || '',
    coverLetterVersion: job.coverLetterVersion || '',
    notes: job.notes || '',
  };
}

export function AddJobDialog({ open, onOpenChange, job, resumeVersions, coverLetterVersions, onSubmit }: AddJobDialogProps) {
  // Parent remounts this component (via `key`) whenever the dialog opens for a
  // different job, so lazy initial state — not an effect — is enough to sync.
  const [form, setForm] = useState<JobForm>(() => formFromJob(job));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const parsed = jobSchema.safeParse(form);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
      setErrors(e);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form.id, {
        ...parsed.data,
        deadline: parsed.data.deadline || null,
        salaryMin: parsed.data.salaryMin ? Number(parsed.data.salaryMin) : null,
        salaryMax: parsed.data.salaryMax ? Number(parsed.data.salaryMax) : null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={job ? 'Edit Application' : 'Add Job'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company *" error={errors.company}>
          <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." />
        </Field>
        <Field label="Position *" error={errors.position}>
          <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Frontend Engineer" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Source *">
          <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {JOB_SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Application Type *">
          <Select value={form.applicationType} onValueChange={(v) => setForm({ ...form, applicationType: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {JOB_APPLICATION_TYPES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {JOB_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Deadline">
          <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </Field>
        <Field label="Work Mode">
          <Select value={form.workMode || undefined} onValueChange={(v) => setForm({ ...form, workMode: v })}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {JOB_WORK_MODES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Salary Min">
          <Input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="60000" />
        </Field>
        <Field label="Salary Max">
          <Input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="90000" />
        </Field>
        <Field label="Currency">
          <Input value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })} placeholder="USD" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location">
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote / Dhaka" />
        </Field>
        <Field label="Job URL">
          <Input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://…" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Resume Version" hint="e.g. Resume v2, Resume ATS">
          <Input
            list="resume-versions"
            value={form.resumeVersion}
            onChange={(e) => setForm({ ...form, resumeVersion: e.target.value })}
            placeholder="Resume v2"
          />
          <datalist id="resume-versions">
            {resumeVersions.map((v) => <option key={v} value={v} />)}
          </datalist>
        </Field>
        <Field label="Cover Letter Version">
          <Input
            list="cover-letter-versions"
            value={form.coverLetterVersion}
            onChange={(e) => setForm({ ...form, coverLetterVersion: e.target.value })}
            placeholder="AI Generated"
          />
          <datalist id="cover-letter-versions">
            {coverLetterVersions.map((v) => <option key={v} value={v} />)}
          </datalist>
        </Field>
      </div>

      <ImageUpload
        label="Company Logo"
        folder="jobs"
        previewClassName="aspect-square max-w-[6rem]"
        objectFit="contain"
        hideAlt
        value={form.companyLogo || ''}
        onChange={(url) => setForm({ ...form, companyLogo: url })}
      />

      <Field label="Notes">
        <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything worth remembering…" />
      </Field>
    </FormDialog>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">
        {label}
        {hint && <span className="ml-1.5 font-normal text-muted-foreground">— {hint}</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
