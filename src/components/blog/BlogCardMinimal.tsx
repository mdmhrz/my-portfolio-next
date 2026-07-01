import Link from "next/link";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogListItem } from "./types";

/**
 * Minimal blog card — text-forward layout with a small square thumbnail on the
 * left and tight typography on the right (no excerpt). Good for dense sliders.
 * The whole card links to the post.
 */
export function BlogCardMinimal({ post }: { post: BlogListItem }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group relative flex h-full items-center gap-5 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_color-mix(in_oklch,var(--primary)_4%,transparent)]">
      <Link href={`/blogs/${post.slug}`} className="absolute inset-0 z-20" />

      {/* Square thumbnail */}
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-28">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 25vw, 12vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
            <BookOpen className="h-6 w-6 text-primary/40" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          {post.category && (
            <Badge variant="outline" className="border-border/60 bg-background/80 text-primary">
              {post.category}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>

        <h3 className="mb-1 line-clamp-2 font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>

        <span className="mt-auto text-xs font-semibold text-primary">
          Read article →
        </span>
      </div>
    </article>
  );
}
