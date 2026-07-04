'use client';

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/global/Logo";
import { SidebarNavLinks } from "./SidebarNavLinks";

interface DesktopSidebarProps {
  unreadCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * Desktop-only collapsible sidebar.
 * Hidden on mobile (md:flex). Theme toggle + logout live in the topbar.
 */
export function DesktopSidebar({
  unreadCount,
  isCollapsed,
  onToggleCollapse,
}: DesktopSidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-border bg-card transition-all duration-300 shrink-0 ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      <div className="flex flex-col gap-6">
        {/* Brand + collapse toggle */}
        <div className="flex items-center justify-center h-16 border-b border-border relative px-4">
          <Link
            href="/"
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Go to home"
          >
            <Logo className="h-8 w-auto" />
          </Link>
          <Button
            onClick={onToggleCollapse}
            variant="outline"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 h-6 w-6"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        <div className="px-4">
          {/* Nav links */}
          <SidebarNavLinks
            unreadCount={unreadCount}
            collapsed={isCollapsed}
          />
        </div>

      </div>
    </aside>
  );
}
