-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "accentColor" TEXT DEFAULT '#000000',
ADD COLUMN     "colorMode" TEXT DEFAULT 'simple',
ADD COLUMN     "customFontUrl" TEXT,
ADD COLUMN     "customPalette" JSONB,
ADD COLUMN     "fontName" TEXT DEFAULT 'Satoshi',
ADD COLUMN     "fontType" TEXT DEFAULT 'default',
ADD COLUMN     "fontWeights" TEXT[] DEFAULT ARRAY['400', '500', '700', '900']::TEXT[],
ADD COLUMN     "themePreset" TEXT DEFAULT 'default';
