import { prisma } from "@/lib/prisma";
import { getCalendarClient } from "@/lib/gmail";

interface CreateJobCalendarEventParams {
  jobId: string;
  title: string;
  description?: string;
  startTime: Date;
  durationMinutes?: number;
}

export async function createJobCalendarEvent(params: CreateJobCalendarEventParams) {
  const { calendar } = await getCalendarClient();
  const endTime = new Date(params.startTime.getTime() + (params.durationMinutes ?? 60) * 60_000);

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: params.title,
      description: params.description,
      start: { dateTime: params.startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
    },
  });

  return prisma.jobApplication.update({
    where: { id: params.jobId },
    data: {
      calendarEventId: res.data.id ?? null,
      calendarEventLink: res.data.htmlLink ?? null,
    },
    include: { events: { orderBy: { createdAt: "desc" } } },
  });
}

function isGoneOnGoogle(error: unknown) {
  const gaxiosError = error as { code?: number | string; response?: { status?: number } };
  const status = Number(gaxiosError.response?.status ?? gaxiosError.code);
  return status === 404 || status === 410;
}

export async function deleteJobCalendarEvent(jobId: string) {
  const job = await prisma.jobApplication.findUnique({ where: { id: jobId } });
  if (!job?.calendarEventId) return job;

  const { calendar } = await getCalendarClient();
  try {
    await calendar.events.delete({ calendarId: "primary", eventId: job.calendarEventId });
  } catch (error) {
    if (!isGoneOnGoogle(error)) throw error;
  }

  return prisma.jobApplication.update({
    where: { id: jobId },
    data: { calendarEventId: null, calendarEventLink: null },
    include: { events: { orderBy: { createdAt: "desc" } } },
  });
}

