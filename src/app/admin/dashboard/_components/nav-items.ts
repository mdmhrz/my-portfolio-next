import React from "react";
import {
  UserCircle,
  Gauge,
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  BookOpen,
  Sliders,
  Mail,
  Wrench,
  Settings,
  Palette,
} from "lucide-react";

export type TabValue =
  | "overview"
  | "profile"
  | "banner"
  | "experience"
  | "projects"
  | "skills"
  | "appearance"
  | "settings"
  | "blogs"
  | "blogs-display-settings"
  | "messages";

export interface NavItem {
  value: TabValue;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Sidebar is grouped by domain rather than a flat list — this is the pattern
 * to extend when adding future modules (Job Tracking, Notes, AI, …): each new
 * module gets its own group here rather than growing an existing one or the
 * flat list.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { value: "overview", label: "Overview", href: "/admin/dashboard", icon: Gauge },
    ],
  },
  {
    label: "Site Content",
    items: [
      { value: "banner", label: "Hero Banner", href: "/admin/dashboard/banner", icon: LayoutDashboard },
      { value: "experience", label: "Experience", href: "/admin/dashboard/experience", icon: Briefcase },
      { value: "projects", label: "Projects", href: "/admin/dashboard/projects", icon: FolderKanban },
      { value: "skills", label: "Skills", href: "/admin/dashboard/skills", icon: Wrench },
      { value: "appearance", label: "Appearance", href: "/admin/dashboard/appearance", icon: Palette },
      { value: "settings", label: "Site Settings", href: "/admin/dashboard/settings", icon: Settings },
    ],
  },
  {
    label: "Blog",
    items: [
      { value: "blogs", label: "Posts", href: "/admin/dashboard/blogs", icon: BookOpen },
      { value: "blogs-display-settings", label: "Display Settings", href: "/admin/dashboard/blogs/display-settings", icon: Sliders },
    ],
  },
  {
    label: "Inbox",
    items: [
      { value: "messages", label: "Messages", href: "/admin/dashboard/messages", icon: Mail, showBadge: true },
    ],
  },
];

/**
 * Reachable only via the topbar user-menu (not the sidebar) — Profile is
 * personal account info, not a content section. Still listed here so the
 * topbar page title resolves correctly when you're on that page.
 */
const HIDDEN_NAV_ITEMS: NavItem[] = [
  { value: "profile", label: "Profile", href: "/admin/dashboard/profile", icon: UserCircle },
];

/** Flattened view — handy where a single lookup list is more convenient than groups. */
export const NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ...HIDDEN_NAV_ITEMS];
