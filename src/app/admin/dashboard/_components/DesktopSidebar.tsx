'use client';

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/global/Logo";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { NAV_BOTTOM } from "./nav-items";

interface DesktopSidebarProps {
  unreadCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoUrlDark?: string | null;
  logoAltDark?: string | null;
}

/**
 * Desktop-only collapsible sidebar: brand, live nav search, scrollable grouped
 * links, and a pinned bottom section (Settings + Account).
 */
export function DesktopSidebar({
  unreadCount,
  isCollapsed,
  onToggleCollapse,
  logoUrl,
  logoAlt,
  logoUrlDark,
  logoAltDark,
}: DesktopSidebarProps) {
  const [query, setQuery] = useState("");

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0 h-full ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand + collapse toggle */}
      <div className="flex items-center justify-center h-16 border-b border-border relative px-4 shrink-0">
        <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity" title="Go to home">
          <Logo className="h-8 w-auto" src={logoUrl} alt={logoAlt} srcDark={logoUrlDark} altDark={logoAltDark} />
        </Link>
        <Button
          onClick={onToggleCollapse}
          variant="outline"
          size="icon"
          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 h-6 w-6 z-10"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Search (expanded only) */}
      {!isCollapsed && (
        <div className="px-4 pt-4 shrink-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 pl-9"
            />
          </div>
        </div>
      )}

      {/* Nav links (scrollable) */}
      <div className="flex-1 overflow-y-auto py-4 px-4 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <SidebarNavLinks unreadCount={unreadCount} collapsed={isCollapsed} query={query} />
      </div>

      {/* Pinned bottom: Settings + Account */}
      <div className="border-t border-border p-4 shrink-0">
        <SidebarNavLinks unreadCount={unreadCount} collapsed={isCollapsed} items={NAV_BOTTOM} />
      </div>
    </aside>
  );
}
