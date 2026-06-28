import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GithubSlugger from "github-slugger";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { BlogShareButtons } from "@/app/blogs/_components/BlogShareButtons";

export const revalidate = 3600; // Admin mutations call revalidatePath("/blogs/[slug]")

const SITE_URL = "https://mhrazu.com";
const AUTHOR_NAME = "Mobarak Hossain Razu";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blog.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      excerpt: true,
      coverImage: true,
      coverImageAlt: true,
      category: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!post) return {};

  const canonicalUrl = `${SITE_URL}/blogs/${slug}`;
  const ogImages = post.coverImage
    ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.coverImageAlt || post.title }]
    : undefined; // no cover → root opengraph-image.tsx cascades as fallback

  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: post.title,
      description: post.excerpt || undefined,
      images: ogImages,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [AUTHOR_NAME],
      tags: post.category ? [post.category] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt || undefined,
      images: ogImages?.map((img) => img.url),
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  const post = await prisma.blog.findFirst({
    where: { slug, published: true },
  });

  if (!post) {
    notFound();
  }

  // Previous / next published articles (by publish date).
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
  ]);

  // Related posts (same category, fall back to latest others).
  let related = post.category
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

  // Build the Table of Contents from H2/H3 headings (IDs must match rehype-slug).
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
  const readingTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

  const canonicalUrl = `${SITE_URL}/blogs/${post.slug}`;

  // Custom Markdown components for elegant typography matching the main site
  const markdownComponents = {
    h2: ({ children, ...props }: any) => (
      <h2 className="scroll-mt-24 text-2xl font-medium tracking-tight text-foreground mt-10 mb-4" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="scroll-mt-24 text-xl font-medium tracking-tight text-foreground mt-8 mb-3" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="text-base leading-relaxed text-muted-foreground mb-6" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-base leading-relaxed pl-1" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-2 border-indigo-600 dark:border-indigo-500 pl-5 italic my-6 text-muted-foreground bg-indigo-600/[0.02] dark:bg-indigo-500/[0.02] py-3 pr-4 rounded-r-xl" {...props}>
        {children}
      </blockquote>
    ),
    pre: ({ children, ...props }: any) => (
      <pre className="overflow-x-auto rounded-xl border border-border bg-neutral-950 p-5 font-mono text-xs text-indigo-400 dark:text-indigo-300 my-6 leading-normal" {...props}>
        {children}
      </pre>
    ),
    code: ({ className, children, ...props }: any) => {
      const isBlock = /language-|hljs/.test(className || "");
      if (!isBlock) {
        return (
          <code className="rounded border border-border bg-neutral-100 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold" {...props}>
            {children}
          </code>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    a: ({ href, children, ...props }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
        {...props}
      >
        {children}
      </a>
    ),
  };

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
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
    ...(post.category ? { keywords: post.category } : {}),
  };

  return (
    <div className="relative overflow-hidden pb-24 selection:bg-primary selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Back Link */}
        <div className="mb-10">
          <Link
            href="/blogs"
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
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
              <div className="mb-6 flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest font-semibold text-indigo-600 dark:text-indigo-400">
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
              </div>

              <h1 className="mb-6 text-4xl font-medium leading-[1.12] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="border-l border-indigo-600/30 py-1 pl-4 text-lg leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/10 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
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
                <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
              </div>
            )}

            {/* Markdown Content */}
            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
                components={markdownComponents as any}
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
                    <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <ArrowLeft className="h-3 w-3" /> Previous
                    </span>
                    <span className="mt-2 block text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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
                    <span className="flex items-center justify-end gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Next <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="mt-2 block text-sm font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          {/* Sidebar: TOC + Share */}
          {headings.length > 0 && (
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-24 space-y-8">
                <div>
                  <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                    On this page
                  </p>
                  <nav className="space-y-2 border-l border-border">
                    {headings.map((h) => (
                      <a
                        key={h.id}
                        href={`#${h.id}`}
                        className={`-ml-px block border-l border-transparent text-sm text-muted-foreground transition-colors hover:text-foreground hover:border-indigo-500 ${
                          h.level === 3 ? "pl-6" : "pl-4"
                        }`}
                      >
                        {h.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          )}
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
                  <h3 className="text-base font-medium tracking-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
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
