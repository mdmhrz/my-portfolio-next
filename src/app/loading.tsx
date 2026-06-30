export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#09090b] transition-colors duration-350">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes loading-spin-outer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loading-spin-inner {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes loading-pulse-glow {
          0%, 100% { transform: scale(0.95); opacity: 0.35; filter: blur(30px); }
          50% { transform: scale(1.08); opacity: 0.65; filter: blur(45px); }
        }
        @keyframes loading-text-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-spin-outer {
          animation: loading-spin-outer 2s linear infinite;
        }
        .animate-spin-inner {
          animation: loading-spin-inner 1.4s linear infinite;
        }
        .animate-pulse-glow {
          animation: loading-pulse-glow 3s ease-in-out infinite;
        }
        .animate-text-pulse {
          animation: loading-text-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background ambient glow matching current theme accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/15 dark:bg-primary/10 animate-pulse-glow pointer-events-none" />

      {/* Spinner Container */}
      <div className="relative flex items-center justify-center w-28 h-28">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary/80 border-b-primary/80 animate-spin-outer" />
        
        {/* Inner Ring */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-l-primary/60 border-r-primary/60 animate-spin-inner" />
        
        {/* Center Pulse Core with Monogram */}
        <div className="absolute inset-6 rounded-full bg-neutral-50 dark:bg-zinc-900 border border-border/40 shadow-sm flex items-center justify-center select-none">
          <span className="text-sm font-bold tracking-wider text-foreground font-mono bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
            MHR
          </span>
        </div>
      </div>

      {/* Typography / Brand */}
      <div className="mt-8 text-center space-y-2.5 z-10">
        <h1 className="text-sm font-bold tracking-widest text-foreground uppercase font-sans">
          Mobarak Hossain Razu
        </h1>
        <div className="flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-xs text-muted-foreground font-medium animate-text-pulse">
            Connecting to portfolio...
          </p>
        </div>
      </div>
    </div>
  );
}
