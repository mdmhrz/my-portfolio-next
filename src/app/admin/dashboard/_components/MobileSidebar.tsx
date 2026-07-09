'use client';

import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/global/Logo";
import { SidebarNavLinks } from "./SidebarNavLinks";
import { NAV_BOTTOM } from "./nav-items";

interface MobileSidebarProps {
  unreadCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoUrlDark?: string | null;
  logoAltDark?: string | null;
}

/**
 * Mobile Sheet (drawer) sidebar. Visible only on mobile (md:hidden).
 * The trigger (hamburger) lives in the AdminTopbar; this component is just
 * the controlled drawer content.
 */
export function MobileSidebar({
  unreadCount,
  open,
  onOpenChange,
  logoUrl,
  logoAlt,
  logoUrlDark,
  logoAltDark,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 p-0 bg-card border-r border-border text-foreground flex flex-col justify-between h-full"
      >
        {/* Required by Radix Dialog for screen reader accessibility */}
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Top: brand (fixed) */}
        <div className="flex items-center justify-center h-14 border-b border-border px-5 shrink-0">
          <Link
            href="/"
            className="flex items-center justify-center hover:opacity-80 transition-opacity"
            title="Go to home"
            onClick={() => onOpenChange(false)}
          >
            <Logo className="h-8 w-auto" src={logoUrl} alt={logoAlt} srcDark={logoUrlDark} altDark={logoAltDark} />
          </Link>
        </div>

        {/* Scrollable links */}
        <div className="flex-1 overflow-y-auto py-6 px-5 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <SidebarNavLinks
            unreadCount={unreadCount}
            collapsed={false}
            onNavigate={() => onOpenChange(false)}
          />
        </div>

        {/* Pinned bottom: Settings + Account */}
        <div className="border-t border-border px-5 py-4 shrink-0">
          <SidebarNavLinks
            unreadCount={unreadCount}
            collapsed={false}
            items={NAV_BOTTOM}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
