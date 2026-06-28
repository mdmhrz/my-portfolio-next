'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, BookOpen, Search, X } from "lucide-react";

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  category: string | null;
  content: string;
  createdAt: string;
}

function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export function BlogListClient({
  blogs,
  categories,
}: {
  blogs: BlogListItem[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter((b) => {
      const matchesCat = !activeCat || b.category === activeCat;
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [blogs, query, activeCat]);

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

      {/* Search + Categories */}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCat(null)}
              className={`rounded-full border px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                activeCat === null
                  ? "border-indigo-600/40 bg-indigo-600/[0.06] text-indigo-600 dark:text-indigo-400"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat((prev) => (prev === cat ? null : cat))}
                className={`rounded-full border px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  activeCat === cat
                    ? "border-indigo-600/40 bg-indigo-600/[0.06] text-indigo-600 dark:text-indigo-400"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            {blogs.length === 0
              ? "No articles published yet. Check back soon!"
              : "No articles match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => {
            const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.03)]"
              >
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
                  {post.category && (
                    <span className="absolute left-3 top-3 z-10 rounded-full border border-border/60 bg-background/80 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-indigo-600 backdrop-blur dark:text-indigo-400">
                      {post.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center gap-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </span>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      {readingTime(post.content)} Min Read
                    </span>
                  </div>

                  <h3 className="mb-3 line-clamp-2 text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {post.title}
                  </h3>
                  <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt || "Click to read the full article."}
                  </p>

                  <div className="mt-auto flex items-center gap-1.5 border-t border-border/50 pt-4 text-[11px] font-mono uppercase tracking-[0.15em] font-semibold text-indigo-600 dark:text-indigo-400">
                    Read article
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
