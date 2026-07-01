import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogListItem } from "./types";

/**
 * Overlay blog card — full-bleed cover image with a gradient scrim and text
 * overlaid at the bottom. More visual and compact than the standard card.
 * The whole card links to the post.
 */
export function BlogCardOverlay({ post }: { post: BlogListItem }) {
  return (
    <article className="group relative flex h-full min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_color-mix(in_oklch,var(--primary)_4%,transparent)]">
      <Link href={`/blogs/${post.slug}`} className="absolute inset-0 z-20" />

      {/* Background image */}
      <div className="absolute inset-0">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="h-10 w-10 text-primary/40" />
          </div>
        )}
        {/* Gradient scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 p-6 text-white">
        <div className="mb-3 flex items-center gap-1.5">
          {post.featured && (
            <Badge variant="outline" className="border-amber-400/50 bg-amber-400/20 text-amber-200 backdrop-blur">
              Featured
            </Badge>
          )}
          {post.category && (
            <Badge variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur">
              {post.category}
            </Badge>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-xl font-semibold tracking-tight">
          {post.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-white/80">
          {post.excerpt || "Click to read the full article."}
        </p>

        <div className="flex items-center gap-3 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime || 1}m read
          </span>
          <span className="ml-auto flex items-center gap-1 font-semibold text-white transition-transform duration-300 group-hover:translate-x-1">
            Read <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
