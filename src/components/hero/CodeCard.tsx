'use client';

import { useEffect, useState, useRef } from 'react';
import { Terminal, RefreshCw, Eye } from 'lucide-react';

type LineType = 'cmd' | 'out' | 'ok';
type Line = { t: LineType; text: string };

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

const DIAGNOSTICS: Line[] = [
  { t: 'cmd', text: '$ systemctl status mhr-portfolio' },
  { t: 'out', text: '● mhr-portfolio.service - System Status' },
  { t: 'out', text: '   Active: active (running) since Sat 2026-06-27' },
  { t: 'out', text: '   Performance: 120fps physics thread locked' },
  { t: 'out', text: '   Memory: 84.6MB (shared client bundle)' },
  { t: 'ok', text: '✓ All systems operational. Build passing.' },
];

const THEMES = [
  {
    name: 'Default',
    cardClass: 'bg-card border-foreground/25 ring-foreground/15 text-foreground',
    headerClass: 'border-foreground/10 text-muted-foreground',
    cmdColor: 'text-foreground',
    outColor: 'text-muted-foreground',
    okColor: 'text-foreground',
    caretColor: 'bg-foreground',
    glow: '',
  },
  {
    name: 'Matrix Green',
    cardClass: 'bg-zinc-950/95 border-emerald-500/30 ring-emerald-500/10 text-emerald-400',
    headerClass: 'border-emerald-500/15 text-emerald-500/60',
    cmdColor: 'text-emerald-400 font-bold',
    outColor: 'text-emerald-500/80',
    okColor: 'text-emerald-300 font-semibold',
    caretColor: 'bg-emerald-400',
    glow: 'shadow-[0_0_35px_rgba(16,185,129,0.15)]',
  },
  {
    name: 'Retro Amber',
    cardClass: 'bg-stone-950/95 border-amber-500/30 ring-amber-500/10 text-amber-500',
    headerClass: 'border-amber-500/15 text-amber-600/60',
    cmdColor: 'text-amber-500 font-bold',
    outColor: 'text-amber-600/80',
    okColor: 'text-amber-400 font-semibold',
    caretColor: 'bg-amber-500',
    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.15)]',
  },
  {
    name: 'Synthwave',
    cardClass: 'bg-slate-950/95 border-fuchsia-500/30 ring-fuchsia-500/10 text-fuchsia-400',
    headerClass: 'border-fuchsia-500/15 text-fuchsia-500/60',
    cmdColor: 'text-fuchsia-400 font-bold',
    outColor: 'text-fuchsia-500/80',
    okColor: 'text-pink-400 font-semibold',
    caretColor: 'bg-fuchsia-400',
    glow: 'shadow-[0_0_35px_rgba(217,70,239,0.15)]',
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function CodeCard({ start }: { start: boolean }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [controlsHovered, setControlsHovered] = useState(false);
  
  const cancelRef = useRef<boolean>(false);
  const activeScript = useRef<Line[]>(SCRIPT);

  // Core Typing Loop Engine
  const runScript = async (scriptLines: Line[]) => {
    cancelRef.current = false;
    setTyping(true);
    const displayed: Line[] = [];
    setLines([]);

    for (const line of scriptLines) {
      if (cancelRef.current) return;

      if (line.t === 'cmd') {
        displayed.push({ t: 'cmd', text: '' });
        setLines([...displayed]);
        for (const ch of line.text) {
          if (cancelRef.current) return;
          displayed[displayed.length - 1] = { t: 'cmd', text: displayed[displayed.length - 1].text + ch };
          setLines([...displayed]);
          await sleep(25);
        }
        await sleep(200);
      } else {
        displayed.push({ ...line });
        setLines([...displayed]);
        await sleep(line.t === 'ok' ? 250 : 150);
      }
    }
    if (!cancelRef.current) setTyping(false);
  };

  useEffect(() => {
    if (!start) return;
    runScript(SCRIPT);
    return () => {
      cancelRef.current = true;
    };
  }, [start]);

  const handleRestart = () => {
    cancelRef.current = true;
    setTimeout(() => {
      activeScript.current = SCRIPT;
      runScript(SCRIPT);
    }, 50);
  };

  const handleDiagnostics = () => {
    cancelRef.current = true;
    setTimeout(() => {
      activeScript.current = DIAGNOSTICS;
      runScript(DIAGNOSTICS);
    }, 50);
  };

  const cycleTheme = () => {
    setThemeIdx((prev) => (prev + 1) % THEMES.length);
  };

  const activeTheme = THEMES[themeIdx];

  // Minimized Restore Button
  if (isClosed) {
    return (
      <div className="flex h-[366px] w-full max-w-md items-center justify-center">
        <button
          onClick={() => setIsClosed(false)}
          className="group flex items-center gap-3 rounded-full border border-indigo-500/30 bg-card px-6 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 shadow-xl transition-all duration-300 hover:scale-105 hover:border-indigo-500 hover:shadow-indigo-500/10 active:scale-95"
        >
          <Terminal className="h-4 w-4 transition-transform group-hover:rotate-6" />
          <span>Restore Terminal</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-[10px]">
            <Eye className="h-3 w-3" />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-md overflow-hidden rounded-xl border ring-1 backdrop-blur-md transition-all duration-500 ${activeTheme.cardClass} ${activeTheme.glow}`}
      style={{
        backgroundImage:
          'linear-gradient(180deg, color-mix(in oklch, var(--foreground) 7%, transparent), transparent 35%)',
        transform: 'translateZ(20px)',
      }}
    >
      {/* Window Title Bar */}
      <div className={`flex items-center justify-between border-b px-4 py-3 ${activeTheme.headerClass}`}>
        {/* Mac traffic light dots */}
        <div 
          className="flex items-center gap-2"
          onMouseEnter={() => setControlsHovered(true)}
          onMouseLeave={() => setControlsHovered(false)}
        >
          {/* Red: Close / Minimize */}
          <button
            onClick={() => setIsClosed(true)}
            aria-label="Close terminal"
            className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#ff5f57] hover:bg-[#e04f47] transition-colors"
          >
            <span className={`text-[8px] font-extrabold text-red-950 pointer-events-none select-none transition-opacity duration-200 ${controlsHovered ? 'opacity-80' : 'opacity-0'}`}>
              ✕
            </span>
          </button>

          {/* Yellow: Theme Cycle */}
          <button
            onClick={cycleTheme}
            aria-label="Cycle theme"
            className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#febc2e] hover:bg-[#e0a324] transition-colors"
          >
            <span className={`text-[8px] font-extrabold text-amber-950 pointer-events-none select-none transition-opacity duration-200 ${controlsHovered ? 'opacity-80' : 'opacity-0'}`}>
              −
            </span>
          </button>

          {/* Green: Run Diagnostics */}
          <button
            onClick={handleDiagnostics}
            aria-label="Run system diagnostics"
            className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#28c840] hover:bg-[#20a830] transition-colors"
          >
            <span className={`text-[8px] font-extrabold text-emerald-950 pointer-events-none select-none transition-opacity duration-200 ${controlsHovered ? 'opacity-80' : 'opacity-0'}`}>
              ＋
            </span>
          </button>
        </div>

        {/* Title / Description */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-[0.04em]">
          <span>mhr@dev</span>
          <span>—</span>
          <span>{activeTheme.name.toLowerCase()}</span>
        </div>

        {/* Action icons */}
        <button
          onClick={handleRestart}
          title="Restart shell script"
          className="rounded p-0.5 hover:bg-foreground/5 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Terminal Display Body */}
      <div className="min-h-[300px] p-5 font-mono text-[13px] leading-relaxed tracking-[-0.01em]">
        {lines.map((line, i) => {
          const isLast = i === lines.length - 1;
          const color =
            line.t === 'cmd'
              ? activeTheme.cmdColor
              : line.t === 'ok'
                ? activeTheme.okColor
                : activeTheme.outColor;
          return (
            <div key={i} className={`${color} transition-colors duration-300`}>
              {line.text}
              {isLast && typing && (
                <span className={`ml-0.5 inline-block h-3.5 w-2 animate-pulse align-middle ${activeTheme.caretColor}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
