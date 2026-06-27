'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { toast } from "sonner";

// Sidebar components
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";

// Tab content components
import { BannerTab } from "./BannerTab";
import { ExperienceTab } from "./ExperienceTab";
import { ProjectsTab } from "./ProjectsTab";
import { BlogsTab } from "./BlogsTab";
import { MessagesTab } from "./MessagesTab";

import { type TabValue } from "./nav-items";

interface DashboardClientProps {
  initialBanner: any;
  initialExperiences: any[];
  initialProjects: any[];
  initialMessages: any[];
  initialBlogs: any[];
}

export function DashboardClient({
  initialBanner,
  initialExperiences,
  initialProjects,
  initialMessages,
  initialBlogs,
}: DashboardClientProps) {
  const router = useRouter();

  // ── UI state ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabValue>("banner");
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // ── Zustand store ─────────────────────────────────────
  const {
    banner, experiences, projects, messages, blogs,
    setBanner, setExperiences, setProjects, setMessages, setBlogs,
    updateBanner,
    createExperience: addExperience, updateExperience, deleteExperience,
    createProject: addProject, updateProject, deleteProject,
    markMessageRead, deleteMessage,
    createBlog: addBlog, updateBlog, deleteBlog,
  } = usePortfolioStore();

  // Hydrate store from server-rendered initial props (runs once on mount)
  useEffect(() => {
    if (initialBanner) setBanner(initialBanner);
    setExperiences(initialExperiences);
    setProjects(initialProjects);
    setMessages(initialMessages);
    setBlogs(initialBlogs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth ──────────────────────────────────────────────
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

  // ── Shared sidebar props ───────────────────────────────
  const sidebarProps = {
    activeTab,
    onTabChange: setActiveTab,
    unreadCount,
    onLogout: handleLogout,
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">

      {/* Mobile top bar + Sheet drawer (hidden on md+) */}
      <MobileSidebar {...sidebarProps} />

      {/* Desktop collapsible sidebar (hidden on mobile) */}
      <DesktopSidebar
        {...sidebarProps}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* ── Tab Content ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === "banner" && (
          <BannerTab banner={banner} updateBanner={updateBanner} />
        )}
        {activeTab === "experience" && (
          <ExperienceTab
            experiences={experiences}
            addExperience={addExperience}
            updateExperience={updateExperience}
            deleteExperience={deleteExperience}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsTab
            projects={projects}
            experiences={experiences}
            addProject={addProject}
            updateProject={updateProject}
            deleteProject={deleteProject}
          />
        )}
        {activeTab === "blogs" && (
          <BlogsTab
            blogs={blogs}
            addBlog={addBlog}
            updateBlog={updateBlog}
            deleteBlog={deleteBlog}
          />
        )}
        {activeTab === "messages" && (
          <MessagesTab
            messages={messages}
            markMessageRead={markMessageRead}
            deleteMessage={deleteMessage}
          />
        )}
      </main>
    </div>
  );
}
