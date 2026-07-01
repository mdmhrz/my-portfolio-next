import Link from "next/link";
import Image from "next/image";
import { Calendar, BookOpen, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogListItem } from "./types";

/**
 * Standard vertical blog card — ported from the public `/blogs` listing card
 * (`src/app/blogs/_components/BlogListClient.tsx`). Cover image on top, meta row,
 * line-clamped title + excerpt, tag chips, and a "Read article" footer. The whole
 * card links to the post via an absolute inset overlay so the entire surface is clickable.
 */
export function BlogCardStandard({ post }: { post: BlogListItem }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_color-mix(in_oklch,var(--primary)_4%,transparent)]">
      <Link href={`/blogs/${post.slug}`} className="absolute inset-0 z-20" />

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
            <BookOpen className="h-8 w-8 text-primary/40" />
          </div>
        )}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {post.featured && (
            <Badge variant="outline" className="border-amber-400/40 bg-amber-400/10 text-amber-600 backdrop-blur dark:text-amber-400">
              Featured
            </Badge>
          )}
          {post.category && (
            <Badge variant="outline" className="border-border/60 bg-background/80 text-primary backdrop-blur">
              {post.category}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readingTime || 1}m
          </span>
          {post.views > 0 && (
            <>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views.toLocaleString()}
              </span>
            </>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt || "Click to read the full article."}
        </p>

        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-primary/8 text-primary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 border-t border-border/50 pt-4 text-xs font-semibold text-primary">
          Read article
        </div>
      </div>
    </article>
  );
}
