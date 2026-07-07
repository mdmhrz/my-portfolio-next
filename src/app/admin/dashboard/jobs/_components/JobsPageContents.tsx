'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LayoutGrid, List, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { usePortfolioStore, JobApplicationData } from '@/store/usePortfolioStore';
import { PageHeader } from '@/components/admin/PageHeader';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { DataTable } from '@/components/admin/DataTable';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { AddJobDialog } from './AddJobDialog';
import { KanbanBoard } from './KanbanBoard';
import { JobDetailSheet } from './JobDetailSheet';
import { JobStatsRow } from './JobStatsRow';
import { JobFunnelChart } from './JobFunnelChart';
import { UnmatchedEmailsPanel } from './UnmatchedEmailsPanel';
import {
  JOB_STATUSES,
  JOB_STATUS_COLORS,
  JOB_SOURCES,
  labelFor,
  formatSalary,
  formatDate,
} from './job-constants';

export function JobsPageContents() {
  const { jobs, fetchJobs, createJob, updateJob, deleteJob, reorderJobs, addJobEvent } = usePortfolioStore();
  const [loading, setLoading] = useState(true);
  const [pageTab, setPageTab] = useState<'board' | 'stats'>('board');
  const [view, setView] = useState<'board' | 'table'>('board');
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplicationData | null>(null);
  const [detailJob, setDetailJob] = useState<JobApplicationData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobApplicationData | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false));
  }, [fetchJobs]);

  const resumeVersions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.resumeVersion).filter(Boolean))) as string[],
    [jobs]
  );
  const coverLetterVersions = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.coverLetterVersion).filter(Boolean))) as string[],
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesQuery = !q || j.company.toLowerCase().includes(q) || j.position.toLowerCase().includes(q);
      const matchesSource = sourceFilter === 'all' || j.source === sourceFilter;
      return matchesQuery && matchesSource;
    });
  }, [jobs, search, sourceFilter]);

  const openCreate = () => { setEditingJob(null); setDialogOpen(true); };
  const openEdit = (job: JobApplicationData) => { setDetailJob(null); setEditingJob(job); setDialogOpen(true); };

  const submitJob = async (id: string | undefined, data: Partial<JobApplicationData>) => {
    try {
      if (id) await updateJob(id, data);
      else await createJob(data);
      toast.success(id ? 'Application updated.' : 'Application added.');
    } catch {
      toast.error('Failed to save application.');
      throw new Error('save failed');
    }
  };

  const changeStatus = async (job: JobApplicationData, status: string) => {
    try {
      await updateJob(job.id, { status });
      toast.success(`Moved to ${labelFor(JOB_STATUSES, status)}.`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const moveJob = async (jobId: string, destStatus: string, overJobId: string | null) => {
    const activeJob = jobs.find((j) => j.id === jobId);
    if (!activeJob) return;

    // Recompute the full jobs array in its new order (not just the visible/filtered
    // subset) so reorderJobs never drops jobs hidden by the current search/source filter.
    const withoutActive = jobs.filter((j) => j.id !== jobId);
    const overIndex = overJobId ? withoutActive.findIndex((j) => j.id === overJobId) : -1;
    const insertAt = overIndex === -1 ? withoutActive.length : overIndex;
    const movedJob = { ...activeJob, status: destStatus };
    const reordered = [...withoutActive.slice(0, insertAt), movedJob, ...withoutActive.slice(insertAt)];

    try {
      await reorderJobs(reordered);
      if (destStatus !== activeJob.status) {
        await changeStatus(activeJob, destStatus);
      }
    } catch {
      toast.error('Failed to move application.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteJob(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Application deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  const addNote = async (id: string, note: string) => {
    await addJobEvent(id, { note });
    await fetchJobs();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Applications"
        description="Track every job application, wherever it came from."
        action={<Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add Job</Button>}
      />

      <Tabs value={pageTab} onValueChange={(v) => setPageTab(v as 'board' | 'stats')}>
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <JobStatsRow jobs={jobs} />
          <JobFunnelChart jobs={jobs} />
        </TabsContent>

        <TabsContent value="board" className="space-y-6">
          <UnmatchedEmailsPanel jobs={jobs} />

          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company or position…"
              className="max-w-xs"
            />
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {JOB_SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={(v) => setView(v as 'board' | 'table')} className="ml-auto">
              <TabsList>
                <TabsTrigger value="board"><LayoutGrid className="mr-1.5 h-4 w-4" /> Board</TabsTrigger>
                <TabsTrigger value="table"><List className="mr-1.5 h-4 w-4" /> Table</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {!loading && filtered.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Click “Add Job” to start tracking your first application."
            />
          ) : view === 'board' ? (
            <KanbanBoard
              jobs={filtered}
              onOpenDetail={setDetailJob}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onStatusChange={changeStatus}
              onMove={moveJob}
            />
          ) : (
            <DataTable
              columns={['Company', 'Position', 'Source', 'Status', 'Deadline', 'Salary', 'Actions']}
              isLoading={loading}
            >
              {filtered.map((job) => (
                <TableRow key={job.id} className="cursor-pointer" onClick={() => setDetailJob(job)}>
                  <TableCell className="font-medium text-foreground">{job.company}</TableCell>
                  <TableCell>{job.position}</TableCell>
                  <TableCell>{labelFor(JOB_SOURCES, job.source)}</TableCell>
                  <TableCell>
                    <Badge className={JOB_STATUS_COLORS[job.status]}>{labelFor(JOB_STATUSES, job.status)}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(job.deadline) ?? '—'}</TableCell>
                  <TableCell>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) ?? '—'}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <RowActionsMenu
                      actions={[
                        { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => setDetailJob(job) },
                        { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(job) },
                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleteTarget(job), variant: 'destructive' },
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
          )}
        </TabsContent>
      </Tabs>

      <AddJobDialog
        key={dialogOpen ? editingJob?.id ?? 'new' : 'closed'}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        job={editingJob}
        resumeVersions={resumeVersions}
        coverLetterVersions={coverLetterVersions}
        onSubmit={submitJob}
      />

      <JobDetailSheet
        job={detailJob}
        onOpenChange={(open) => { if (!open) setDetailJob(null); }}
        onEdit={openEdit}
        onAddNote={addNote}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete application"
        description="This permanently removes the job application and its history. This action cannot be undone."
      />
    </div>
  );
}
