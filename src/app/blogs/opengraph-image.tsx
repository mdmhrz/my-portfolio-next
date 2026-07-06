import { ImageResponse } from "next/og";
import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "Blog | Mobarak Hossain Razu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    renderOgTemplate({
      badge: "The Blog",
      heading: "Mobarak Hossain",
      subheading: "Articles & Engineering Notes",
      description:
        "Full-stack development, system design, Next.js, Go, DevOps, and engineering insights.",
      ctaLabel: "Start Reading →",
    }),
    { ...size }
  );
}
