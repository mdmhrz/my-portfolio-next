'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { toast } from "sonner";

import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { threads, fetchThreads } = usePortfolioStore();

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

  // Hydrate threads once on mount (powers sidebar badge + topbar bell)
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

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

  const unreadCount = threads.filter((t) => t.unread).length;
  const recentMessages = threads
    .filter((t) => t.unread)
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      name: t.contactName || t.contactEmail,
      subject: t.subject,
      message: t.emails[0]?.snippet || t.message?.message || "",
      createdAt: t.lastMessageAt,
    }));

  // Full-screen mode for blog editor — hides admin chrome so the editor owns the viewport
  const pathname = usePathname();
  const isEditorRoute =
    pathname === '/admin/dashboard/blogs/new' ||
    /^\/admin\/dashboard\/blogs\/[^/]+\/edit$/.test(pathname);

  return (
    <div className="fixed inset-0 flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Desktop collapsible sidebar — hidden in editor mode */}
      {!isEditorRoute && (
        <DesktopSidebar
          unreadCount={unreadCount}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      {/* Main column: topbar + content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Admin topbar — hidden in editor mode (editor has its own topbar) */}
        {!isEditorRoute && (
          <AdminTopbar
            unreadCount={unreadCount}
            recentMessages={recentMessages}
            onLogout={handleLogout}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
        )}

        {/* Regular pages: padded scrollable container. Editor: raw flex column. */}
        <main className={
          isEditorRoute
            ? "flex-1 flex flex-col min-h-0 overflow-hidden"
            : "flex-1 overflow-y-auto p-6 md:p-8"
        }>
          {children}
        </main>
      </div>

      {/* Mobile drawer — hidden in editor mode */}
      {!isEditorRoute && (
        <MobileSidebar
          unreadCount={unreadCount}
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
        />
      )}
    </div>
  );
}
