'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { toast } from "sonner";

import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { messages, fetchMessages } = usePortfolioStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Persist sidebar collapse state in localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("admin-sidebar-collapsed", String(next));
  };

  // Hydrate messages once on mount (powers sidebar badge + topbar bell)
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleLogout = async () => {
    toast.loading("Logging out...", { id: "logout" });
    try {
      await authClient.signOut();
      toast.success("Logged out successfully!", { id: "logout" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Logout failed.", { id: "logout" });
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const recentMessages = messages
    .filter((m) => !m.read)
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      name: m.name,
      subject: null,
      message: m.message,
      createdAt: m.createdAt,
    }));

  return (
    <div className="flex flex-col md:flex-row h-dvh overflow-hidden bg-background text-foreground">
      {/* Desktop collapsible sidebar (hidden on mobile) */}
      <DesktopSidebar
        unreadCount={unreadCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main column: topbar + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminTopbar
          unreadCount={unreadCount}
          recentMessages={recentMessages}
          onLogout={handleLogout}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* Mobile drawer (controlled by topbar hamburger) */}
      <MobileSidebar
        unreadCount={unreadCount}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
    </div>
  );
}
