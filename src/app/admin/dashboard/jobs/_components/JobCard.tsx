'use client';

import { Pencil, Trash2, Eye, Calendar, MapPin } from 'lucide-react';
import { JobApplicationData } from '@/store/usePortfolioStore';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  JOB_STATUSES,
  JOB_STATUS_COLORS,
  JOB_SOURCES,
  JOB_WORK_MODES,
  labelFor,
  formatSalary,
  formatDate,
} from './job-constants';

interface JobCardProps {
  job: JobApplicationData;
  onOpenDetail: (job: JobApplicationData) => void;
  onEdit: (job: JobApplicationData) => void;
  onDelete: (job: JobApplicationData) => void;
  onStatusChange: (job: JobApplicationData, status: string) => void;
}

export function JobCard({ job, onOpenDetail, onEdit, onDelete, onStatusChange }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const deadline = formatDate(job.deadline);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenDetail(job)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-semibold text-muted-foreground">
            {job.companyLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.companyLogo} alt="" className="h-full w-full object-contain" />
            ) : (
              job.company.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{job.position}</p>
            <p className="truncate text-xs text-muted-foreground">{job.company}</p>
          </div>
        </button>
        <RowActionsMenu
          actions={[
            { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => onOpenDetail(job) },
            { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => onEdit(job) },
            { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => onDelete(job), variant: 'destructive' },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="outline">{labelFor(JOB_SOURCES, job.source)}</Badge>
        {job.workMode && <Badge variant="outline">{labelFor(JOB_WORK_MODES, job.workMode)}</Badge>}
      </div>

      {(deadline || salary || job.location) && (
        <div className="space-y-1 text-xs text-muted-foreground">
          {deadline && (
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Deadline {deadline}
            </p>
          )}
          {job.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </p>
          )}
          {salary && <p className="font-medium text-foreground">{salary}</p>}
        </div>
      )}

      <Select value={job.status} onValueChange={(v) => onStatusChange(job, v)}>
        <SelectTrigger className={`w-full ${JOB_STATUS_COLORS[job.status] ?? ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {JOB_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
