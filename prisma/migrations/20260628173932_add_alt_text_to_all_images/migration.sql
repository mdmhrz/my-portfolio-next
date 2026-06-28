-- AlterTable
ALTER TABLE "about" ADD COLUMN     "avatarAlt" TEXT;

-- AlterTable
ALTER TABLE "banner" ADD COLUMN     "backgroundAlt" TEXT,
ADD COLUMN     "backgroundImg" TEXT;

-- AlterTable
ALTER TABLE "blog" ADD COLUMN     "coverImageAlt" TEXT;

-- AlterTable
ALTER TABLE "experience" ADD COLUMN     "logo" TEXT,
ADD COLUMN     "logoAlt" TEXT;

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "imageAlt" TEXT;

-- AlterTable
ALTER TABLE "skill" ADD COLUMN     "iconAlt" TEXT;
