import React from "react";
import { LayoutDashboard, Briefcase, FolderKanban, BookOpen, Mail } from "lucide-react";

export type TabValue = "banner" | "experience" | "projects" | "blogs" | "messages";

export interface NavItem {
  value: TabValue;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  showBadge?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { value: "banner",     label: "Hero Banner",    icon: LayoutDashboard },
  { value: "experience", label: "Experience",     icon: Briefcase },
  { value: "projects",   label: "Projects",       icon: FolderKanban },
  { value: "blogs",      label: "Blog Posts",     icon: BookOpen },
  { value: "messages",   label: "Inbox Messages", icon: Mail, showBadge: true },
];
