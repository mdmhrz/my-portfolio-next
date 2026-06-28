'use client';

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";

interface BlogCodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

function extractLanguage(className?: string): string {
  const match = (className ?? '').match(/language-(\w+)/);
  return match?.[1] ?? '';
}

export function BlogCodeBlock({ children, className, ...props }: BlogCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const lang = extractLanguage(className);

  const copy = async () => {
    const text = preRef.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="group relative my-6">
      {/* Top bar */}
      <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-neutral-900 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          {lang || 'code'}
        </span>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-mono text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre
        ref={preRef}
        className={`overflow-x-auto rounded-b-xl border border-border bg-neutral-950 p-5 font-mono text-xs text-indigo-400 dark:text-indigo-300 leading-normal ${className ?? ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
