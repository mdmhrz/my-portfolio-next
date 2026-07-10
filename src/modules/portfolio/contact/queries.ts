import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const messagesRepo = {
  // Nested write: creates the Message and its owning Thread atomically. The
  // Thread row itself belongs to the gmail module's queries.ts for any
  // subsequent updates (see threadsRepo) — this is the one place Contact
  // creates one, as part of a single Message submission.
  createWithThread: (
    data: Omit<Prisma.MessageCreateInput, "thread">,
    thread: { contactEmail: string; contactName?: string; subject?: string }
  ) =>
    prisma.message.create({
      data: { ...data, thread: { create: thread } },
      include: { thread: true },
    }),
};
