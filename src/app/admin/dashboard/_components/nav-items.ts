import React from "react";
import { LayoutDashboard, Briefcase, FolderKanban, BookOpen, Mail, User, Wrench, Settings, Palette, Home } from "lucide-react";

export type TabValue = "banner" | "experience" | "projects" | "blogs" | "messages" | "about" | "skills" | "settings" | "appearance" | "homepage";

export interface NavItem {
  value: TabValue;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { value: "banner",     label: "Hero Banner",    href: "/admin/dashboard/banner",     icon: LayoutDashboard },
  { value: "homepage",   label: "Homepage",       href: "/admin/dashboard/homepage",   icon: Home },
  { value: "about",      label: "About",          href: "/admin/dashboard/about",      icon: User },
  { value: "experience", label: "Experience",     href: "/admin/dashboard/experience", icon: Briefcase },
  { value: "projects",   label: "Projects",       href: "/admin/dashboard/projects",   icon: FolderKanban },
  { value: "skills",     label: "Skills",          href: "/admin/dashboard/skills",     icon: Wrench },
  { value: "blogs",      label: "Blog Posts",     href: "/admin/dashboard/blogs",      icon: BookOpen },
  { value: "appearance", label: "Appearance",     href: "/admin/dashboard/appearance", icon: Palette },
  { value: "settings",   label: "Site Settings",  href: "/admin/dashboard/settings",   icon: Settings },
  { value: "messages",   label: "Inbox Messages", href: "/admin/dashboard/messages",   icon: Mail, showBadge: true },
];
