-- CreateTable
CREATE TABLE "job_application" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "companyLogo" TEXT,
    "jobUrl" TEXT,
    "source" TEXT NOT NULL,
    "applicationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "deadline" TIMESTAMP(3),
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT,
    "location" TEXT,
    "workMode" TEXT,
    "resumeVersion" TEXT,
    "coverLetterVersion" TEXT,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "gmailThreadId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_status_event" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_status_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_status_event" ADD CONSTRAINT "job_status_event_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
