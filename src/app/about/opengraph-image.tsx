import { ImageResponse } from "next/og";
import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "About Mobarak Hossain Razu — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    renderOgTemplate({
      badge: "About Me",
      heading: "Mobarak Hossain",
      subheading: "Full-Stack Developer",
      description:
        "Technical background, skills, and experience building high-performance SaaS platforms and production web apps.",
      ctaLabel: "Read More →",
    }),
    { ...size }
  );
}
