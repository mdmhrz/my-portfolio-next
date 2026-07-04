'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_GROUPS } from "./nav-items";
import { CountBadge } from "@/components/admin/CountBadge";

interface SidebarNavLinksProps {
  unreadCount: number;
  /** When true, renders icon-only links with Tooltip labels */
  collapsed?: boolean;
  /** Called when a mobile nav link is clicked (to close the sheet) */
  onNavigate?: () => void;
}

/**
 * Renders the navigation link list shared by both the desktop sidebar
 * and the mobile Sheet drawer. Uses NAV_GROUPS as the single source of truth,
 * grouping items by domain (Profile, Site Content, Blog, Inbox, …) so the
 * sidebar stays scannable as more modules are added.
 * Active state is derived from usePathname().
 */
export function SidebarNavLinks({
  unreadCount,
  collapsed = false,
  onNavigate,
}: SidebarNavLinksProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={50}>
      <nav className="space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {!collapsed && (
              <p className="px-3.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
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
                        className={`relative flex h-11 w-12 items-center justify-center rounded-lg transition-colors cursor-pointer mx-auto ${
                          isActive
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {hasBadge && (
                          <CountBadge
                            count={unreadCount}
                            className="absolute top-1 right-1 min-w-[16px] h-4 text-[9px] px-1"
                          />
                        )}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-1.5">
                      {item.label}
                      {hasBadge && (
                        <CountBadge count={unreadCount} className="bg-muted text-foreground" />
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.value}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2 transition-colors cursor-pointer text-sm font-medium ${
                    isActive
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {hasBadge && (
                    <CountBadge count={unreadCount} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </TooltipProvider>
  );
}
