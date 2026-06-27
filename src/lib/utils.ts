import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProjectDetails } from "@/data/projects"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
