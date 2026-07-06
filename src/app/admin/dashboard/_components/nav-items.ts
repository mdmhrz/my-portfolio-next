import React from "react";
import {
  UserCircle,
  Gauge,
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  FolderKanban,
  BookOpen,
  Sliders,
  Mail,
  Wrench,
  Settings,
  MousePointerClick,
  PanelBottom,
  Link2,
  MessageSquareQuote,
} from "lucide-react";

export type TabValue =
  | "overview"
  | "profile"
  | "banner"
  | "experience"
  | "projects"
  | "skills"
  | "appearance"
  | "cta"
  | "footer"
  | "nav-links"
  | "settings"
  | "blogs"
  | "blogs-display-settings"
  | "testimonials"
  | "messages"
  | "jobs";

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
      { value: "cta", label: "Call to Action", href: "/admin/dashboard/cta", icon: MousePointerClick },
      { value: "testimonials", label: "Testimonials", href: "/admin/dashboard/testimonials", icon: MessageSquareQuote },
      { value: "footer", label: "Footer", href: "/admin/dashboard/footer", icon: PanelBottom },
      { value: "nav-links", label: "Navigation Links", href: "/admin/dashboard/nav-links", icon: Link2 },
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
  {
    label: "Job Tracker",
    items: [
      { value: "jobs", label: "Applications", href: "/admin/dashboard/jobs", icon: KanbanSquare },
    ],
  },
];

/**
 * Pinned to the bottom of the sidebar, separated from the scrollable groups
 * above — Site Settings + Account (like the dashboard reference layout).
 */
export const NAV_BOTTOM: NavItem[] = [
  { value: "settings", label: "Site Settings", href: "/admin/dashboard/settings", icon: Settings },
  { value: "profile", label: "Account", href: "/admin/dashboard/profile", icon: UserCircle },
];

/** Flattened view — handy where a single lookup list is more convenient than groups. */
export const NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), ...NAV_BOTTOM];
