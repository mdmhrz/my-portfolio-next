-- CreateTable
CREATE TABLE "gmail_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshTokenEnc" TEXT NOT NULL,
    "accessTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "historyId" TEXT,
    "watchExpiration" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thread" (
    "id" TEXT NOT NULL,
    "gmailThreadId" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactName" TEXT,
    "subject" TEXT,
    "messageId" TEXT,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "gmailMessageId" TEXT,
    "rfcMessageId" TEXT,
    "direction" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT,
    "bodyHtml" TEXT NOT NULL,
    "snippet" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment" (
    "id" TEXT NOT NULL,
    "emailMessageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gmail_account_userId_key" ON "gmail_account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "thread_gmailThreadId_key" ON "thread"("gmailThreadId");

-- CreateIndex
CREATE UNIQUE INDEX "thread_messageId_key" ON "thread"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "email_message_gmailMessageId_key" ON "email_message"("gmailMessageId");

-- AddForeignKey
ALTER TABLE "thread" ADD CONSTRAINT "thread_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_message" ADD CONSTRAINT "email_message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_emailMessageId_fkey" FOREIGN KEY ("emailMessageId") REFERENCES "email_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
