'use client';

import { useState, useRef } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";

interface BlogCodeBlockProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

function getFilenameAndLanguage(className?: string): { filename: string; lang: string } {
  const match = (className ?? '').match(/language-(\w+)/);
  const lang = match?.[1] ?? '';
  
  let filename = 'snippet';
  switch (lang.toLowerCase()) {
    case 'go':
    case 'golang':
      filename = 'main.go';
      break;
    case 'typescript':
    case 'ts':
    case 'tsx':
      filename = 'index.tsx';
      break;
    case 'javascript':
    case 'js':
    case 'jsx':
      filename = 'index.js';
      break;
    case 'html':
      filename = 'index.html';
      break;
    case 'css':
      filename = 'styles.css';
      break;
    case 'python':
    case 'py':
      filename = 'main.py';
      break;
    case 'bash':
    case 'sh':
    case 'shell':
      filename = 'script.sh';
      break;
    case 'json':
      filename = 'package.json';
      break;
    case 'sql':
      filename = 'query.sql';
      break;
    case 'yaml':
    case 'yml':
      filename = 'config.yml';
      break;
    default:
      filename = lang ? `snippet.${lang}` : 'snippet.txt';
  }
  
  return { filename, lang: lang || 'code' };
}

export function BlogCodeBlock({ children, className, ...props }: BlogCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const { filename, lang } = getFilenameAndLanguage(className);

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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg dark:shadow-none transition-all duration-300 hover:border-foreground/15 my-8">
      {/* macOS Chrome Header */}
      <div className="flex items-center justify-between border-b border-border bg-neutral-100/50 dark:bg-zinc-950/40 px-5 py-3">
        {/* Window Controls */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80" />
        </div>

        {/* Window Title */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-widest select-none">
          <FileCode2 className="h-3.5 w-3.5 text-primary dark:text-primary" />
          <span>{filename}</span>
        </div>

        {/* Action button & Lang Badge */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/40 select-none">
            {lang}
          </span>
          <button
            onClick={copy}
            aria-label="Copy code"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 transition-colors hover:bg-neutral-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <pre
        ref={preRef}
        className={`overflow-x-auto p-5 font-mono text-xs text-zinc-800 dark:text-zinc-100 leading-normal bg-neutral-50/20 dark:bg-zinc-950/10 ${className ?? ''}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
