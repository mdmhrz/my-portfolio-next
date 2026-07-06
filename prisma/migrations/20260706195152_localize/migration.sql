/*
  Warnings:

  - A unique constraint covering the columns `[gmailMessageId]` on the table `job_status_event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "job_status_event" ADD COLUMN     "gmailMessageId" TEXT;

-- CreateTable
CREATE TABLE "unmatched_job_email" (
    "id" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "subject" TEXT,
    "snippet" TEXT,
    "suggestedStatus" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unmatched_job_email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_tracker_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "gmailLabel" TEXT NOT NULL DEFAULT 'Jobs',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_tracker_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unmatched_job_email_gmailMessageId_key" ON "unmatched_job_email"("gmailMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "job_status_event_gmailMessageId_key" ON "job_status_event"("gmailMessageId");
