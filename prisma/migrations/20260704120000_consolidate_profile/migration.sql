-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "longBio" TEXT,
    "avatarUrl" TEXT,
    "avatarAlt" TEXT,
    "resumeUrl" TEXT,
    "location" TEXT,
    "availability" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "facebook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- Data migration: merge existing banner (identity/contact) + about (bio/narrative)
-- singleton rows into the new profile table before the source columns/table are dropped.
INSERT INTO "profile" ("id", "name", "designation", "bio", "longBio", "avatarUrl", "avatarAlt", "resumeUrl", "location", "availability", "email", "whatsapp", "github", "linkedin", "facebook", "createdAt", "updatedAt")
SELECT
  'singleton',
  COALESCE(b."name", 'Your Name'),
  COALESCE(b."title", 'Full-Stack Developer'),
  COALESCE(a."bio", 'Full-stack developer.'),
  a."longBio",
  a."avatarUrl",
  a."avatarAlt",
  a."resumeUrl",
  a."location",
  a."availability",
  b."email",
  b."whatsapp",
  b."github",
  b."linkedin",
  b."facebook",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (SELECT 1) AS x
LEFT JOIN "banner" b ON b."id" = 'singleton'
LEFT JOIN "about" a ON a."id" = 'singleton';

-- AlterTable
ALTER TABLE "banner" DROP COLUMN "email",
DROP COLUMN "facebook",
DROP COLUMN "github",
DROP COLUMN "linkedin",
DROP COLUMN "name",
DROP COLUMN "title",
DROP COLUMN "whatsapp";

-- DropTable
DROP TABLE "about";
