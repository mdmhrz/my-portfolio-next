import { create } from "zustand";
import { api } from "@/lib/api-client";

export interface BannerData {
  id?: string;
  name: string;
  title: string;
  description: string;
  chips: string[];
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email?: string | null;
}

export interface ExperienceData {
  id: string;
  company: string;
  role: string;
  location: string;
  timeline: string;
  description: string;
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
  span?: string | null;
  architectureTitle?: string | null;
  architectureDesc?: string | null;
  architectureTree?: string | null;
  metrics?: any;
  order: number;
  experienceId?: string | null;
}

export interface MessageData {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface BlogData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioStore {
  banner: BannerData | null;
  experiences: ExperienceData[];
  projects: ProjectData[];
  messages: MessageData[];
  blogs: BlogData[];
  loading: Record<string, boolean>;

  fetchBanner: () => Promise<void>;
  updateBanner: (data: BannerData) => Promise<void>;

  fetchExperiences: () => Promise<void>;
  createExperience: (data: Omit<ExperienceData, "id">) => Promise<void>;
  updateExperience: (id: string, data: Partial<ExperienceData>) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;

  fetchProjects: () => Promise<void>;
  createProject: (data: Omit<ProjectData, "id">) => Promise<void>;
  updateProject: (id: string, data: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  fetchMessages: () => Promise<void>;
  markMessageRead: (id: string, read: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  fetchBlogs: () => Promise<void>;
  createBlog: (data: Omit<BlogData, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateBlog: (id: string, data: Partial<BlogData>) => Promise<void>;
  deleteBlog: (id: string) => Promise<void>;

  setBanner: (banner: BannerData | null) => void;
  setExperiences: (experiences: ExperienceData[]) => void;
  setProjects: (projects: ProjectData[]) => void;
  setMessages: (messages: MessageData[]) => void;
  setBlogs: (blogs: BlogData[]) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  banner: null,
  experiences: [],
  projects: [],
  messages: [],
  blogs: [],
  loading: {},

  setBanner: (banner) => set({ banner }),
  setExperiences: (experiences) => set({ experiences }),
  setProjects: (projects) => set({ projects }),
  setMessages: (messages) => set({ messages }),
  setBlogs: (blogs) => set({ blogs }),

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

  // Messages Actions
  fetchMessages: async () => {
    try {
      const res = await api.get("/admin/messages");
      set({ messages: res.data.data });
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  },
  markMessageRead: async (id, read) => {
    try {
      const res = await api.put(`/admin/messages/${id}`, { read });
      set((state) => ({
        messages: state.messages.map((msg) => (msg.id === id ? res.data.data : msg)),
      }));
    } catch (err) {
      console.error("Error marking message as read:", err);
      throw err;
    }
  },
  deleteMessage: async (id) => {
    try {
      await api.delete(`/admin/messages/${id}`);
      set((state) => ({ messages: state.messages.filter((msg) => msg.id !== id) }));
    } catch (err) {
      console.error("Error deleting message:", err);
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
}));
