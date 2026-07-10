-- AlterTable
ALTER TABLE "file_asset" ADD COLUMN     "folderId" TEXT;

-- CreateTable
CREATE TABLE "file_manager_folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_manager_folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_manager_folder_parentId_name_key" ON "file_manager_folder"("parentId", "name");

-- AddForeignKey
ALTER TABLE "file_asset" ADD CONSTRAINT "file_asset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "file_manager_folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_manager_folder" ADD CONSTRAINT "file_manager_folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "file_manager_folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
