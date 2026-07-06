import { ImageResponse } from "next/og";
import { renderOgTemplate } from "@/lib/og-template";

export const runtime = "nodejs";
export const alt = "Contact Mobarak Hossain Razu — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    renderOgTemplate({
      badge: "Let's Connect",
      heading: "Mobarak Hossain",
      subheading: "Full-Stack Developer",
      description:
        "Freelance work, remote engineering roles, or consulting inquiries — my inbox is always open.",
      ctaLabel: "Get in Touch →",
    }),
    { ...size }
  );
}
