'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, BookOpen, Search, X, Eye, Star, Clock } from "lucide-react";

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  readingTime: number;
  views: number;
  createdAt: string;
}

function BlogCard({ post }: { post: BlogListItem }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.04)]">
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
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/20 to-purple-950/20">
            <BookOpen className="h-8 w-8 text-indigo-500/40" />
          </div>
        )}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
          {post.featured && (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 backdrop-blur dark:text-amber-400">
              Featured
            </span>
          )}
          {post.category && (
            <span className="rounded-full border border-border/60 bg-background/80 px-2.5 py-0.5 text-xs text-indigo-600 backdrop-blur dark:text-indigo-400">
              {post.category}
            </span>
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

        <h3 className="mb-2 line-clamp-2 text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt || "Click to read the full article."}
        </p>

        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-600/8 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 border-t border-border/50 pt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Read article
        </div>
      </div>
    </article>
  );
}

function FeaturedHeroCard({ post }: { post: BlogListItem }) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_40px_rgba(99,102,241,0.06)]">
      <Link href={`/blogs/${post.slug}`} className="absolute inset-0 z-20" />

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted lg:aspect-auto lg:min-h-[340px]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-950/30 to-purple-950/30">
              <BookOpen className="h-14 w-14 text-indigo-500/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center p-8 lg:p-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3" />
              Featured
            </span>
            {post.category && (
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                {post.category}
              </span>
            )}
          </div>

          <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400 md:text-3xl">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {post.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-600/8 px-2.5 py-0.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime || 1}m read
            </span>
            {post.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.views.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function BlogListClient({
  blogs,
  allTags,
}: {
  blogs: BlogListItem[];
  allTags: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const featuredPosts = useMemo(() => blogs.filter((b) => b.featured), [blogs]);
  const regularPosts = blogs.filter((b) => !b.featured);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regularPosts.filter((b) => {
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((t) => b.tags.includes(t));
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTags && matchesQuery;
    });
  }, [regularPosts, query, activeTags]);

  const filteredFeatured = useMemo(() => {
    const q = query.trim().toLowerCase();
    return featuredPosts.filter((b) => {
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((t) => b.tags.includes(t));
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTags && matchesQuery;
    });
  }, [featuredPosts, query, activeTags]);

  const totalFiltered = filteredFeatured.length + filtered.length;
  const isFiltering = query.trim() !== "" || activeTags.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Heading */}
      <div className="mb-12 max-w-2xl">
        <span className="mb-4 block text-[11px] font-mono uppercase tracking-[0.3em] font-semibold text-indigo-600 dark:text-indigo-400">
          Writing &amp; Thoughts
        </span>
        <h1 className="mb-6 text-4xl font-medium tracking-tight text-foreground md:text-6xl">
          The Journal.
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          Thoughts, technical tutorials, and articles on full-stack development, software engineering,
          systems design, and SaaS architectures.
        </p>
      </div>

      {/* Search + Tags */}
      <div className="mb-10 space-y-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-indigo-500/50 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTags([])}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${
                activeTags.length === 0
                  ? "border-indigo-600/40 bg-indigo-600/[0.06] text-indigo-600 dark:text-indigo-400"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer rounded-full border px-4 py-1.5 text-[11px] font-mono tracking-wider transition-colors ${
                  activeTags.includes(tag)
                    ? "border-indigo-600/40 bg-indigo-600/[0.06] text-indigo-600 dark:text-indigo-400"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                #{tag}
              </button>
            ))}
            {activeTags.length > 0 && (
              <button
                onClick={() => setActiveTags([])}
                className="cursor-pointer text-[11px] font-mono text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty state */}
      {totalFiltered === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            {blogs.length === 0
              ? "No articles published yet. Check back soon!"
              : "No articles match your search."}
          </p>
          {isFiltering && (
            <button
              onClick={() => { setQuery(""); setActiveTags([]); }}
              className="mt-4 cursor-pointer text-[11px] font-mono text-indigo-600 underline underline-offset-4 dark:text-indigo-400"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Featured posts */}
      {filteredFeatured.length > 0 && (
        <section className="mb-14 space-y-6">
          {filteredFeatured.map((post) => (
            <FeaturedHeroCard key={post.id} post={post} />
          ))}
        </section>
      )}

      {/* Regular posts grid */}
      {filtered.length > 0 && (
        <>
          {filteredFeatured.length > 0 && (
            <div className="mb-8 flex items-center gap-4">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                All Articles
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
