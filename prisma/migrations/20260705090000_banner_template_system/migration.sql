-- AlterTable
ALTER TABLE "banner" ADD COLUMN     "animationTemplate" TEXT NOT NULL DEFAULT 'signature',
ADD COLUMN     "backgroundTemplate" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "heroImageAlt" TEXT,
ADD COLUMN     "layoutTemplate" TEXT NOT NULL DEFAULT 'signature';

-- The schema default for backgroundTemplate ("none") is the neutral baseline for
-- fresh installs / "Reset to Default". Pin the existing live singleton row to
-- "lattice" explicitly so this migration doesn't change what's currently live —
-- layoutTemplate/animationTemplate defaults ("signature") already match.
UPDATE "banner" SET "backgroundTemplate" = 'lattice' WHERE "id" = 'singleton';
