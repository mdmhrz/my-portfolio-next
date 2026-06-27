'use client';

import { useEffect, useState } from "react";
import {
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
  EnvelopeSimple,
  ArrowUpRight,
  ArrowUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useLenisRef } from "@/components/SmoothScroll";

const socials = [
  { name: "GitHub", Icon: GithubLogo, href: "https://github.com/mdmhrz" },
  { name: "LinkedIn", Icon: LinkedinLogo, href: "https://www.linkedin.com/in/mdmhrz" },
  { name: "Facebook", Icon: FacebookLogo, href: "https://www.facebook.com/mdmhrz" },
  { name: "Email", Icon: EnvelopeSimple, href: "mailto:mdmobarakhossainrazu@gmail.com" },
];

const nav = [
  { label: "Home", href: "#home" },
  { label: "Journey", href: "#journey" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

const NAV_OFFSET = 96;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const lenisRef = useLenisRef();
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState("");
  const [ping, setPing] = useState(12);

  const [isWatermarkHovered, setIsWatermarkHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);
      setTimeString(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const pingInterval = setInterval(() => {
      setPing(Math.floor(Math.random() * 6) + 10); // Simulated ping between 10-15ms
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(pingInterval);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    const lenis = lenisRef?.current;
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, { offset: -NAV_OFFSET });
    } else {
      const top = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -bottom-48 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 dark:bg-indigo-500/5 blur-[120px] rounded-full" />
      
      {/* Top hairline accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 py-20 md:grid-cols-12 md:gap-10">
          
          {/* Brand Column */}
          <div className="space-y-5 md:col-span-5">
            <a href="#home" aria-label="Home" className="inline-block">
              <Logo className="h-8 w-auto" />
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Full-stack developer building production SaaS, CRM, and web apps — from Next.js
              interfaces to Node.js &amp; Go APIs, PostgreSQL, and Docker-on-AWS deployments.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ name, Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-indigo-600/40 dark:hover:border-indigo-400/40 hover:bg-indigo-600/5 dark:hover:bg-indigo-400/5 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Icon className="h-[18px] w-[18px]" weight="regular" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-5 md:col-span-3">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
              Navigation
            </h4>
            <ul className="space-y-3">
              {nav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="group relative inline-flex items-center text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    <span>{item.label}</span>
                    <span className="absolute left-0 right-0 bottom-[-2px] h-[1px] bg-indigo-500 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status Column */}
          <div className="space-y-5 md:col-span-4">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
              Availability
            </h4>
            
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] text-foreground">
                    Open for roles
                  </span>
                </div>
                <span className="text-[9px] font-mono uppercase text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Currently accepting freelance contracts, SaaS consulting, and full-time frontend/full-stack engineering roles.
              </p>

              <div className="space-y-2 text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="text-foreground font-medium">Remote / UTC+6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Primary Stack</span>
                  <span className="text-foreground font-medium">React, Next.js, Go</span>
                </div>
              </div>

              <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")} className="block pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-indigo-600/20 dark:border-indigo-400/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600/5 dark:hover:bg-indigo-400/5 hover:border-indigo-600/40 dark:hover:border-indigo-400/40 transition-colors duration-300"
                >
                  Get in touch
                  <ArrowUpRight weight="bold" className="ml-1 h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Outlined / Hover Signature Watermark */}
        <div 
          onMouseEnter={() => setIsWatermarkHovered(true)}
          onMouseLeave={() => setIsWatermarkHovered(false)}
          className="relative group/watermark select-none overflow-hidden pt-6 pb-2 text-center"
        >
          <span 
            className={`block text-[clamp(2rem,11.5vw,7.5rem)] font-extrabold uppercase leading-none tracking-tighter select-none pointer-events-none transition-all duration-700 ${
              isWatermarkHovered 
                ? "text-indigo-600/70 dark:text-indigo-400/80" 
                : "text-muted-foreground/20 dark:text-zinc-700/40"
            }`}
            style={{ 
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "1px currentColor"
            }}
          >
            Mobarak Hossain
          </span>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border py-8 md:flex-row">
          <div className="flex items-center gap-4 text-[10px] font-mono font-medium uppercase tracking-[0.3em] text-muted-foreground">
            <span>© {currentYear} MHR.DEV</span>
            <span className="hidden h-3 w-px bg-border md:block" />
            <span>
              {mounted ? `Dhaka, BD — ${timeString}` : "Dhaka, Bangladesh"}
            </span>
          </div>
          
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="group flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors duration-300 group-hover:border-indigo-600 dark:group-hover:border-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              <ArrowUp weight="bold" className="h-3 w-3" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
