'use client';

import { useEffect, useState } from 'react';

type LineType = 'cmd' | 'out' | 'ok';
type Line = { t: LineType; text: string };

// The terminal sequence that types itself out. Commands are typed char-by-char;
// outputs appear instantly on "enter" (like a real shell).
const SCRIPT: Line[] = [
  { t: 'cmd', text: '$ whoami' },
  { t: 'out', text: 'Mobarak Hossain Razu' },
  { t: 'cmd', text: '$ role --current' },
  { t: 'out', text: 'Frontend Developer @ Xgenious' },
  { t: 'cmd', text: '$ stack --list' },
  { t: 'out', text: 'next.js · react · node · go · ts · postgres · prisma' },
  { t: 'cmd', text: '$ ship --prod' },
  { t: 'ok', text: '✓ deployed · 0 errors · 60fps' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function CodeCard({ start }: { start: boolean }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    if (!start) return;
    let cancelled = false;

    (async () => {
      const displayed: Line[] = [];
      for (const line of SCRIPT) {
        if (cancelled) return;

        if (line.t === 'cmd') {
          // Type the command character by character.
          displayed.push({ t: 'cmd', text: '' });
          setLines([...displayed]);
          for (const ch of line.text) {
            if (cancelled) return;
            displayed[displayed.length - 1] = { t: 'cmd', text: displayed[displayed.length - 1].text + ch };
            setLines([...displayed]);
            await sleep(26);
          }
          await sleep(220);
        } else {
          // Output appears instantly after the "enter".
          displayed.push({ ...line });
          setLines([...displayed]);
          await sleep(line.t === 'ok' ? 260 : 170);
        }
      }
      if (!cancelled) setTyping(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [start]);

  return (
    <div
      className="w-full max-w-md overflow-hidden rounded-xl border border-foreground/25 bg-card shadow-2xl ring-1 ring-foreground/15 backdrop-blur-md"
      style={{
        backgroundImage:
          'linear-gradient(180deg, color-mix(in oklch, var(--foreground) 7%, transparent), transparent 35%)',
      }}
    >
      {/* Window chrome — Mac traffic-light dots */}
      <div className="flex items-center gap-2 border-b border-foreground/10 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[11px] tracking-[0.04em] text-muted-foreground">mhr@dev — zsh</span>
      </div>

      {/* Terminal body */}
      <div className="min-h-[300px] p-5 text-[13px] leading-relaxed tracking-[-0.01em]">
        {lines.map((line, i) => {
          const isLast = i === lines.length - 1;
          const color =
            line.t === 'cmd'
              ? 'text-foreground'
              : line.t === 'ok'
                ? 'text-foreground'
                : 'text-muted-foreground';
          return (
            <div key={i} className={color}>
              {line.text}
              {isLast && typing && <span className="ml-0.5 inline-block h-3.5 w-2 animate-pulse bg-foreground align-middle" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
