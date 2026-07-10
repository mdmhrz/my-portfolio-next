import { create } from "zustand";
import { api } from "@/lib/api-client";

export interface BannerData {
  id?: string;
  headline?: string;
  subtitle?: string;
  description: string;
  chips: string[];
  ctaLabel?: string;
  ctaHref?: string;
  backgroundImg?: string | null;
  backgroundAlt?: string | null;
  backgroundTemplate?: string | null;
  layoutTemplate?: string | null;
  animationTemplate?: string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  showcaseImageSide?: string | null;
}

export interface ExperienceData {
  id: string;
  company: string;
  role: string;
  location: string;
  timeline: string;
  description: string;
  logo?: string | null;
  logoAlt?: string | null;
  order: number;
  projects?: ProjectData[];
}

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  role?: string | null;
  company?: string | null;
  timeline?: string | null;
  desc: string;
  fullDesc: string;
  tech: string[];
  features: string[];
  contributions: string[];
  live?: string | null;
  image: string;
  imageAlt?: string | null;
  featured: boolean;
  span?: string | null;
  architectureTitle?: string | null;
  architectureDesc?: string | null;
  architectureTree?: string | null;
  metrics?: any;
  order: number;
  experienceId?: string | null;
}

export interface ProfileData {
  id?: string;
  name: string;
  designation: string;
  bio: string;
  longBio?: string | null;
  avatarUrl?: string | null;
  avatarAlt?: string | null;
  resumeUrl?: string | null;
  location?: string | null;
  availability?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
}

export interface SiteSettingsData {
  id?: string;
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoUrlDark?: string | null;
  logoAltDark?: string | null;
  faviconUrl?: string | null;
  // Homepage "Featured Articles" slider controls
  homepageBlogTitle?: string | null;
  homepageBlogSubtitle?: string | null;
  homepageBlogTemplate?: string | null;
  // Homepage Testimonials section controls
  homepageTestimonialsTitle?: string | null;
  homepageTestimonialsSubtitle?: string | null;
  homepageTestimonialsTemplate?: string | null;
  homepageTestimonialsStat?: string | null;
  homepageTestimonialsStatLabel?: string | null;
  homepageTestimonialsCtaText?: string | null;
  homepageTestimonialsCtaLink?: string | null;
}

export interface TestimonialData {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  avatarUrl?: string | null;
  avatarAlt?: string | null;
  rating?: number | null;
  videoUrl?: string | null;
  highlight?: string | null;
  highlightLabel?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CtaData {
  id?: string;
  headline: string;
  subtext: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface FooterData {
  id?: string;
  bio?: string | null;
  availabilityBadge: string;
  availabilityText: string;
  location: string;
  primaryStack: string;
  copyrightName: string;
}

export interface NavLinkData {
  id: string;
  label: string;
  href: string;
  order: number;
  showInNav: boolean;
  showInFooter: boolean;
}

export interface SectionConfigData {
  id: string;
  key: string;
  visible: boolean;
  order: number;
}

export interface SkillData {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  iconAlt?: string | null;
  order: number;
  createdAt: string;
}

export interface MessageData {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AttachmentData {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  size?: number | null;
}

export interface EmailMessageData {
  id: string;
  threadId: string;
  gmailMessageId?: string | null;
  direction: "inbound" | "outbound";
  fromEmail: string;
  toEmail: string;
  subject?: string | null;
  bodyHtml: string;
  snippet?: string | null;
  attachments: AttachmentData[];
  sentAt: string;
}

export interface ThreadData {
  id: string;
  gmailThreadId?: string | null;
  contactEmail: string;
  contactName?: string | null;
  subject?: string | null;
  unread: boolean;
  lastMessageAt: string;
  message?: MessageData | null;
  emails: EmailMessageData[];
}

export interface BlogData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  category?: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  readingTime: number;
  views: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobStatusEventData {
  id: string;
  jobId: string;
  status: string;
  note?: string | null;
  source: string;
  gmailMessageId?: string | null;
  createdAt: string;
}

export interface UnmatchedJobEmailData {
  id: string;
  gmailMessageId: string;
  gmailThreadId?: string | null;
  fromEmail: string;
  fromName?: string | null;
  subject?: string | null;
  snippet?: string | null;
  suggestedStatus: string;
  receivedAt: string;
  createdAt: string;
}

export interface JobTrackerSettingsData {
  id?: string;
  gmailLabel: string;
  updatedAt?: string;
}

// `value` is only ever present on fields returned by revealVaultItem() — the
// masked list/detail reads never include it, and it must never be persisted
// outside component-local state (no localStorage, no long-lived store field).
export interface VaultFieldData {
  id?: string;
  label: string;
  type: string; // "text" | "password" | "url" | "textarea" | "json" | "env" | "number"
  order: number;
  value?: string;
}

export interface VaultAuditLogData {
  id: string;
  vaultItemId: string | null;
  action: string; // "created" | "opened" | "copied" | "updated" | "deleted" | "restored"
  fieldLabel?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface VaultRevealResult {
  success: boolean;
  requiresPassword?: boolean;
  error?: string;
  data?: VaultFieldData[];
}

// Metadata only (field labels, no values) — browsing history never requires a reveal.
export interface VaultHistoryData {
  id: string;
  changedAt: string;
  fieldLabels: string[];
}

export interface VaultRestoreResult {
  success: boolean;
  requiresPassword?: boolean;
  error?: string;
  data?: VaultItemData;
}

export interface VaultItemData {
  id: string;
  title: string;
  category: string;
  description?: string | null;
  tags: string[];
  favorite: boolean;
  expiresAt?: string | null;
  fields: VaultFieldData[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultAttachmentData {
  id: string;
  name: string;
  mimeType: string;
  size: number | null;
  provider: string; // "r2" | "drive"
  mirrorOfId?: string | null; // set on a Drive backup copy, points at the R2 FileAsset it mirrors
  shareEnabled?: boolean; // File Manager "Share" action — unused by Vault attachments
  shareToken?: string | null;
  shareExpiresAt?: string | null; // null = shared until manually revoked
  createdAt: string;
}

// Same "200 even when re-auth is needed" shape as VaultRevealResult — an
// attachment download is gated identically to a field reveal.
export interface VaultAttachmentRevealResult {
  success: boolean;
  requiresPassword?: boolean;
  error?: string;
  data?: { url: string; name: string; mimeType: string };
}

// --- File Manager ---
// Standalone document explorer at /admin/dashboard/files — a second
// consumer of the same FileAsset primitive Vault attachments use, scoped to
// relatedModule: "file-manager" and organized by folderId instead of a
// vault item. See file-manager-plan.md.
export interface FileManagerFolderData {
  id: string;
  name: string;
  parentId: string | null;
  subfolderCount: number;
  fileCount: number;
  createdAt: string;
}

export interface FolderTreeItem {
  id: string;
  name: string;
  parentId: string | null;
}

export interface FileManagerFileData extends VaultAttachmentData {
  folderId: string | null;
}

export interface FolderContentsResult {
  breadcrumb: { id: string; name: string }[];
  subfolders: FileManagerFolderData[];
  files: FileManagerFileData[];
}

export interface JobApplicationData {
  id: string;
  company: string;
  position: string;
  companyLogo?: string | null;
  jobUrl?: string | null;
  source: string;
  applicationType: string;
  status: string;
  deadline?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  location?: string | null;
  workMode?: string | null;
  resumeVersion?: string | null;
  coverLetterVersion?: string | null;
  notes?: string | null;
  appliedAt?: string | null;
  gmailThreadId?: string | null;
  calendarEventId?: string | null;
  calendarEventLink?: string | null;
  order: number;
  events?: JobStatusEventData[];
  createdAt: string;
  updatedAt: string;
}

interface PortfolioStore {
  banner: BannerData | null;
  experiences: ExperienceData[];
  projects: ProjectData[];
  testimonials: TestimonialData[];
  jobs: JobApplicationData[];
  vaultItems: VaultItemData[];
  unmatchedJobEmails: UnmatchedJobEmailData[];
  jobTrackerSettings: JobTrackerSettingsData | null;
  threads: ThreadData[];
  gmailConnected: boolean;
  gmailEmail: string | null;
  blogs: BlogData[];
  profile: ProfileData | null;
  settings: SiteSettingsData | null;
  skills: SkillData[];
  cta: CtaData | null;
  footer: FooterData | null;
  navLinks: NavLinkData[];
  sections: SectionConfigData[];
  loading: Record<string, boolean>;

  fetchBanner: () => Promise<void>;
  updateBanner: (data: BannerData) => Promise<void>;

  fetchCta: () => Promise<void>;
  updateCta: (data: CtaData) => Promise<void>;

  fetchFooter: () => Promise<void>;
  updateFooter: (data: FooterData) => Promise<void>;

  fetchNavLinks: () => Promise<void>;
  createNavLink: (data: Omit<NavLinkData, "id" | "order">) => Promise<void>;
  updateNavLink: (id: string, data: Partial<NavLinkData>) => Promise<void>;
  deleteNavLink: (id: string) => Promise<void>;
  reorderNavLinks: (items: NavLinkData[]) => Promise<void>;

  fetchSections: () => Promise<void>;
  updateSections: (items: SectionConfigData[]) => Promise<void>;

  fetchExperiences: () => Promise<void>;
  createExperience: (data: Omit<ExperienceData, "id">) => Promise<void>;
  updateExperience: (id: string, data: Partial<ExperienceData>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;

  fetchProjects: () => Promise<void>;
  createProject: (data: Omit<ProjectData, "id">) => Promise<void>;
  updateProject: (id: string, data: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  fetchTestimonials: () => Promise<void>;
  createTestimonial: (data: Omit<TestimonialData, "id" | "order" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTestimonial: (id: string, data: Partial<TestimonialData>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  reorderTestimonials: (items: TestimonialData[]) => Promise<void>;

  fetchJobs: () => Promise<void>;
  createJob: (data: Partial<JobApplicationData>) => Promise<void>;
  updateJob: (id: string, data: Partial<JobApplicationData>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  reorderJobs: (items: JobApplicationData[]) => Promise<void>;
  addJobEvent: (id: string, data: { status?: string; note?: string }) => Promise<void>;

  fetchUnmatchedJobEmails: () => Promise<void>;
  linkUnmatchedJobEmail: (id: string, jobId: string) => Promise<void>;
  dismissUnmatchedJobEmail: (id: string) => Promise<void>;
  fetchJobTrackerSettings: () => Promise<void>;
  updateJobTrackerSettings: (data: { gmailLabel: string }) => Promise<void>;
  syncJobGmail: () => Promise<{ matched: number; unmatched: number; scanned: number }>;

  addJobToCalendar: (id: string, data: { title: string; description?: string; startTime: string; durationMinutes?: number }) => Promise<void>;
  removeJobFromCalendar: (id: string) => Promise<void>;

  fetchVaultItems: () => Promise<void>;
  createVaultItem: (data: {
    title: string;
    category: string;
    description?: string | null;
    tags?: string[];
    favorite?: boolean;
    expiresAt?: string | null;
    fields: { label: string; type?: string; value: string }[];
  }) => Promise<void>;
  updateVaultItem: (id: string, data: {
    title?: string;
    category?: string;
    description?: string | null;
    tags?: string[];
    favorite?: boolean;
    expiresAt?: string | null;
    fields?: { label: string; type?: string; value: string }[];
  }) => Promise<void>;
  deleteVaultItem: (id: string) => Promise<void>;
  revealVaultItem: (id: string, password?: string) => Promise<VaultRevealResult>;
  fetchVaultAuditLog: (id: string) => Promise<VaultAuditLogData[]>;
  logVaultCopy: (id: string, fieldLabel?: string) => void;
  fetchVaultHistory: (id: string) => Promise<VaultHistoryData[]>;
  restoreVaultItemVersion: (id: string, historyId: string, password?: string) => Promise<VaultRestoreResult>;

  fetchVaultAttachments: (vaultItemId: string) => Promise<VaultAttachmentData[]>;
  uploadVaultAttachment: (vaultItemId: string, file: File) => Promise<VaultAttachmentData>;
  deleteVaultAttachment: (fileId: string) => Promise<void>;
  revealVaultAttachment: (vaultItemId: string, fileId: string, password?: string) => Promise<VaultAttachmentRevealResult>;
  backupFileToDrive: (fileId: string) => Promise<VaultAttachmentData>;
  getFileUrl: (fileId: string) => Promise<{ url: string; name: string; mimeType: string }>;
  createShareLink: (fileId: string, expiresInHours: number | null) => Promise<{ url: string; shareEnabled: boolean; shareExpiresAt: string | null }>;
  revokeShareLink: (fileId: string) => Promise<void>;
  fetchRecentFiles: (limit?: number) => Promise<FileManagerFileData[]>;
  fetchStorageStats: () => Promise<{ totalBytes: number; fileCount: number }>;

  fetchFolderTree: () => Promise<FolderTreeItem[]>;
  fetchFolderContents: (folderId: string | null) => Promise<FolderContentsResult>;
  createFolder: (name: string, parentId: string | null) => Promise<FileManagerFolderData>;
  renameFolder: (id: string, name: string) => Promise<FileManagerFolderData>;
  moveFolder: (id: string, parentId: string | null) => Promise<FileManagerFolderData>;
  deleteFolder: (id: string) => Promise<{ deletedFolders: number; deletedFiles: number }>;
  uploadFileManagerFile: (file: File, folderId: string | null) => Promise<FileManagerFileData>;
  renameFile: (id: string, name: string) => Promise<FileManagerFileData>;
  moveFile: (id: string, folderId: string | null) => Promise<FileManagerFileData>;
  deleteFile: (id: string) => Promise<void>;

  fetchThreads: () => Promise<void>;
  fetchThread: (id: string) => Promise<ThreadData | null>;
  markThreadRead: (id: string, unread: boolean) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  sendEmail: (data: {
    threadId?: string;
    to: string;
    toName?: string;
    subject: string;
    bodyHtml: string;
    attachments?: { url: string; fileName: string; mimeType: string }[];
  }) => Promise<ThreadData["id"]>;
  fetchGmailStatus: () => Promise<void>;
  syncGmailNow: () => Promise<void>;
  disconnectGmail: () => Promise<void>;

  fetchBlogs: () => Promise<void>;
  createBlog: (data: Omit<BlogData, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateBlog: (id: string, data: Partial<BlogData>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSettings: (data: SiteSettingsData) => Promise<void>;

  fetchSkills: () => Promise<void>;
  createSkill: (data: Omit<SkillData, "id" | "createdAt">) => Promise<void>;
  updateSkill: (id: string, data: Partial<SkillData>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;

  setBanner: (banner: BannerData | null) => void;
  setExperiences: (experiences: ExperienceData[]) => void;
  setProjects: (projects: ProjectData[]) => void;
  setThreads: (threads: ThreadData[]) => void;
  setBlogs: (blogs: BlogData[]) => void;
  setProfile: (profile: ProfileData | null) => void;
  setSettings: (settings: SiteSettingsData | null) => void;
  setSkills: (skills: SkillData[]) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  banner: null,
  experiences: [],
  projects: [],
  testimonials: [],
  jobs: [],
  vaultItems: [],
  unmatchedJobEmails: [],
  jobTrackerSettings: null,
  threads: [],
  gmailConnected: false,
  gmailEmail: null,
  blogs: [],
  profile: null,
  settings: null,
  skills: [],
  cta: null,
  footer: null,
  navLinks: [],
  sections: [],
  loading: {},

  setBanner: (banner) => set({ banner }),
  setExperiences: (experiences) => set({ experiences }),
  setProjects: (projects) => set({ projects }),
  setThreads: (threads) => set({ threads }),
  setBlogs: (blogs) => set({ blogs }),
  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),
  setSkills: (skills) => set({ skills }),

  setLoading: (key: string, val: boolean) => {
    set((state) => ({ loading: { ...state.loading, [key]: val } }));
  },

  // Banner Actions
  fetchBanner: async () => {
    try {
      const res = await api.get("/admin/banner");
      set({ banner: res.data.data });
    } catch (err) {
      console.error("Error fetching banner:", err);
    }
  },
  updateBanner: async (data) => {
    try {
      const res = await api.post("/admin/banner", data);
      set({ banner: res.data.data });
    } catch (err) {
      console.error("Error updating banner:", err);
      throw err;
    }
  },

  // CTA Actions
  fetchCta: async () => {
    try {
      const res = await api.get("/admin/cta");
      set({ cta: res.data.data });
    } catch (err) {
      console.error("Error fetching CTA:", err);
    }
  },
  updateCta: async (data) => {
    try {
      const res = await api.post("/admin/cta", data);
      set({ cta: res.data.data });
    } catch (err) {
      console.error("Error updating CTA:", err);
      throw err;
    }
  },

  // Footer Actions
  fetchFooter: async () => {
    try {
      const res = await api.get("/admin/footer");
      set({ footer: res.data.data });
    } catch (err) {
      console.error("Error fetching footer:", err);
    }
  },
  updateFooter: async (data) => {
    try {
      const res = await api.post("/admin/footer", data);
      set({ footer: res.data.data });
    } catch (err) {
      console.error("Error updating footer:", err);
      throw err;
    }
  },

  // NavLink Actions
  fetchNavLinks: async () => {
    try {
      const res = await api.get("/admin/nav-links");
      set({ navLinks: res.data.data });
    } catch (err) {
      console.error("Error fetching nav links:", err);
    }
  },
  createNavLink: async (data) => {
    try {
      const res = await api.post("/admin/nav-links", data);
      set((state) => ({ navLinks: [...state.navLinks, res.data.data].sort((a, b) => a.order - b.order) }));
    } catch (err) {
      console.error("Error creating nav link:", err);
      throw err;
    }
  },
  updateNavLink: async (id, data) => {
    try {
      const res = await api.put(`/admin/nav-links/${id}`, data);
      set((state) => ({
        navLinks: state.navLinks.map((l) => (l.id === id ? res.data.data : l)),
      }));
    } catch (err) {
      console.error("Error updating nav link:", err);
      throw err;
    }
  },
  deleteNavLink: async (id) => {
    try {
      await api.delete(`/admin/nav-links/${id}`);
      set((state) => ({ navLinks: state.navLinks.filter((l) => l.id !== id) }));
    } catch (err) {
      console.error("Error deleting nav link:", err);
      throw err;
    }
  },
  reorderNavLinks: async (items) => {
    // Optimistic: reflect the new order instantly, resync from server on failure.
    set({ navLinks: items });
    try {
      await api.put("/admin/nav-links/reorder", {
        items: items.map((l, i) => ({ id: l.id, order: i })),
      });
    } catch (err) {
      console.error("Error reordering nav links:", err);
      await get().fetchNavLinks();
      throw err;
    }
  },

  // SectionConfig Actions
  fetchSections: async () => {
    try {
      const res = await api.get("/admin/sections");
      set({ sections: res.data.data });
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  },
  updateSections: async (items) => {
    // Optimistic: reflect toggle/reorder instantly, resync from server on failure.
    set({ sections: items });
    try {
      await api.put("/admin/sections", {
        items: items.map((s, i) => ({ key: s.key, visible: s.visible, order: i })),
      });
    } catch (err) {
      console.error("Error updating sections:", err);
      await get().fetchSections();
      throw err;
    }
  },

  // Experience Actions
  fetchExperiences: async () => {
    try {
      const res = await api.get("/admin/experiences");
      set({ experiences: res.data.data });
    } catch (err) {
      console.error("Error fetching experiences:", err);
    }
  },
  createExperience: async (data) => {
    try {
      const res = await api.post("/admin/experiences", data);
      set((state) => ({ experiences: [...state.experiences, res.data.data].sort((a, b) => a.order - b.order) }));
    } catch (err) {
      console.error("Error creating experience:", err);
      throw err;
    }
  },
  updateExperience: async (id, data) => {
    try {
      const res = await api.put(`/admin/experiences/${id}`, data);
      set((state) => ({
        experiences: state.experiences.map((exp) => (exp.id === id ? res.data.data : exp)).sort((a, b) => a.order - b.order),
      }));
    } catch (err) {
      console.error("Error updating experience:", err);
      throw err;
    }
  },
  deleteExperience: async (id) => {
    try {
      await api.delete(`/admin/experiences/${id}`);
      set((state) => ({ experiences: state.experiences.filter((exp) => exp.id !== id) }));
    } catch (err) {
      console.error("Error deleting experience:", err);
      throw err;
    }
  },

  // Project Actions
  fetchProjects: async () => {
    try {
      const res = await api.get("/admin/projects");
      set({ projects: res.data.data });
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  },
  createProject: async (data) => {
    try {
      const res = await api.post("/admin/projects", data);
      set((state) => ({ projects: [...state.projects, res.data.data].sort((a, b) => a.order - b.order) }));
    } catch (err) {
      console.error("Error creating project:", err);
      throw err;
    }
  },
  updateProject: async (id, data) => {
    try {
      const res = await api.put(`/admin/projects/${id}`, data);
      set((state) => ({
        projects: state.projects.map((proj) => (proj.id === id ? res.data.data : proj)).sort((a, b) => a.order - b.order),
      }));
    } catch (err) {
      console.error("Error updating project:", err);
      throw err;
    }
  },
  deleteProject: async (id) => {
    try {
      await api.delete(`/admin/projects/${id}`);
      set((state) => ({ projects: state.projects.filter((proj) => proj.id !== id) }));
    } catch (err) {
      console.error("Error deleting project:", err);
      throw err;
    }
  },

  // Gmail Inbox Actions
  fetchThreads: async () => {
    try {
      const res = await api.get("/admin/threads");
      set({ threads: res.data.data });
    } catch (err) {
      console.error("Error fetching threads:", err);
    }
  },
  fetchThread: async (id) => {
    try {
      const res = await api.get(`/admin/threads/${id}`);
      const thread: ThreadData = res.data.data;
      set((state) => ({
        threads: state.threads.map((t) => (t.id === id ? thread : t)),
      }));
      return thread;
    } catch (err) {
      console.error("Error fetching thread:", err);
      return null;
    }
  },
  markThreadRead: async (id, unread) => {
    try {
      const res = await api.put(`/admin/threads/${id}`, { unread });
      set((state) => ({
        threads: state.threads.map((t) => (t.id === id ? { ...t, unread: res.data.data.unread } : t)),
      }));
    } catch (err) {
      console.error("Error marking thread as read:", err);
      throw err;
    }
  },
  deleteThread: async (id) => {
    try {
      await api.delete(`/admin/threads/${id}`);
      set((state) => ({ threads: state.threads.filter((t) => t.id !== id) }));
    } catch (err) {
      console.error("Error deleting thread:", err);
      throw err;
    }
  },
  sendEmail: async (data) => {
    try {
      const res = await api.post("/admin/gmail/send", data);
      const threadId: string = res.data.data.threadId;
      await get().fetchThreads();
      await get().fetchThread(threadId);
      return threadId;
    } catch (err) {
      console.error("Error sending email:", err);
      throw err;
    }
  },
  fetchGmailStatus: async () => {
    try {
      const res = await api.get("/admin/gmail/status");
      set({ gmailConnected: res.data.connected, gmailEmail: res.data.email });
    } catch (err) {
      console.error("Error fetching Gmail status:", err);
    }
  },
  syncGmailNow: async () => {
    try {
      await api.post("/admin/gmail/sync");
      await get().fetchThreads();
    } catch (err) {
      console.error("Error syncing Gmail:", err);
      throw err;
    }
  },
  disconnectGmail: async () => {
    try {
      await api.delete("/admin/gmail/status");
      set({ gmailConnected: false, gmailEmail: null });
    } catch (err) {
      console.error("Error disconnecting Gmail:", err);
      throw err;
    }
  },

  // Blog Actions
  fetchBlogs: async () => {
    try {
      const res = await api.get("/admin/blogs");
      set({ blogs: res.data.data });
    } catch (err) {
      console.error("Error fetching blogs:", err);
    }
  },
  createBlog: async (data) => {
    try {
      const res = await api.post("/admin/blogs", data);
      set((state) => ({ blogs: [res.data.data, ...state.blogs] }));
    } catch (err) {
      console.error("Error creating blog:", err);
      throw err;
    }
  },
  updateBlog: async (id, data) => {
    try {
      const res = await api.put(`/admin/blogs/${id}`, data);
      set((state) => ({
        blogs: state.blogs.map((b) => (b.id === id ? res.data.data : b)),
      }));
    } catch (err) {
      console.error("Error updating blog:", err);
      throw err;
    }
  },
  deleteBlog: async (id) => {
    try {
      await api.delete(`/admin/blogs/${id}`);
      set((state) => ({ blogs: state.blogs.filter((b) => b.id !== id) }));
    } catch (err) {
      console.error("Error deleting blog:", err);
      throw err;
    }
  },

  // Profile Actions
  fetchProfile: async () => {
    try {
      const res = await api.get("/admin/profile");
      set({ profile: res.data.data });
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  },
  updateProfile: async (data) => {
    try {
      const res = await api.post("/admin/profile", data);
      set({ profile: res.data.data });
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  },

  // SiteSettings Actions
  fetchSettings: async () => {
    try {
      const res = await api.get("/admin/settings");
      set({ settings: res.data.data });
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  },
  updateSettings: async (data) => {
    try {
      const res = await api.post("/admin/settings", data);
      set({ settings: res.data.data });
    } catch (err) {
      console.error("Error updating settings:", err);
      throw err;
    }
  },

  // Skills Actions
  fetchSkills: async () => {
    try {
      const res = await api.get("/admin/skills");
      set({ skills: res.data.data });
    } catch (err) {
      console.error("Error fetching skills:", err);
    }
  },
  createSkill: async (data) => {
    try {
      const res = await api.post("/admin/skills", data);
      set((state) => ({ skills: [...state.skills, res.data.data].sort((a, b) => a.order - b.order) }));
    } catch (err) {
      console.error("Error creating skill:", err);
      throw err;
    }
  },
  updateSkill: async (id, data) => {
    try {
      const res = await api.put(`/admin/skills/${id}`, data);
      set((state) => ({
        skills: state.skills.map((s) => (s.id === id ? res.data.data : s)).sort((a, b) => a.order - b.order),
      }));
    } catch (err) {
      console.error("Error updating skill:", err);
      throw err;
    }
  },
  deleteSkill: async (id) => {
    try {
      await api.delete(`/admin/skills/${id}`);
      set((state) => ({ skills: state.skills.filter((s) => s.id !== id) }));
    } catch (err) {
      console.error("Error deleting skill:", err);
      throw err;
    }
  },

  // Testimonials Actions
  fetchTestimonials: async () => {
    try {
      const res = await api.get("/admin/testimonials");
      set({ testimonials: res.data.data });
    } catch (err) {
      console.error("Error fetching testimonials:", err);
    }
  },
  createTestimonial: async (data) => {
    try {
      const res = await api.post("/admin/testimonials", data);
      set((state) => ({ testimonials: [...state.testimonials, res.data.data].sort((a, b) => a.order - b.order) }));
    } catch (err) {
      console.error("Error creating testimonial:", err);
      throw err;
    }
  },
  updateTestimonial: async (id, data) => {
    try {
      const res = await api.put(`/admin/testimonials/${id}`, data);
      set((state) => ({
        testimonials: state.testimonials.map((t) => (t.id === id ? res.data.data : t)).sort((a, b) => a.order - b.order),
      }));
    } catch (err) {
      console.error("Error updating testimonial:", err);
      throw err;
    }
  },
  deleteTestimonial: async (id) => {
    try {
      await api.delete(`/admin/testimonials/${id}`);
      set((state) => ({ testimonials: state.testimonials.filter((t) => t.id !== id) }));
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      throw err;
    }
  },
  reorderTestimonials: async (items) => {
    // Optimistic: reflect the new order instantly, resync from server on failure.
    set({ testimonials: items });
    try {
      await api.put("/admin/testimonials/reorder", {
        items: items.map((t, i) => ({ id: t.id, order: i })),
      });
    } catch (err) {
      console.error("Error reordering testimonials:", err);
      await get().fetchTestimonials();
      throw err;
    }
  },

  // Job Tracker Actions
  fetchJobs: async () => {
    try {
      const res = await api.get("/admin/jobs");
      set({ jobs: res.data.data });
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  },
  createJob: async (data) => {
    try {
      const res = await api.post("/admin/jobs", data);
      set((state) => ({ jobs: [res.data.data, ...state.jobs] }));
    } catch (err) {
      console.error("Error creating job:", err);
      throw err;
    }
  },
  updateJob: async (id, data) => {
    try {
      const res = await api.patch(`/admin/jobs/${id}`, data);
      set((state) => ({ jobs: state.jobs.map((j) => (j.id === id ? res.data.data : j)) }));
    } catch (err) {
      console.error("Error updating job:", err);
      throw err;
    }
  },
  deleteJob: async (id) => {
    try {
      await api.delete(`/admin/jobs/${id}`);
      set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
    } catch (err) {
      console.error("Error deleting job:", err);
      throw err;
    }
  },
  reorderJobs: async (items) => {
    // Optimistic: reflect the new order instantly, resync from server on failure.
    set({ jobs: items });
    try {
      await api.put("/admin/jobs/reorder", {
        items: items.map((j, i) => ({ id: j.id, order: i })),
      });
    } catch (err) {
      console.error("Error reordering jobs:", err);
      await get().fetchJobs();
      throw err;
    }
  },
  addJobEvent: async (id, data) => {
    try {
      const res = await api.post(`/admin/jobs/${id}/events`, data);
      set((state) => ({
        jobs: state.jobs.map((j) =>
          j.id === id ? { ...j, events: [res.data.data, ...(j.events ?? [])] } : j
        ),
      }));
    } catch (err) {
      console.error("Error adding job event:", err);
      throw err;
    }
  },

  // Job Gmail Scan Actions
  fetchUnmatchedJobEmails: async () => {
    try {
      const res = await api.get("/admin/jobs/unmatched-emails");
      set({ unmatchedJobEmails: res.data.data });
    } catch (err) {
      console.error("Error fetching unmatched job emails:", err);
    }
  },
  linkUnmatchedJobEmail: async (id, jobId) => {
    try {
      const res = await api.post(`/admin/jobs/unmatched-emails/${id}/link`, { jobId });
      set((state) => ({
        unmatchedJobEmails: state.unmatchedJobEmails.filter((e) => e.id !== id),
        jobs: state.jobs.map((j) => (j.id === jobId ? res.data.data : j)),
      }));
    } catch (err) {
      console.error("Error linking job email:", err);
      throw err;
    }
  },
  dismissUnmatchedJobEmail: async (id) => {
    try {
      await api.delete(`/admin/jobs/unmatched-emails/${id}`);
      set((state) => ({ unmatchedJobEmails: state.unmatchedJobEmails.filter((e) => e.id !== id) }));
    } catch (err) {
      console.error("Error dismissing job email:", err);
      throw err;
    }
  },
  fetchJobTrackerSettings: async () => {
    try {
      const res = await api.get("/admin/jobs/settings");
      set({ jobTrackerSettings: res.data.data });
    } catch (err) {
      console.error("Error fetching job tracker settings:", err);
    }
  },
  updateJobTrackerSettings: async (data) => {
    try {
      const res = await api.patch("/admin/jobs/settings", data);
      set({ jobTrackerSettings: res.data.data });
    } catch (err) {
      console.error("Error updating job tracker settings:", err);
      throw err;
    }
  },
  syncJobGmail: async () => {
    const res = await api.post("/admin/jobs/gmail-scan");
    await Promise.all([get().fetchJobs(), get().fetchUnmatchedJobEmails()]);
    return res.data.data;
  },

  addJobToCalendar: async (id, data) => {
    try {
      const res = await api.post(`/admin/jobs/${id}/calendar`, data);
      set((state) => ({ jobs: state.jobs.map((j) => (j.id === id ? res.data.data : j)) }));
    } catch (err) {
      console.error("Error adding job to calendar:", err);
      throw err;
    }
  },
  removeJobFromCalendar: async (id) => {
    try {
      const res = await api.delete(`/admin/jobs/${id}/calendar`);
      set((state) => ({ jobs: state.jobs.map((j) => (j.id === id ? res.data.data : j)) }));
    } catch (err) {
      console.error("Error removing job from calendar:", err);
      throw err;
    }
  },

  // Secrets Vault Actions
  fetchVaultItems: async () => {
    try {
      const res = await api.get("/admin/vault");
      set({ vaultItems: res.data.data });
    } catch (err) {
      console.error("Error fetching vault items:", err);
    }
  },
  createVaultItem: async (data) => {
    try {
      const res = await api.post("/admin/vault", data);
      set((state) => ({ vaultItems: [res.data.data, ...state.vaultItems] }));
    } catch (err) {
      console.error("Error creating vault item:", err);
      throw err;
    }
  },
  updateVaultItem: async (id, data) => {
    try {
      const res = await api.patch(`/admin/vault/${id}`, data);
      set((state) => ({ vaultItems: state.vaultItems.map((v) => (v.id === id ? res.data.data : v)) }));
    } catch (err) {
      console.error("Error updating vault item:", err);
      throw err;
    }
  },
  deleteVaultItem: async (id) => {
    try {
      await api.delete(`/admin/vault/${id}`);
      set((state) => ({ vaultItems: state.vaultItems.filter((v) => v.id !== id) }));
    } catch (err) {
      console.error("Error deleting vault item:", err);
      throw err;
    }
  },
  // Deliberately does not touch `vaultItems` state — revealed plaintext lives
  // only in the calling component's local state, never in the store. Returns
  // the whole response body (not just `.data`) since `requiresPassword` is a
  // normal step in the flow, not an error — showToast:false so the caller
  // decides how to surface it instead of a generic axios interceptor toast.
  revealVaultItem: async (id, password) => {
    const res = await api.post(
      `/admin/vault/${id}/reveal`,
      password ? { password } : {},
      { showToast: false }
    );
    return res.data as VaultRevealResult;
  },
  fetchVaultAuditLog: async (id) => {
    const res = await api.get(`/admin/vault/${id}/audit`);
    return res.data.data as VaultAuditLogData[];
  },
  // Fire-and-forget — a copy should never feel slower because of logging.
  logVaultCopy: (id, fieldLabel) => {
    api.post(`/admin/vault/${id}/audit`, { fieldLabel }, { showToast: false }).catch(() => {});
  },
  fetchVaultHistory: async (id) => {
    const res = await api.get(`/admin/vault/${id}/history`);
    return res.data.data as VaultHistoryData[];
  },
  // Same "200 even when re-auth is needed" shape as revealVaultItem — restoring
  // is exactly as sensitive as revealing, so it goes through the same dance.
  restoreVaultItemVersion: async (id, historyId, password) => {
    const res = await api.post(
      `/admin/vault/${id}/history/${historyId}/restore`,
      password ? { password } : {},
      { showToast: false }
    );
    if (res.data.success) {
      set((state) => ({ vaultItems: state.vaultItems.map((v) => (v.id === id ? res.data.data : v)) }));
    }
    return res.data as VaultRestoreResult;
  },

  fetchVaultAttachments: async (vaultItemId) => {
    const res = await api.get("/admin/files", { params: { relatedModule: "vault", relatedId: vaultItemId } });
    return res.data.data as VaultAttachmentData[];
  },
  uploadVaultAttachment: async (vaultItemId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("relatedModule", "vault");
    formData.append("relatedId", vaultItemId);
    const res = await api.post("/admin/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data as VaultAttachmentData;
  },
  deleteVaultAttachment: async (fileId) => {
    await api.delete(`/admin/files/${fileId}`);
  },
  // Deliberately does not touch any store state — same reasoning as
  // revealVaultItem, plus the URL is short-lived and only ever used once.
  revealVaultAttachment: async (vaultItemId, fileId, password) => {
    const res = await api.post(
      `/admin/vault/${vaultItemId}/attachments/${fileId}/download`,
      password ? { password } : {},
      { showToast: false }
    );
    return res.data as VaultAttachmentRevealResult;
  },
  backupFileToDrive: async (fileId) => {
    const res = await api.post(`/admin/files/${fileId}/backup-to-drive`);
    return res.data.data as VaultAttachmentData;
  },

  getFileUrl: async (fileId) => {
    const res = await api.get(`/admin/files/${fileId}`);
    return res.data.data as { url: string; name: string; mimeType: string };
  },
  createShareLink: async (fileId, expiresInHours) => {
    const res = await api.post(`/admin/files/${fileId}/share`, { expiresInHours });
    return res.data.data as { url: string; shareEnabled: boolean; shareExpiresAt: string | null };
  },
  revokeShareLink: async (fileId) => {
    await api.delete(`/admin/files/${fileId}/share`);
  },
  fetchRecentFiles: async (limit = 8) => {
    const res = await api.get("/admin/files", { params: { relatedModule: "file-manager", limit } });
    return (res.data.data as FileManagerFileData[]).filter((f) => f.provider === "r2");
  },
  // Real total across every folder — no fabricated quota/percentage. R2 has
  // no fixed cap, so a fake "X of Y GB" bar would just be misleading.
  fetchStorageStats: async () => {
    const res = await api.get("/admin/files", { params: { relatedModule: "file-manager" } });
    const r2Files = (res.data.data as FileManagerFileData[]).filter((f) => f.provider === "r2");
    const totalBytes = r2Files.reduce((sum, f) => sum + (f.size ?? 0), 0);
    return { totalBytes, fileCount: r2Files.length };
  },
  fetchFolderTree: async () => {
    const res = await api.get("/admin/folders", { params: { tree: "1" } });
    return res.data.data as FolderTreeItem[];
  },
  fetchFolderContents: async (folderId) => {
    const folderParam = folderId ?? "root";
    const [subfoldersRes, filesRes, breadcrumbRes] = await Promise.all([
      api.get("/admin/folders", { params: { parentId: folderParam } }),
      api.get("/admin/files", { params: { relatedModule: "file-manager", folderId: folderParam } }),
      folderId ? api.get(`/admin/folders/${folderId}`) : Promise.resolve(null),
    ]);
    return {
      subfolders: subfoldersRes.data.data as FileManagerFolderData[],
      files: filesRes.data.data as FileManagerFileData[],
      breadcrumb: breadcrumbRes ? breadcrumbRes.data.data.breadcrumb : [],
    };
  },
  createFolder: async (name, parentId) => {
    const res = await api.post("/admin/folders", { name, parentId: parentId ?? "root" });
    return res.data.data as FileManagerFolderData;
  },
  renameFolder: async (id, name) => {
    const res = await api.patch(`/admin/folders/${id}`, { name });
    return res.data.data as FileManagerFolderData;
  },
  moveFolder: async (id, parentId) => {
    const res = await api.patch(`/admin/folders/${id}`, { parentId: parentId ?? "root" });
    return res.data.data as FileManagerFolderData;
  },
  deleteFolder: async (id) => {
    const res = await api.delete(`/admin/folders/${id}`);
    return res.data.data as { deletedFolders: number; deletedFiles: number };
  },
  uploadFileManagerFile: async (file, folderId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("relatedModule", "file-manager");
    formData.append("folderId", folderId ?? "root");
    const res = await api.post("/admin/files", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data as FileManagerFileData;
  },
  renameFile: async (id, name) => {
    const res = await api.patch(`/admin/files/${id}`, { name });
    return res.data.data as FileManagerFileData;
  },
  moveFile: async (id, folderId) => {
    const res = await api.patch(`/admin/files/${id}`, { folderId: folderId ?? "root" });
    return res.data.data as FileManagerFileData;
  },
  deleteFile: async (id) => {
    await api.delete(`/admin/files/${id}`);
  },
}));
