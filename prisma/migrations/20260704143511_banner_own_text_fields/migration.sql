-- AlterTable
ALTER TABLE "banner" ADD COLUMN     "ctaHref" TEXT NOT NULL DEFAULT '#work',
ADD COLUMN     "ctaLabel" TEXT NOT NULL DEFAULT 'View work',
ADD COLUMN     "headline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "showcaseImageSide" TEXT NOT NULL DEFAULT 'left',
ADD COLUMN     "subtitle" TEXT NOT NULL DEFAULT '';
