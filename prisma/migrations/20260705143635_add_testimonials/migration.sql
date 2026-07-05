-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "homepageTestimonialsCtaLink" TEXT,
ADD COLUMN     "homepageTestimonialsCtaText" TEXT,
ADD COLUMN     "homepageTestimonialsStat" TEXT,
ADD COLUMN     "homepageTestimonialsStatLabel" TEXT,
ADD COLUMN     "homepageTestimonialsSubtitle" TEXT,
ADD COLUMN     "homepageTestimonialsTemplate" TEXT NOT NULL DEFAULT 'carousel',
ADD COLUMN     "homepageTestimonialsTitle" TEXT;

-- CreateTable
CREATE TABLE "testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "quote" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "avatarAlt" TEXT,
    "rating" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_pkey" PRIMARY KEY ("id")
);
