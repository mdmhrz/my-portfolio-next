import { getAppearance } from "@/modules/settings/appearance/service";
import { generateFontCSS } from "@/modules/settings/appearance/appearance-injector";

/**
 * Global font injection (server-side). Renders nothing for the built-in Satoshi
 * default — next/font's localFont keeps serving it. Mount once in the root layout.
 */
export async function AppearanceFont() {
  const { font } = await getAppearance();
  const css = generateFontCSS(font);
  if (!css) return null;
  return <style id="appearance-font" dangerouslySetInnerHTML={{ __html: css }} />;
}
