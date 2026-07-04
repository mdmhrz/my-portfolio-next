-- CreateTable
CREATE TABLE "cta" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "headline" TEXT NOT NULL DEFAULT 'Let''s build something solid.',
    "subtext" TEXT NOT NULL DEFAULT 'Frontend & full-stack engineering — from Next.js interfaces to Node & Go services. Open to freelance work, consulting, and full-time roles.',
    "buttonLabel" TEXT NOT NULL DEFAULT 'Get in touch',
    "buttonHref" TEXT NOT NULL DEFAULT '#contact',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "bio" TEXT,
    "availabilityBadge" TEXT NOT NULL DEFAULT 'Open for roles',
    "availabilityText" TEXT NOT NULL DEFAULT 'Currently accepting freelance contracts, SaaS consulting, and full-time frontend/full-stack engineering roles.',
    "location" TEXT NOT NULL DEFAULT 'Remote / UTC+6',
    "primaryStack" TEXT NOT NULL DEFAULT 'React, Next.js, Go',
    "copyrightName" TEXT NOT NULL DEFAULT 'MHR.DEV',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_link" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showInNav" BOOLEAN NOT NULL DEFAULT true,
    "showInFooter" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nav_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "section_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "section_config_key_key" ON "section_config"("key");

-- Backfill: Cta singleton, carrying over the live SiteSettings.ctaHeadline/ctaSubtext
-- (falling back to the same hardcoded defaults CTA.tsx already uses) before those
-- columns are dropped below. Button label/href were never in SiteSettings — they were
-- hardcoded in CTA.tsx, so they seed straight from schema defaults.
INSERT INTO "cta" ("id", "headline", "subtext", "buttonLabel", "buttonHref", "updatedAt")
SELECT
  'singleton',
  COALESCE(NULLIF(s."ctaHeadline", ''), 'Let''s build something solid.'),
  COALESCE(NULLIF(s."ctaSubtext", ''), 'Frontend & full-stack engineering — from Next.js interfaces to Node & Go services. Open to freelance work, consulting, and full-time roles.'),
  'Get in touch',
  '#contact',
  now()
FROM "site_settings" s WHERE s."id" = 'singleton'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "cta" ("id", "updatedAt")
VALUES ('singleton', now())
ON CONFLICT ("id") DO NOTHING;

-- Backfill: Footer singleton. "bio" is left NULL when SiteSettings.footerText was empty,
-- preserving the current footerText || profile.bio fallback chain used in Footer.tsx.
-- The Availability card / copyright fields were hardcoded in Footer.tsx, so they seed
-- straight from schema defaults (identical strings, zero visual change on deploy).
INSERT INTO "footer" ("id", "bio", "updatedAt")
SELECT
  'singleton',
  NULLIF(s."footerText", ''),
  now()
FROM "site_settings" s WHERE s."id" = 'singleton'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "footer" ("id", "updatedAt")
VALUES ('singleton', now())
ON CONFLICT ("id") DO NOTHING;

-- Backfill: NavLink rows, seeded verbatim from Navbar.tsx's current hardcoded array
-- (chosen as source of truth over Footer.tsx's slightly different copy — this
-- intentionally also fixes Footer's "Blog" link from /blogs to /#blog to match Navbar).
INSERT INTO "nav_link" ("id", "label", "href", "order", "showInNav", "showInFooter", "createdAt", "updatedAt") VALUES
  ('nav-journey',    'Journey',    '/#journey',    0, true, true, now(), now()),
  ('nav-experience', 'Experience', '/#experience', 1, true, true, now(), now()),
  ('nav-skills',     'Skills',     '/#skills',     2, true, true, now(), now()),
  ('nav-work',       'Work',       '/#work',       3, true, true, now(), now()),
  ('nav-blog',       'Blog',       '/#blog',       4, true, true, now(), now()),
  ('nav-contact',    'Contact',    '/contact',     5, true, true, now(), now()),
  ('nav-about',      'About',      '/about',       6, true, true, now(), now());

-- Backfill: SectionConfig rows in the exact current hardcoded JSX order from
-- PortfolioHome.tsx. "homepageBlogs" visibility carries over the live
-- SiteSettings.homepageBlogVisible value before that column is dropped below.
-- Hero and Footer are intentionally NOT rows here — they are permanent chrome/entry
-- sections, not independently hideable/reorderable.
INSERT INTO "section_config" ("id", "key", "visible", "order")
SELECT 'section-technarquee', 'techMarquee', true, 0
UNION ALL SELECT 'section-journey', 'journey', true, 1
UNION ALL SELECT 'section-experience', 'experience', true, 2
UNION ALL SELECT 'section-tools', 'tools', true, 3
UNION ALL SELECT 'section-casestudies', 'caseStudies', true, 4
UNION ALL SELECT 'section-homepageblogs', 'homepageBlogs', COALESCE((SELECT s."homepageBlogVisible" FROM "site_settings" s WHERE s."id" = 'singleton'), true), 5
UNION ALL SELECT 'section-cta', 'cta', true, 6
UNION ALL SELECT 'section-contact', 'contact', true, 7;

-- AlterTable: drop the now-migrated CTA/Footer/blog-visibility columns, add site logo fields
ALTER TABLE "site_settings" DROP COLUMN "ctaHeadline",
DROP COLUMN "ctaSubtext",
DROP COLUMN "footerText",
DROP COLUMN "homepageBlogVisible",
ADD COLUMN     "logoAlt" TEXT,
ADD COLUMN     "logoUrl" TEXT;
