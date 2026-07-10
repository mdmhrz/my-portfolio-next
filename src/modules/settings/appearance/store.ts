import { create } from "zustand";
import { DEFAULT_APPEARANCE } from "@/constants/defaultAppearance";
import type { ColorConfig, FontConfig } from "./appearance-injector";

export type ColorTarget = "publicColors" | "dashboardColors";

interface AppearanceState {
  font: FontConfig;
  publicColors: ColorConfig | null;
  dashboardColors: ColorConfig | null;
  loading: boolean;
  error: string | null;

  // Unsaved edits, mirrored by the forms and read by the live PreviewPanel.
  draftFont: FontConfig;
  draftColors: ColorConfig | null;
  setDraftFont: (font: FontConfig) => void;
  setDraftColors: (colors: ColorConfig | null) => void;

  fetchAppearance: () => Promise<void>;
  updateFont: (font: FontConfig) => Promise<void>;
  updateColors: (target: ColorTarget, colors: ColorConfig | null) => Promise<void>;
  restore: (type: "font" | ColorTarget | "all") => Promise<void>;
}

const DEFAULT_FONT = DEFAULT_APPEARANCE.fonts as unknown as FontConfig;

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  font: DEFAULT_FONT,
  publicColors: null,
  dashboardColors: null,
  loading: false,
  error: null,

  draftFont: DEFAULT_FONT,
  draftColors: null,
  setDraftFont: (draftFont) => set({ draftFont }),
  setDraftColors: (draftColors) => set({ draftColors }),

  fetchAppearance: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/appearance");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      set({
        font: data.font ?? DEFAULT_FONT,
        publicColors: data.publicColors ?? null,
        dashboardColors: data.dashboardColors ?? null,
        draftFont: data.font ?? DEFAULT_FONT,
        draftColors: data.publicColors ?? null,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateFont: async (font) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ font }),
      });
      if (!res.ok) throw new Error("Failed to update");
      set({ font, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateColors: async (target, colors) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/appearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [target]: colors }),
      });
      if (!res.ok) throw new Error("Failed to update");
      set({ [target]: colors, loading: false } as Partial<AppearanceState>);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  restore: async (type) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/admin/appearance/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to restore");

      if (type === "font" || type === "all") set({ font: DEFAULT_FONT });
      if (type === "publicColors" || type === "all") set({ publicColors: null });
      if (type === "dashboardColors" || type === "all") set({ dashboardColors: null });
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
