'use client';

import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/global/Logo";
import { SidebarNavLinks } from "./SidebarNavLinks";

interface MobileSidebarProps {
  unreadCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 p-0 bg-card border-r border-border text-foreground flex flex-col justify-between h-full"
      >
        {/* Required by Radix Dialog for screen reader accessibility */}
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        {/* Top: brand + nav links */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center h-14 border-b border-border px-5">
            <Link
              href="/"
              className="flex items-center justify-center hover:opacity-80 transition-opacity"
              title="Go to home"
              onClick={() => onOpenChange(false)}
            >
              <Logo className="h-8 w-auto" />
            </Link>
          </div>
          <div className="px-5">

            <SidebarNavLinks
              unreadCount={unreadCount}
              collapsed={false}
              onNavigate={() => onOpenChange(false)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
