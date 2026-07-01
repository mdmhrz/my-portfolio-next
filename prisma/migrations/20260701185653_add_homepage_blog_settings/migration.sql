-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "homepageBlogSubtitle" TEXT,
ADD COLUMN     "homepageBlogTemplate" TEXT NOT NULL DEFAULT 'standard',
ADD COLUMN     "homepageBlogTitle" TEXT,
ADD COLUMN     "homepageBlogVisible" BOOLEAN NOT NULL DEFAULT true;
