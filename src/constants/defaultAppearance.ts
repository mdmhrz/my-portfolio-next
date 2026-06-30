export const DEFAULT_APPEARANCE = {
  fonts: {
    type: "default",
    name: "Satoshi",
    weights: ["400", "500", "700", "900"],
    customUrl: null,
  },

  colors: {
    mode: "simple",
    accentColor: "#000000",
    themePreset: "default",
    customPalette: null,
  },
};

export const COLOR_THEMES = {
  default: {
    name: "Default",
    description: "Original portfolio colors",
    light: {
      accent: "#000000",
      primary: "#000000",
      secondary: "#f0f0f0",
      background: "#ffffff",
      foreground: "#000000",
      border: "#e5e7eb",
    },
    dark: {
      accent: "#ffffff",
      primary: "#ffffff",
      secondary: "#1f2937",
      background: "#0f172a",
      foreground: "#ffffff",
      border: "#1f2937",
    },
  },

  ocean: {
    name: "Ocean Blue",
    description: "Cool, professional blue palette",
    light: {
      accent: "#2563eb",
      primary: "#1e40af",
      secondary: "#dbeafe",
      background: "#ffffff",
      foreground: "#1e293b",
      border: "#e0e7ff",
    },
    dark: {
      accent: "#60a5fa",
      primary: "#93c5fd",
      secondary: "#1e3a8a",
      background: "#0f172a",
      foreground: "#f1f5f9",
      border: "#1e3a8a",
    },
  },

  forest: {
    name: "Forest Green",
    description: "Natural, earthy green palette",
    light: {
      accent: "#16a34a",
      primary: "#15803d",
      secondary: "#dcfce7",
      background: "#ffffff",
      foreground: "#1e293b",
      border: "#c7d2e0",
    },
    dark: {
      accent: "#4ade80",
      primary: "#86efac",
      secondary: "#166534",
      background: "#0f172a",
      foreground: "#f1f5f9",
      border: "#166534",
    },
  },

  sunset: {
    name: "Sunset Orange",
    description: "Warm, energetic palette",
    light: {
      accent: "#ea580c",
      primary: "#c2410c",
      secondary: "#ffedd5",
      background: "#ffffff",
      foreground: "#1e293b",
      border: "#fed7aa",
    },
    dark: {
      accent: "#fb923c",
      primary: "#fdba74",
      secondary: "#7c2d12",
      background: "#0f172a",
      foreground: "#f1f5f9",
      border: "#7c2d12",
    },
  },

  midnight: {
    name: "Midnight Dark",
    description: "Deep, sophisticated dark palette",
    light: {
      accent: "#334155",
      primary: "#1e293b",
      secondary: "#e2e8f0",
      background: "#ffffff",
      foreground: "#0f172a",
      border: "#cbd5e1",
    },
    dark: {
      accent: "#94a3b8",
      primary: "#cbd5e1",
      secondary: "#1e293b",
      background: "#020617",
      foreground: "#f8fafc",
      border: "#334155",
    },
  },

  sakura: {
    name: "Sakura Pink",
    description: "Soft, cherry blossom pink tones",
    light: {
      accent: "#db2777",
      primary: "#be185d",
      secondary: "#fdf2f8",
      background: "#ffffff",
      foreground: "#1f2937",
      border: "#fce7f3",
    },
    dark: {
      accent: "#f472b6",
      primary: "#f472b6",
      secondary: "#831843",
      background: "#1c0d12",
      foreground: "#fdf2f8",
      border: "#831843",
    },
  },

  cyberpunk: {
    name: "Neon Cyberpunk",
    description: "Vibrant synthwave & neon hues",
    light: {
      accent: "#d946ef",
      primary: "#a21caf",
      secondary: "#fae8ff",
      background: "#ffffff",
      foreground: "#0f172a",
      border: "#f5d0fe",
    },
    dark: {
      accent: "#f5d0fe",
      primary: "#f472b6",
      secondary: "#4a044e",
      background: "#090514",
      foreground: "#faf5ff",
      border: "#701a75",
    },
  },

  nordic: {
    name: "Nordic Sage",
    description: "Minimalist, muted forest sage",
    light: {
      accent: "#0d9488",
      primary: "#0f766e",
      secondary: "#f0fdfa",
      background: "#fafaf9",
      foreground: "#292524",
      border: "#e7e5e4",
    },
    dark: {
      accent: "#2dd4bf",
      primary: "#5eead4",
      secondary: "#115e59",
      background: "#1c1917",
      foreground: "#f5f5f4",
      border: "#292524",
    },
  },

  amethyst: {
    name: "Royal Violet",
    description: "Sophisticated royal purple palette",
    light: {
      accent: "#7c3aed",
      primary: "#6d28d9",
      secondary: "#f5f3ff",
      background: "#ffffff",
      foreground: "#1e1b4b",
      border: "#ddd6fe",
    },
    dark: {
      accent: "#a78bfa",
      primary: "#c4b5fd",
      secondary: "#4c1d95",
      background: "#0b061e",
      foreground: "#f5f3ff",
      border: "#2e1065",
    },
  },

  amber: {
    name: "Retro Amber",
    description: "Warm gold and vintage amber tones",
    light: {
      accent: "#d97706",
      primary: "#b45309",
      secondary: "#fef3c7",
      background: "#fdfbf7",
      foreground: "#451a03",
      border: "#fde68a",
    },
    dark: {
      accent: "#fbbf24",
      primary: "#fcd34d",
      secondary: "#78350f",
      background: "#1a0f05",
      foreground: "#fef8f0",
      border: "#451a03",
    },
  },
};

export const DEFAULT_FONTS = [
  {
    id: "satoshi",
    name: "Satoshi",
    source: "local",
    weights: [400, 500, 700, 900],
    description: "Geometric sans-serif (current)",
  },
  {
    id: "inter",
    name: "Inter",
    source: "local",
    weights: [300, 400, 500, 600, 700, 800, 900],
    description: "Humanist sans-serif",
  },
  {
    id: "poppins",
    name: "Poppins",
    source: "local",
    weights: [300, 400, 500, 600, 700, 800, 900],
    description: "Geometric sans-serif",
  },
  {
    id: "geist",
    name: "Geist Sans",
    source: "local",
    weights: [400, 500, 600, 700],
    description: "Modern tech font",
  },
  {
    id: "roboto",
    name: "Roboto",
    source: "local",
    weights: [300, 400, 500, 700, 900],
    description: "Friendly sans-serif",
  },
];
