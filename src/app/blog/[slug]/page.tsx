import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, BookOpen, Clock } from "lucide-react";

export const revalidate = 0; // Dynamic on every request

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  
  const post = await prisma.blog.findFirst({
    where: {
      slug,
      published: true,
    },
  });

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Custom Markdown components for elegant typography matching the main site
  const markdownComponents = {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl font-medium tracking-tight text-foreground mt-10 mb-4 md:text-4xl" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl font-medium tracking-tight text-foreground mt-8 mb-4" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl font-medium tracking-tight text-foreground mt-6 mb-3" {...props}>
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
    code: ({ children, inline, ...props }: any) => {
      if (inline) {
        return (
          <code className="rounded border border-border bg-neutral-100 dark:bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold" {...props}>
            {children}
          </code>
        );
      }
      return <code className="font-mono text-xs" {...props}>{children}</code>;
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-black pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.05),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto max-w-4xl px-6 py-20 relative z-10">
        
        {/* Back Link */}
        <div className="mb-12">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Journal
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-6 font-semibold">
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

          {/* Title */}
          <h1 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl lg:text-6xl leading-[1.12] mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg leading-relaxed text-muted-foreground border-l border-indigo-600/30 pl-4 py-1">
            {post.excerpt}
          </p>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative aspect-[21/10] w-full overflow-hidden rounded-2xl border border-border bg-card mb-12 shadow-md">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <ReactMarkdown components={markdownComponents as any}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Article Footer section */}
        <footer className="border-t border-border mt-16 pt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600/10 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
              MH
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Mobarak Hossain Razu</p>
              <p className="text-xs text-muted-foreground">Full-Stack Developer</p>
            </div>
          </div>
          <Link
            href="/blog"
            className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
          >
            ← Explore more articles
          </Link>
        </footer>

      </div>
    </div>
  );
}
