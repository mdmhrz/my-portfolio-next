'use client';

import { User, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavLinks } from "./SidebarNavLinks";
import type { TabValue } from "./nav-items";

interface MobileSidebarProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  unreadCount: number;
  onLogout: () => void;
}

/**
 * Mobile top bar + Sheet (drawer) sidebar.
 * Visible only on mobile (md:hidden).
 * The Sheet slides in from the left and reuses SidebarNavLinks.
 */
export function MobileSidebar({
  activeTab,
  onTabChange,
  unreadCount,
  onLogout,
}: MobileSidebarProps) {
  return (
    <div className="flex md:hidden items-center justify-between px-6 py-4 border-b border-border bg-card text-foreground shrink-0">
      {/* Brand mark */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-sm">
          CMS
        </div>
        <div>
          <h2 className="text-xs font-semibold">Portfolio Admin</h2>
          <span className="text-[9px] font-mono text-green-500 font-medium">ONLINE</span>
        </div>
      </div>

      {/* Sheet trigger — hamburger button */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-accent border border-border cursor-pointer text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-72 p-0 bg-card border-r border-border text-foreground flex flex-col justify-between h-full"
        >
          {/* Required by Radix Dialog for screen reader accessibility */}
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Top: brand + nav links */}
          <div className="flex flex-col gap-6 p-5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-mono font-bold">
                CMS
              </div>
              <div>
                <h2 className="text-sm font-semibold">Portfolio Admin</h2>
                <span className="text-[10px] font-mono text-green-500 font-medium">ONLINE</span>
              </div>
            </div>

            <SidebarNavLinks
              activeTab={activeTab}
              onTabChange={onTabChange}
              unreadCount={unreadCount}
              collapsed={false}
            />
          </div>

          {/* Bottom: user / logout */}
          <div className="p-5 pt-4 border-t border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="truncate">
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
