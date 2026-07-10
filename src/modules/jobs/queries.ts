import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const eventsAsc = { events: { orderBy: { createdAt: "asc" as const } } };
const eventsDesc = { events: { orderBy: { createdAt: "desc" as const } } };

export const jobsRepo = {
  list: () =>
    prisma.jobApplication.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: eventsAsc,
    }),
  listAll: () => prisma.jobApplication.findMany(),
  count: () => prisma.jobApplication.count(),
  get: (id: string) => prisma.jobApplication.findUnique({ where: { id }, include: eventsDesc }),
  getRaw: (id: string) => prisma.jobApplication.findUnique({ where: { id } }),
  findByJobUrl: (jobUrl: string) =>
    prisma.jobApplication.findFirst({ where: { jobUrl }, include: eventsDesc }),
  create: (data: Prisma.JobApplicationCreateInput) =>
    prisma.jobApplication.create({ data, include: eventsDesc }),
  update: (id: string, data: Prisma.JobApplicationUpdateInput) =>
    prisma.jobApplication.update({ where: { id }, data, include: eventsDesc }),
  updateRaw: (id: string, data: Prisma.JobApplicationUpdateInput) =>
    prisma.jobApplication.update({ where: { id }, data }),
  remove: (id: string) => prisma.jobApplication.delete({ where: { id } }),
  reorder: (items: { id: string; order: number }[]) =>
    prisma.$transaction(
      items.map((item) =>
        prisma.jobApplication.update({ where: { id: item.id }, data: { order: item.order } })
      )
    ),
};

export const jobEventsRepo = {
  create: (data: Prisma.JobStatusEventUncheckedCreateInput) => prisma.jobStatusEvent.create({ data }),
  findByGmailMessageId: (gmailMessageId: string) =>
    prisma.jobStatusEvent.findUnique({ where: { gmailMessageId } }),
};

export const jobSettingsRepo = {
  get: () =>
    prisma.jobTrackerSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  getRaw: () => prisma.jobTrackerSettings.findUnique({ where: { id: "singleton" } }),
  update: (gmailLabel: string) =>
    prisma.jobTrackerSettings.upsert({
      where: { id: "singleton" },
      update: { gmailLabel },
      create: { id: "singleton", gmailLabel },
    }),
};

export const unmatchedEmailsRepo = {
  list: () => prisma.unmatchedJobEmail.findMany({ orderBy: { receivedAt: "desc" } }),
  get: (id: string) => prisma.unmatchedJobEmail.findUnique({ where: { id } }),
  findByGmailMessageId: (gmailMessageId: string) =>
    prisma.unmatchedJobEmail.findUnique({ where: { gmailMessageId } }),
  create: (data: Prisma.UnmatchedJobEmailCreateInput) => prisma.unmatchedJobEmail.create({ data }),
  remove: (id: string) => prisma.unmatchedJobEmail.delete({ where: { id } }),
};

// Logs a matched Gmail scan result against a job: a new status event plus the
// status/thread update, without refetching the events list (the scan loop
// doesn't need it back).
export function logGmailMatch(
  jobId: string,
  status: string,
  gmailMessageId: string,
  note: string | null,
  gmailThreadId: string | null | undefined
) {
  return prisma.$transaction([
    prisma.jobStatusEvent.create({
      data: { jobId, status, source: "gmail", gmailMessageId, note },
    }),
    prisma.jobApplication.update({
      where: { id: jobId },
      data: { status, gmailThreadId },
    }),
  ]);
}

// Links an already-fetched unmatched email to an already-fetched job: logs the
// status event the scan couldn't confidently attribute, then discards the
// unmatched record. Existence checks stay in the route handler.
export function linkUnmatchedEmailToJob(
  email: NonNullable<Awaited<ReturnType<typeof unmatchedEmailsRepo.get>>>,
  job: NonNullable<Awaited<ReturnType<typeof jobsRepo.getRaw>>>
) {
  return prisma.$transaction([
    prisma.jobStatusEvent.create({
      data: {
        jobId: job.id,
        status: email.suggestedStatus,
        source: "gmail",
        gmailMessageId: email.gmailMessageId,
        note: email.subject,
      },
    }),
    prisma.jobApplication.update({
      where: { id: job.id },
      data: {
        status: email.suggestedStatus,
        gmailThreadId: job.gmailThreadId ?? email.gmailThreadId ?? undefined,
      },
      include: eventsDesc,
    }),
    prisma.unmatchedJobEmail.delete({ where: { id: email.id } }),
  ]);
}
