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

interface PortfolioStore {
  banner: BannerData | null;
  experiences: ExperienceData[];
  projects: ProjectData[];
  testimonials: TestimonialData[];
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
}));
