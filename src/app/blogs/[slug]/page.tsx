import React, { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, Calendar, Clock, ArrowRight, Eye, Tag } from "lucide-react";
import { BlogShareButtons } from "@/app/blogs/_components/BlogShareButtons";
import { BlogProgressBar } from "@/app/blogs/_components/BlogProgressBar";
import { BlogTOC } from "@/app/blogs/_components/BlogTOC";
import { BlogViewCounter } from "@/app/blogs/_components/BlogViewCounter";
import { BlogCodeBlock } from "@/app/blogs/_components/BlogCodeBlock";

export const revalidate = 3600;

const SITE_URL = "https://mhrazu.com";
const AUTHOR_NAME = "Mobarak Hossain Razu";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    select: { slug: true },
  }).catch(() => []);
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      excerpt: true,
      coverImage: true,
      coverImageAlt: true,
      category: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  }).catch(() => null);
  if (!post) return {};

  const canonicalUrl = `${SITE_URL}/blogs/${slug}`;
  const seoTitle = post.metaTitle || post.title;
  const seoDescription = post.metaDescription || post.excerpt || undefined;
  const ogImages = post.coverImage
    ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.coverImageAlt || post.title }]
    : undefined;

  const allKeywords = [
    ...(post.tags || []),
    ...(post.category ? [post.category] : []),
    "full-stack development",
    "Mobarak Hossain Razu",
  ].filter(Boolean);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: allKeywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: seoTitle,
      description: seoDescription,
      images: ogImages,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [AUTHOR_NAME],
      tags: [
        ...(post.tags || []),
        ...(post.category ? [post.category] : []),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: ogImages?.map((img) => img.url),
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await prisma.blog.findFirst({
      where: { slug, published: true },
    });
  } catch (error) {
    console.error("Blog post DB query failed:", error);
    // DB is unreachable — this is a temporary outage, not a missing post,
    // so show a friendly retry message rather than a misleading 404.
    return (
      <div className="relative mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          This article is temporarily unavailable
        </h1>
        <p className="mt-4 text-muted-foreground">
          We&apos;re having trouble loading this content right now. Please try again in a moment.
        </p>
        <Link
          href="/blogs"
          className="mt-8 inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  // Previous / next published articles (by publish date). Best-effort — if the
  // DB hiccups here the article itself still renders, just without these links.
  const [prev, next] = await Promise.all([
    prisma.blog.findFirst({
      where: { published: true, createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.blog.findFirst({
      where: { published: true, createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]).catch((error) => {
    console.error("Blog prev/next DB query failed:", error);
    return [null, null];
  });

  // Related posts (same category, fall back to latest others).
  let related: { slug: string; title: string; coverImage: string | null; coverImageAlt: string | null; createdAt: Date }[] = [];
  try {
    related = post.category
      ? await prisma.blog.findMany({
          where: { published: true, id: { not: post.id }, category: post.category },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: { slug: true, title: true, coverImage: true, coverImageAlt: true, createdAt: true },
        })
      : [];
    if (related.length === 0) {
      related = await prisma.blog.findMany({
        where: { published: true, id: { not: post.id } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { slug: true, title: true, coverImage: true, coverImageAlt: true, createdAt: true },
      });
    }
  } catch (error) {
    console.error("Related posts DB query failed:", error);
    related = [];
  }

  // Build the Table of Contents from H2/H3 headings.
  const slugger = new GithubSlugger();
  const headings = [...post.content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => {
    const level = m[1].length;
    const text = m[2].replace(/[`*_~]/g, "").trim();
    return { level, text, id: slugger.slug(text) };
  });

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use pre-computed reading time from DB; fall back to live-computed if somehow 0
  const readingTime = post.readingTime || Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

  const canonicalUrl = `${SITE_URL}/blogs/${post.slug}`;

  const markdownComponents: Components = {
    h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
      <h2 className="scroll-mt-24 text-2xl font-medium tracking-tight text-foreground mt-10 mb-4" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
      <h3 className="scroll-mt-24 text-xl font-medium tracking-tight text-foreground mt-8 mb-3" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
      <p className="text-base leading-relaxed text-muted-foreground mb-6" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
      <li className="text-base leading-relaxed pl-1" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        className="border-l-2 border-primary dark:border-primary pl-5 italic my-6 text-muted-foreground bg-primary/[0.02] dark:bg-primary/[0.02] py-3 pr-4 rounded-r-xl"
        {...props}
      >
        {children}
      </blockquote>
    ),
    // Pre wraps code blocks — extract child's language className and pass to BlogCodeBlock
    pre: ({ children }: ComponentPropsWithoutRef<"pre">) => {
      const child = Array.isArray(children) ? children[0] : children;
      const langClass = React.isValidElement(child)
        ? (child.props as { className?: string })?.className ?? ""
        : "";
      return <BlogCodeBlock className={langClass}>{children}</BlogCodeBlock>;
    },
    code: ({ className, children, ...props }: ComponentPropsWithoutRef<"code">) => {
      const isBlock = /language-|hljs/.test(className || "");
      if (!isBlock) {
        return (
          <code
            className="rounded border border-border bg-neutral-100 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-primary dark:text-primary font-semibold"
            {...props}
          >
            {children}
          </code>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    img: ({ src, alt, ...props }: ComponentPropsWithoutRef<"img">) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ""}
        className="my-6 w-full rounded-xl border border-border object-cover shadow-sm"
        loading="lazy"
        {...props}
      />
    ),
    a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-primary dark:text-primary underline underline-offset-4 hover:text-primary dark:hover:text-primary transition-colors font-medium"
        {...props}
      >
        {children}
      </a>
    ),
  };

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverImage || undefined,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    url: canonicalUrl,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      ...(post.tags || []),
      ...(post.category ? [post.category] : []),
    ].join(", ") || undefined,
  };

  return (
    <div className="relative overflow-x-clip pb-24 selection:bg-primary selection:text-primary-foreground">
      {/* Reading progress bar */}
      <BlogProgressBar />

      {/* View counter (fires once on mount) */}
      <BlogViewCounter slug={post.slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--primary)_5%,transparent),transparent)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/blogs"
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Blogs
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Article */}
          <article className="lg:col-span-8">
            {/* Header */}
            <header className="mb-10">
              <div className="mb-6 flex flex-wrap items-center gap-4 text-[10px] font-sans uppercase tracking-widest font-semibold text-primary dark:text-primary">
                {post.category && (
                  <>
                    <span>{post.category}</span>
                    <span className="h-3 w-px bg-border" />
                  </>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
                <span className="h-3 w-px bg-border" />
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {readingTime} Min Read
                </span>
                {post.views > 0 && (
                  <>
                    <span className="h-3 w-px bg-border" />
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views.toLocaleString()} Views
                    </span>
                  </>
                )}
              </div>

              <h1 className="mb-6 text-4xl font-medium leading-[1.12] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="border-l border-primary/30 py-1 pl-4 text-lg leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blogs?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-primary/8 px-3 py-1 text-[11px] font-sans text-primary transition-colors hover:bg-primary/15 dark:text-primary"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-sans text-xs font-semibold text-primary dark:text-primary">
                    MH
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Mobarak Hossain Razu</p>
                    <p className="text-xs text-muted-foreground">Full-Stack Developer</p>
                  </div>
                </div>
                <BlogShareButtons url={canonicalUrl} title={post.title} />
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative mb-10 aspect-[21/10] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-md">
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            )}

            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true }], rehypeSlug]}
                components={markdownComponents}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Prev / Next */}
            {(prev || next) && (
              <nav className="mt-16 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2">
                {prev ? (
                  <Link
                    href={`/blogs/${prev.slug}`}
                    className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                  >
                    <span className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
                      <ArrowLeft className="h-3 w-3" /> Previous
                    </span>
                    <span className="mt-2 block text-sm font-medium text-foreground group-hover:text-primary dark:group-hover:text-primary">
                      {prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {next && (
                  <Link
                    href={`/blogs/${next.slug}`}
                    className="group rounded-xl border border-border bg-card p-5 text-right transition-colors hover:border-foreground/20"
                  >
                    <span className="flex items-center justify-end gap-1.5 text-[10px] font-sans uppercase tracking-widest text-muted-foreground">
                      Next <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="mt-2 block text-sm font-medium text-foreground group-hover:text-primary dark:group-hover:text-primary">
                      {next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          {/* Sidebar: TOC (with scroll-spy) + Share */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-8">
              <BlogTOC headings={headings} />
            </div>
          </aside>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <h2 className="mb-8 text-2xl font-medium tracking-tight text-foreground">Related Articles</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blogs/${r.slug}`} className="group">
                  <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted">
                    {r.coverImage ? (
                      <Image
                        src={r.coverImage}
                        alt={r.coverImageAlt || r.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <h3 className="text-base font-medium tracking-tight text-foreground group-hover:text-primary dark:group-hover:text-primary">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
