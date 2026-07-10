import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const lastEmailDesc = { emails: { orderBy: { sentAt: "desc" as const }, take: 1 } };

export const gmailAccountRepo = {
  findFirst: () => prisma.gmailAccount.findFirst(),
  findFirstMasked: () =>
    prisma.gmailAccount.findFirst({ select: { email: true, watchExpiration: true } }),
  findByUserId: (userId: string) => prisma.gmailAccount.findUnique({ where: { userId } }),
  upsert: (
    userId: string,
    create: Prisma.GmailAccountUncheckedCreateInput,
    update: Prisma.GmailAccountUpdateInput
  ) => prisma.gmailAccount.upsert({ where: { userId }, create, update }),
  update: (id: string, data: Prisma.GmailAccountUpdateInput) =>
    prisma.gmailAccount.update({ where: { id }, data }),
  remove: (id: string) => prisma.gmailAccount.delete({ where: { id } }),
};

export const threadsRepo = {
  list: () =>
    prisma.thread.findMany({
      orderBy: { lastMessageAt: "desc" },
      include: { message: true, emails: { orderBy: { sentAt: "desc" }, take: 1, include: { attachments: true } } },
    }),
  get: (id: string) =>
    prisma.thread.findUnique({
      where: { id },
      include: { message: true, emails: { orderBy: { sentAt: "asc" }, include: { attachments: true } } },
    }),
  getRaw: (id: string) => prisma.thread.findUnique({ where: { id } }),
  getWithLastEmail: (id: string) => prisma.thread.findUnique({ where: { id }, include: lastEmailDesc }),
  findByGmailThreadId: (gmailThreadId: string) => prisma.thread.findUnique({ where: { gmailThreadId } }),
  create: (data: Prisma.ThreadCreateInput) => prisma.thread.create({ data, include: { emails: true } }),
  update: (id: string, data: Prisma.ThreadUpdateInput) => prisma.thread.update({ where: { id }, data }),
  removeWithMessage: (id: string, messageId: string | null) =>
    prisma.$transaction([
      prisma.thread.delete({ where: { id } }),
      ...(messageId ? [prisma.message.delete({ where: { id: messageId } })] : []),
    ]),
};

export const emailMessagesRepo = {
  findByGmailMessageId: (gmailMessageId: string) =>
    prisma.emailMessage.findUnique({ where: { gmailMessageId } }),
  create: (data: Prisma.EmailMessageUncheckedCreateInput) => prisma.emailMessage.create({ data }),
  createWithAttachments: (data: Prisma.EmailMessageUncheckedCreateInput) =>
    prisma.emailMessage.create({ data, include: { attachments: true } }),
};

export const attachmentsRepo = {
  create: (data: Prisma.AttachmentUncheckedCreateInput) => prisma.attachment.create({ data }),
};
