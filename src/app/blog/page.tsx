import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, ArrowUpRight, Calendar, BookOpen } from "lucide-react";

export const revalidate = 0; // Dynamic on every request

export default async function BlogListPage() {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary selection:text-black">
      {/* Background Decorative Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.06),rgba(255,255,255,0))]" />
      
      <div className="container mx-auto max-w-6xl px-6 py-20 relative z-10">
        
        {/* Back Link */}
        <div className="mb-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Portfolio
          </Link>
        </div>

        {/* Heading Block */}
        <div className="mb-16 max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold block mb-4">
            Writing &amp; Thoughts
          </span>
          <h1 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl mb-6">
            The Journal.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
            Thoughts, technical tutorials, and articles on full-stack development, software engineering, systems design, and SaaS architectures.
          </p>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/60 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No articles published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              
              // Simple reading time estimator (e.g. 200 words per minute)
              const wordCount = post.content.split(/\s+/).length;
              const readingTime = Math.max(1, Math.ceil(wordCount / 200));

              return (
                <article
                  key={post.id}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:border-foreground/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.03)] cursor-pointer"
                >
                  <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-20" />
                  
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-750 ease-out group-hover:scale-103"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 to-purple-950/20 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-indigo-500/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                      <span className="h-3 w-px bg-border" />
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        {readingTime} Min Read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-medium tracking-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-6">
                      {post.excerpt || "Click to read the full article."}
                    </p>

                    {/* Footer Arrow */}
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 font-semibold">
                      Read article <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
