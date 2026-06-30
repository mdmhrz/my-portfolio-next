import { NextRequest, NextResponse } from "next/server";

const POPULAR_FALLBACK_FONTS = [
  { family: "Inter", variants: ["300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Roboto", variants: ["100", "300", "400", "500", "700", "900"], category: "sans-serif" },
  { family: "Poppins", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Montserrat", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Playfair Display", variants: ["400", "500", "600", "700", "800", "900"], category: "serif" },
  { family: "Lora", variants: ["400", "500", "600", "700"], category: "serif" },
  { family: "Merriweather", variants: ["300", "400", "700", "900"], category: "serif" },
  { family: "Outfit", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Plus Jakarta Sans", variants: ["200", "300", "400", "500", "600", "700", "800"], category: "sans-serif" },
  { family: "Space Grotesk", variants: ["300", "400", "500", "600", "700"], category: "sans-serif" },
  { family: "Fira Code", variants: ["300", "400", "500", "600", "700"], category: "monospace" },
  { family: "JetBrains Mono", variants: ["100", "200", "300", "400", "500", "600", "700", "800"], category: "monospace" },
  { family: "Source Code Pro", variants: ["200", "300", "400", "500", "600", "700", "900"], category: "monospace" },
  { family: "Syne", variants: ["400", "500", "600", "700", "800"], category: "sans-serif" },
  { family: "Cabinet Grotesk", variants: ["300", "400", "500", "700", "800"], category: "sans-serif" },
  { family: "Clash Display", variants: ["300", "400", "500", "600", "700"], category: "sans-serif" },
  { family: "DM Sans", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Work Sans", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Nunito", variants: ["200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Raleway", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Oswald", variants: ["200", "300", "400", "500", "600", "700"], category: "sans-serif" },
  { family: "Rubik", variants: ["300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Ubuntu", variants: ["300", "400", "500", "700"], category: "sans-serif" },
  { family: "Kanit", variants: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], category: "sans-serif" },
  { family: "Quicksand", variants: ["300", "400", "500", "600", "700"], category: "sans-serif" },
  { family: "Libre Baskerville", variants: ["400", "700"], category: "serif" },
  { family: "Cinzel", variants: ["400", "500", "600", "700", "800", "900"], category: "serif" },
  { family: "Cormorant Garamond", variants: ["300", "400", "500", "600", "700"], category: "serif" },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const apiKey = process.env.GOOGLE_FONTS_API_KEY;
    let rawFonts: any[] = [];

    if (apiKey) {
      try {
        const url = new URL("https://www.googleapis.com/webfonts/v1/webfonts");
        url.searchParams.set("key", apiKey);
        url.searchParams.set("sort", "popularity");

        const res = await fetch(url.toString());
        if (res.ok) {
          const data = await res.json();
          rawFonts = data.items || [];
        }
      } catch (err) {
        console.warn("Google API failed, falling back to static list:", err);
      }
    }

    // Fall back to high-quality popular list if API fails or no API Key is set
    if (rawFonts.length === 0) {
      rawFonts = POPULAR_FALLBACK_FONTS.map(f => ({
        family: f.family,
        variants: f.variants,
        category: f.category,
      }));
    }

    if (search) {
      rawFonts = rawFonts.filter((f: any) =>
        (f.family || f.name || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    const results = rawFonts.slice(0, 50).map((f: any) => {
      const familyName = f.family || f.name || "";
      const rawVariants = f.variants || [];
      const weights = rawVariants
        .map((v: string) => v.replace("italic", "").trim())
        .filter((v: string) => /^\d+$/.test(v));

      return {
        id: familyName.toLowerCase().replace(/\s+/g, "-"),
        name: familyName,
        weights: weights.length > 0 ? weights : ["400", "700"],
        category: f.category || "sans-serif",
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to load Google Fonts:", error);
    // Absolute failsafe
    return NextResponse.json(
      POPULAR_FALLBACK_FONTS.map((f) => ({
        id: f.family.toLowerCase().replace(/\s+/g, "-"),
        name: f.family,
        weights: f.variants,
        category: f.category,
      }))
    );
  }
}
