-- CreateTable
CREATE TABLE "file_asset" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerFileId" TEXT NOT NULL,
    "folder" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER,
    "relatedModule" TEXT NOT NULL,
    "relatedId" TEXT,
    "mirrorOfId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_asset_pkey" PRIMARY KEY ("id")
);
