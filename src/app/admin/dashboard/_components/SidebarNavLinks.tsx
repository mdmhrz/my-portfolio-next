'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_GROUPS, type NavItem } from "./nav-items";
import { CountBadge } from "@/components/admin/CountBadge";

interface SidebarNavLinksProps {
  unreadCount: number;
  /** When true, renders icon-only links with Tooltip labels */
  collapsed?: boolean;
  /** Called when a mobile nav link is clicked (to close the sheet) */
  onNavigate?: () => void;
  /** Live search query — filters items by label (ignored when `items` is passed) */
  query?: string;
  /** Render a flat list of these items instead of grouped NAV_GROUPS (used for the pinned bottom) */
  items?: NavItem[];
}

export function SidebarNavLinks({
  unreadCount,
  collapsed = false,
  onNavigate,
  query = "",
  items,
}: SidebarNavLinksProps) {
  const pathname = usePathname();
  const q = query.trim().toLowerCase();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const hasBadge = item.showBadge && unreadCount > 0;

    if (collapsed) {
      return (
        <Tooltip key={item.value}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`relative mx-auto flex h-11 w-12 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {hasBadge && (
                <CountBadge count={unreadCount} className="absolute top-1 right-1 min-w-[16px] h-4 text-[9px] px-1" />
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-1.5">
            {item.label}
            {hasBadge && <CountBadge count={unreadCount} className="bg-muted text-foreground" />}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={item.value}
        href={item.href}
        onClick={onNavigate}
        className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {item.label}
        </span>
        {hasBadge && <CountBadge count={unreadCount} />}
      </Link>
    );
  };

  // Flat list mode (pinned bottom section)
  if (items) {
    return (
      <TooltipProvider delayDuration={50}>
        <nav className="space-y-1.5">{items.map(renderItem)}</nav>
      </TooltipProvider>
    );
  }

  // Grouped mode with optional search filtering
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: q ? group.items.filter((i) => i.label.toLowerCase().includes(q)) : group.items,
  })).filter((group) => group.items.length > 0);

  return (
    <TooltipProvider delayDuration={50}>
      <nav className="space-y-5">
        {groups.length === 0 ? (
          <p className="px-3.5 text-sm text-muted-foreground">No matches.</p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              {!collapsed && group.items.length > 1 && (
                <p className="px-3.5 text-[11px] font-normal uppercase tracking-wide text-muted-foreground/60">
                  {group.label}
                </p>
              )}
              {group.items.map(renderItem)}
            </div>
          ))
        )}
      </nav>
    </TooltipProvider>
  );
}
