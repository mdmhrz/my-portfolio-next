import { getAppearance } from "@/lib/getSiteSettings";
import { generateColorCSS } from "@/lib/appearanceInjector";

/**
 * Scopes a color palette to a subtree (server-side). The wrapper uses
 * `display:contents` so it adds no box to the layout, yet its CSS custom
 * properties still inherit into all children — letting the public site and the
 * admin dashboard carry independent palettes over the same globals.css baseline.
 *
 * A null config emits no <style>, so the subtree inherits the built-in theme.
 */
export async function AppearanceColorScope({
  scope,
  children,
}: {
  scope: "public" | "admin";
  children: React.ReactNode;
}) {
  const appearance = await getAppearance();
  const config = scope === "public" ? appearance.publicColors : appearance.dashboardColors;
  const css = generateColorCSS(`[data-appearance="${scope}"]`, config);

  return (
    <>
      {css ? (
        <style id={`appearance-${scope}`} dangerouslySetInnerHTML={{ __html: css }} />
      ) : null}
      <div data-appearance={scope} style={{ display: "contents" }}>
        {children}
      </div>
    </>
  );
}
