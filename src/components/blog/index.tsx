import { BlogCardStandard } from "./BlogCardStandard";
import { BlogCardOverlay } from "./BlogCardOverlay";
import { BlogCardMinimal } from "./BlogCardMinimal";
import type { BlogListItem } from "./types";

export type { BlogListItem } from "./types";
export { BlogCardStandard, BlogCardOverlay, BlogCardMinimal };

export type BlogCardTemplateId = "standard" | "overlay" | "minimal";

/** Metadata for each card template — used to build the admin picker UI. */
export interface BlogCardTemplateMeta {
  id: BlogCardTemplateId;
  label: string;
  description: string;
}

export const BLOG_CARD_TEMPLATES: BlogCardTemplateMeta[] = [
  {
    id: "standard",
    label: "Standard",
    description: "Vertical card with cover image, excerpt, and tags.",
  },
  {
    id: "overlay",
    label: "Overlay",
    description: "Full-bleed image with text overlaid on a gradient scrim.",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Compact row card with a small thumbnail and title only.",
  },
];

/** Normalize an arbitrary stored value into a valid template id. */
export function normalizeTemplate(value: unknown): BlogCardTemplateId {
  return value === "overlay" || value === "minimal" ? value : "standard";
}

/**
 * Render a blog card for the given template. Used by both the homepage slider
 * and the admin live-preview picker so the preview is pixel-identical to production.
 */
export function renderBlogCard(post: BlogListItem, template: BlogCardTemplateId) {
  switch (template) {
    case "overlay":
      return <BlogCardOverlay post={post} />;
    case "minimal":
      return <BlogCardMinimal post={post} />;
    case "standard":
    default:
      return <BlogCardStandard post={post} />;
  }
}
