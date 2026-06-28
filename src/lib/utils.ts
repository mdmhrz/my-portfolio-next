import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProjectDetails } from "@/data/projects"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert arbitrary text into a URL-safe slug (kebab-case).
 * e.g. "Deploying Next.js!" -> "deploying-next-js"
 */
export function slugify(value: string): string {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric (keep spaces & hyphens)
    .replace(/[\s_]+/g, "-")       // spaces/underscores -> hyphen
    .replace(/-+/g, "-")           // collapse repeated hyphens
    .replace(/^-+|-+$/g, "");      // trim leading/trailing hyphens
}

export function mapDbProjectToProjectDetails(p: any): ProjectDetails {
  return {
    id: p.slug, // Map database slug to id for frontend compatibility
    title: p.title,
    subtitle: p.subtitle,
    category: p.category,
    desc: p.desc,
    fullDesc: p.fullDesc,
    tech: p.tech || [],
    features: p.features || [],
    contributions: p.contributions || [],
    live: p.live || "",
    image: p.image,
    imageAlt: p.imageAlt || undefined,
    span: p.span || undefined,
    role: p.role || undefined,
    company: p.company || undefined,
    timeline: p.timeline || undefined,
    architecture: p.architectureTitle ? {
      title: p.architectureTitle,
      description: p.architectureDesc || "",
      tree: p.architectureTree || undefined
    } : undefined,
    metrics: Array.isArray(p.metrics) ? p.metrics as any : undefined,
  }
}
