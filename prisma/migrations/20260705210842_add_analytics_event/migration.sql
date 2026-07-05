-- CreateTable
CREATE TABLE "analytics_event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'pageview',
    "path" TEXT,
    "referrer" TEXT,
    "country" TEXT,
    "visitorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_event_type_createdAt_idx" ON "analytics_event"("type", "createdAt");
