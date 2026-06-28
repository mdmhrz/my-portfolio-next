'use client';

import { useEffect, useRef, useState } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface BlogTOCProps {
  headings: Heading[];
}

export function BlogTOC({ headings }: BlogTOCProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const headingEls = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (headingEls.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div>
      <p className="mb-4 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        On this page
      </p>
      <nav className="space-y-0.5 border-l border-border">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`-ml-px block border-l py-1 text-sm transition-all duration-150 ${
                h.level === 3 ? 'pl-6' : 'pl-4'
              } ${
                isActive
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              {h.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
