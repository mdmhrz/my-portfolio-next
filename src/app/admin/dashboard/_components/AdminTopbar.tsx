'use client';

import { Menu, Bell, User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import { authClient } from "@/lib/auth-client";
import { NAV_ITEMS } from "./nav-items";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminTopbarProps {
  unreadCount: number;
  recentMessages: { id: string; name: string; subject?: string | null; message: string; createdAt: string }[];
  onLogout: () => void;
  onOpenMobileNav: () => void;
}

export function AdminTopbar({
  unreadCount,
  recentMessages,
  onLogout,
  onOpenMobileNav,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find((item) => item.href === pathname);
  const pageTitle = activeItem?.label ?? "Dashboard";

  const { data: session } = authClient.useSession();
  const userName = session?.user?.name ?? "Razu Admin";
  const userEmail = session?.user?.email ?? "admin@portfolio.com";
  const userRole = session?.user?.role ?? "Superuser";
  const userImage = session?.user?.image;

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 shrink-0">
      {/* Left: mobile hamburger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          onClick={onOpenMobileNav}
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
      </div>

      {/* Right: notifications + theme + profile */}
      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 min-w-3.5 px-1 rounded-full bg-foreground text-[8px] font-bold text-background flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-wider">
              Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {recentMessages.length === 0 ? (
              <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                No new messages
              </div>
            ) : (
              recentMessages.map((msg) => (
                <DropdownMenuItem key={msg.id} asChild>
                  <Link href="/admin/dashboard/messages" className="flex flex-col gap-0.5 items-start">
                    <span className="text-xs font-semibold text-foreground truncate w-full">
                      {msg.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate w-full">
                      {msg.subject || msg.message}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        {/* User avatar and info dropdown */}
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center h-8 w-8 rounded-full bg-muted hover:bg-accent border border-border cursor-pointer focus:outline-none overflow-hidden">
                {userImage ? (
                  <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="flex items-center gap-3 p-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted border border-border shrink-0 overflow-hidden">
                  {userImage ? (
                    <img src={userImage} alt={userName} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate">{userName}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
                  <span className="text-[9px] font-mono text-green-500 uppercase tracking-wider mt-0.5">{userRole}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard/settings" className="cursor-pointer text-xs flex items-center gap-2">
                  Site Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard/about" className="cursor-pointer text-xs flex items-center gap-2">
                  Edit Bio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="cursor-pointer text-xs text-red-500 focus:text-red-500 focus:bg-red-500/10 flex items-center gap-2 font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of the dashboard?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to the login screen. You can sign back in anytime with your admin credentials.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white">Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
