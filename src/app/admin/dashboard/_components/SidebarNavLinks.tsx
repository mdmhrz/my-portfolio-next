'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS } from "./nav-items";

interface SidebarNavLinksProps {
  unreadCount: number;
  /** When true, renders icon-only links with Tooltip labels */
  collapsed?: boolean;
  /** Called when a mobile nav link is clicked (to close the sheet) */
  onNavigate?: () => void;
}

/**
 * Renders the navigation link list shared by both the desktop sidebar
 * and the mobile Sheet drawer. Uses NAV_ITEMS as the single source of truth.
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
      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
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
                      <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-foreground text-[8px] font-bold text-background flex items-center justify-center border border-card">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-1.5">
                  {item.label}
                  {hasBadge && (
                    <span className="h-4 px-1 rounded bg-muted text-[9px] font-bold text-foreground">
                      {unreadCount}
                    </span>
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
              className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
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
                <span className="h-4 min-w-4 rounded-full bg-foreground px-1.5 py-0.5 text-[9px] font-bold text-background flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
