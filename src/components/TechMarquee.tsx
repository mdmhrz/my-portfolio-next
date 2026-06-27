'use client';

import { motion } from "motion/react";
import React from "react";

const NextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.8 17.4h-1.2v-10.8h1.2v10.8zm6 0l-3.3-5.3v5.3h-1.2v-10.8h1.1l3.3 5.3v-5.3h1.2v10.8z"/>
  </svg>
);

const ReactIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <ellipse rx="11" ry="4.2"/>
    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    <circle r="2" fill="currentColor"/>
  </svg>
);

const TSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M1.125 0h21.75c.621 0 1.125.504 1.125 1.125v21.75c0 .621-.504 1.125-1.125 1.125h-21.75c-.621 0-1.125-.504-1.125-1.125v-21.75c0-.621.504-1.125 1.125-1.125zm11.758 14.887c0-2.311-.645-3.327-2.73-4.223-.978-.426-1.9-.8-1.9-1.574 0-.585.511-.862 1.21-.862.836 0 1.445.349 1.937.947l1.396-1.107c-.797-1.013-1.91-1.425-3.308-1.425-2.072 0-3.398 1.118-3.398 2.809 0 2.224.778 3.193 2.656 4.022.997.438 1.638.85 1.638 1.624 0 .736-.704.996-1.426.996-1.108 0-1.896-.549-2.398-1.378l-1.378 1.054c.82 1.427 2.148 1.91 3.754 1.91 2.457 0 3.774-1.229 3.774-3.17zm8.312-7.554h-5.263v1.89h1.748v8.667h1.768v-8.667h1.747v-1.89z"/>
  </svg>
);

const GoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M1.94 11.23c0-3.32 2.65-6.01 5.92-6.01 2.87 0 5.17 2.04 5.73 4.78h-2.91a2.89 2.89 0 0 0-2.82-1.92c-1.63 0-2.95 1.33-2.95 2.97 0 1.65 1.32 2.97 2.95 2.97 1.37 0 2.51-.95 2.82-2.23H7.86v-2.18h5.73v5.6c-.84.87-2.02 1.4-3.32 1.4-3.27.01-5.93-2.67-5.93-6.01zm11.75 3.1c0-2.31 1.83-4.18 4.09-4.18 2.26 0 4.09 1.87 4.09 4.18 0 2.31-1.83 4.18-4.09 4.18-2.26 0-4.09-1.87-4.09-4.18zm2.66 0c0 .96.64 1.74 1.43 1.74.79 0 1.43-.78 1.43-1.74 0-.96-.64-1.74-1.43-1.74-.79 0-1.43.78-1.43 1.74z"/>
  </svg>
);

const PostgresIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C8.13 2 5 3.34 5 5v14c0 1.66 3.13 3 7 3s7-1.34 7-3V5c0-1.66-3.13-3-7-3zm0 2c2.89 0 5 1 5 1s-2.11 1-5 1-5-1-5-1 2.11-1 5-1zm0 16c-2.89 0-5-1-5-1v-2.28c.95.6 2.78 1.28 5 1.28s4.05-.68 5-1.28V19c0 0-2.11 1-5 1zm0-4.5c-2.89 0-5-1-5-1v-2.28c.95.6 2.78 1.28 5 1.28s4.05-.68 5-1.28V14.5c0 0-2.11 1-5 1zm0-4.5c-2.89 0-5-1-5-1V7.72c.95.6 2.78 1.28 5 1.28s4.05-.68 5-1.28V10c0 0-2.11 1-5 1z"/>
  </svg>
);

const DockerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13.983 11.078h2.119v-2.006h-2.119v2.006zm-2.737 0h2.119v-2.006h-2.119v2.006zm-2.737 0h2.12v-2.006h-2.12v2.006zm-2.737 0h2.119v-2.006H5.772v2.006zm-.001-2.247h2.119V6.824H5.771v2.007zm2.737 0h2.12V6.824h-2.12v2.007zm2.737 0h2.119V6.824h-2.119v2.007zM5.772 6.598h2.119V4.592H5.772v2.006zm19.228 5.61s-.519-1.078-1.579-1.078h-2.753V8.831h-2.12v2.247h-11.83v2.247h15.934c2.227 0 2.348-2.112 2.348-2.112zM2.385 14.325c.324 0 .64-.032.955-.096.347 1.341 1.488 2.34 2.871 2.34 1.383 0 2.524-1 2.871-2.34.63.128 1.28.192 1.93.192.65 0 1.3-.064 1.93-.192.347 1.34 1.488 2.34 2.871 2.34 1.383 0 2.524-1 2.871-2.34a6.388 6.388 0 0 0 4.14-1.92c-1.127.32-2.343.32-3.47 0 .195-.384.343-.79.444-1.206-.444.224-.913.385-1.399.48a6.39 6.39 0 0 1-5.717-.032c-.443-.224-.912-.385-1.398-.48-.918 1.92-2.859 3.232-5.112 3.232a5.518 5.518 0 0 1-4.048-1.76z"/>
  </svg>
);

const AWSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
  </svg>
);

const RedisIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5zm0 18l-8-4v-3.5L2 9.5v7l10 5 10-5-10-5v-7zm0-6l-8-4V7.5L2 6.5v2l10 5 10-5-10-5v-2z"/>
  </svg>
);

const TailwindIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.026,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.336,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.537,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.336,13.382,8.976,12,6.001,12z"/>
  </svg>
);

const NodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2L2 7.7v10.6L12 22l10-5.7V7.7L12 2zm-1 16.4l-6.2-3.6v-7.2l6.2 3.6v7.2zm2 0V11.2l6.2-3.6v7.2l-6.2 3.6z"/>
  </svg>
);

const PythonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14.25.18c.9 0 1.66.72 1.66 1.62v2.88h-3.66c-.36 0-.66.3-.66.66v2.16c0 .36.3.66.66.66h5.88c.9 0 1.62-.72 1.62-1.62V3.42A3.24 3.24 0 0 0 16.5.18zm-4.5 23.64c-.9 0-1.66-.72-1.66-1.62v-2.88h3.66c.36 0 .66-.3.66-.66v-2.16c0-.36-.3-.66-.66-.66H5.88c-.9 0-1.62.72-1.62 1.62v4.68a3.24 3.24 0 0 0 3.24 3.24z"/>
  </svg>
);

const GitIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.377 10.793l-8.3-8.3a2.007 2.007 0 0 0-2.83 0l-1.3 1.3 3.03 3.03a2.016 2.016 0 0 1 2.83 0 2.019 2.019 0 0 1 0 2.83l-2.9 2.9v4.25a2.032 2.032 0 1 1-2.02 2.02v-4.25a2.019 2.019 0 0 1-1.01-1.74 2.009 2.009 0 0 1 .52-1.35l-3.05-3.05a2.016 2.016 0 0 0 0-2.83l1.3-1.3-1.82-1.82a2.007 2.007 0 0 0-2.83 0l-8.3 8.3a2.007 2.007 0 0 0 0 2.83l8.3 8.3a2.007 2.007 0 0 0 2.83 0l8.3-8.3a2.007 2.007 0 0 0 0-2.83z"/>
  </svg>
);

const TECH_STACK = [
  { name: "Next.js", icon: NextIcon },
  { name: "React", icon: ReactIcon },
  { name: "TypeScript", icon: TSIcon },
  { name: "Golang", icon: GoIcon },
  { name: "PostgreSQL", icon: PostgresIcon },
  { name: "Docker", icon: DockerIcon },
  { name: "AWS", icon: AWSIcon },
  { name: "Redis", icon: RedisIcon },
  { name: "TailwindCSS", icon: TailwindIcon },
  { name: "Node.js", icon: NodeIcon },
  { name: "Python", icon: PythonIcon },
  { name: "Git & CI/CD", icon: GitIcon },
];

export function TechMarquee() {
  const items = [...TECH_STACK, ...TECH_STACK];

  return (
    <div className="relative w-full overflow-hidden border-t border-border bg-neutral-50/30 dark:bg-[#07070a]/40 py-8 md:py-10">
      {/* Linear gradients masking left/right boundaries */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex w-max overflow-hidden">
        <motion.div
          className="flex gap-20 pr-20 items-center"
          animate={{ x: [0, "-50%"] }}
          transition={{
            ease: "linear",
            duration: 30,
            repeat: Infinity,
          }}
        >
          {items.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div key={idx} className="flex items-center gap-4 group">
                <Icon className="h-5.5 w-5.5 text-muted-foreground/35 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 shrink-0" />
                <span
                  className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground/35 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-105 transition-all duration-300 select-none cursor-pointer whitespace-nowrap"
                >
                  {tech.name}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/20 ml-16 shrink-0" />
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
