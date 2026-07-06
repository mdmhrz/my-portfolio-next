import { JobApplicationData } from '@/store/usePortfolioStore';
import { JOB_STATUSES, JOB_SOURCES, labelFor } from './job-constants';

// "rejected" is a terminal branch, not a later pipeline stage than "interview"
// or "offer" — excluded here so peak-stage-reached math isn't skewed by it.
const PIPELINE_ORDER: string[] = JOB_STATUSES.filter((s) => s.value !== 'rejected').map((s) => s.value);
const orderIndex = (status: string) => PIPELINE_ORDER.indexOf(status);
const APPLIED_INDEX = orderIndex('applied');
const INTERVIEW_INDEX = orderIndex('interview');

function pct(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100);
}

// The furthest real pipeline stage a job ever reached, using its full status
// history (JobStatusEvent) — a job currently "rejected" after an interview
// should still count toward the interview rate.
function peakOrderIndex(job: JobApplicationData) {
  const statuses = [...(job.events ?? []).map((e) => e.status), job.status];
  return Math.max(-1, ...statuses.map(orderIndex));
}

/**
 * All figures are derived client-side from the already-fetched `jobs` list —
 * a personal tracker's row count never justifies a server-side aggregation
 * endpoint, so this stays a pure function over data the store already has.
 */
export function computeJobStats(jobs: JobApplicationData[]) {
  const peaks = jobs.map(peakOrderIndex);

  const total = jobs.length;
  const applied = peaks.filter((p) => p >= APPLIED_INDEX).length;
  const responded = peaks.filter((p) => p > APPLIED_INDEX).length;
  const interviewOrLater = peaks.filter((p) => p >= INTERVIEW_INDEX).length;
  const offers = jobs.filter((j) => j.status === 'offer' || (j.events ?? []).some((e) => e.status === 'offer')).length;

  const funnel = JOB_STATUSES.filter((s) => s.value !== 'rejected').map((s) => ({
    status: s.value,
    label: s.label,
    count: jobs.filter((j) => j.status === s.value).length,
  }));

  const sourceCounts = new Map<string, number>();
  for (const j of jobs) sourceCounts.set(j.source, (sourceCounts.get(j.source) ?? 0) + 1);
  const bySource = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, label: labelFor(JOB_SOURCES, source), count }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    applied,
    responseRate: pct(responded, applied),
    interviewRate: pct(interviewOrLater, applied),
    offerRate: pct(offers, applied),
    funnel,
    bySource,
  };
}
