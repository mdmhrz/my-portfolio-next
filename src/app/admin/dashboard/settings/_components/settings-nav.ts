import { Palette, Paintbrush, LayoutGrid, Plug, Webhook, Sparkles, Fingerprint, type LucideIcon } from "lucide-react";

export interface SettingsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Placeholder section — shown disabled ("Soon") until built. */
  soon?: boolean;
}

export interface SettingsNavGroup {
  label: string;
  items: SettingsNavItem[];
}

const BASE = "/admin/dashboard/settings";

/**
 * Single source of truth for the Settings hub's left nav. Adding a new settings
 * area later = add one item here + a matching `settings/<slug>/page.tsx` route.
 */
export const SETTINGS_GROUPS: SettingsNavGroup[] = [
  {
    label: "Website",
    items: [
      { label: "Branding", href: `${BASE}/branding`, icon: Palette },
      { label: "Appearance", href: `${BASE}/appearance`, icon: Paintbrush },
      { label: "Landing Sections", href: `${BASE}/sections`, icon: LayoutGrid },
    ],
  },
  {
    label: "Connections",
    items: [
      { label: "Integrations", href: `${BASE}/integrations`, icon: Plug },
      { label: "Webhooks", href: `${BASE}/webhooks`, icon: Webhook, soon: true },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Security", href: `${BASE}/security`, icon: Fingerprint },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Templates", href: `${BASE}/templates`, icon: Sparkles, soon: true },
    ],
  },
];

/** First real section — where `/settings` redirects to. */
export const SETTINGS_DEFAULT_HREF = `${BASE}/branding`;
