import { cache } from "react";
import { siteSettingsRepo } from "../site-settings/queries";
import type { ColorConfig, FontConfig } from "./appearance-injector";

/**
 * Reads the singleton SiteSettings appearance config. Wrapped in React.cache so
 * multiple server components in one request (font + color scopes) share one query.
 */
export const getAppearance = cache(async (): Promise<{
  font: FontConfig;
  publicColors: ColorConfig | null;
  dashboardColors: ColorConfig | null;
}> => {
  const s = await siteSettingsRepo.get();

  const font: FontConfig = {
    type: (s?.fontType as FontConfig["type"]) || "default",
    name: s?.fontName || "Satoshi",
    weights: s?.fontWeights?.length ? s.fontWeights : ["400", "500", "700", "900"],
    customUrl: s?.customFontUrl ?? null,
  };

  return {
    font,
    publicColors: (s?.publicColors as ColorConfig | null) ?? null,
    dashboardColors: (s?.dashboardColors as ColorConfig | null) ?? null,
  };
});
