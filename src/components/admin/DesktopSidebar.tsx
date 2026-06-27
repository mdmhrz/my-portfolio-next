'use client';

import { User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarNavLinks } from "./SidebarNavLinks";
import type { TabValue } from "./nav-items";

interface DesktopSidebarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  unreadCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

/**
 * Desktop-only collapsible sidebar.
 * Hidden on mobile (md:flex).
 */
export function DesktopSidebar({
  activeTab,
  onTabChange,
  unreadCount,
  isCollapsed,
  onToggleCollapse,
  onLogout,
}: DesktopSidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-border bg-card p-4 transition-all duration-300 shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand + collapse toggle */}
        <div
          className={`flex items-center justify-between border-b border-border pb-4 ${
            isCollapsed ? "flex-col gap-4" : ""
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-mono font-bold">
                CMS
              </div>
              <div>
                <h2 className="text-sm font-semibold">Portfolio Admin</h2>
                <span className="text-[10px] font-mono text-green-500 font-medium">ONLINE</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-sm">
              CMS
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Nav links */}
        <SidebarNavLinks
          activeTab={activeTab}
          onTabChange={onTabChange}
          unreadCount={unreadCount}
          collapsed={isCollapsed}
        />
      </div>

      {/* User / Logout footer */}
      <TooltipProvider delayDuration={50}>
        <div
          className={`pt-4 border-t border-border flex ${
            isCollapsed ? "flex-col gap-4 items-center" : "items-center justify-between gap-3"
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center cursor-default">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Razu Admin (Superuser)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <ThemeToggle />
                </TooltipTrigger>
                <TooltipContent side="right">Toggle Theme</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="truncate max-w-[80px]">
                  <p className="text-xs font-medium text-foreground truncate">Razu Admin</p>
                  <span className="text-[9px] font-mono text-muted-foreground">Superuser</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle />
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </TooltipProvider>
    </aside>
  );
}
