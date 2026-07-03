'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
  EnvelopeSimple,
  ArrowUpRight,
  ArrowUp,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/global/Logo";

const DEFAULT_NAME = "Mobarak Hossain";
const DEFAULT_BIO =
  "Full-stack developer building production SaaS, CRM, and web apps — from Next.js interfaces to Node.js & Go APIs, PostgreSQL, and Docker-on-AWS deployments.";
const DEFAULT_GITHUB = "https://github.com/mdmhrz";
const DEFAULT_LINKEDIN = "https://www.linkedin.com/in/mdmhrz";
const DEFAULT_FACEBOOK = "https://www.facebook.com/mdmhrz";
const DEFAULT_EMAIL = "mdmobarakhossainrazu@gmail.com";

interface FooterProfile {
  name?: string | null;
  bio?: string | null;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email?: string | null;
}

const nav = [
  { label: "Journey", href: "/#journey" },
  { label: "Experience", href: "/#experience" },
  { label: "Skills", href: "/#skills" },
  { label: "Work", href: "/#work" },
  { label: "Blog", href: "/blogs" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

const NAV_OFFSET = 96;

interface FooterProps {
  profile?: FooterProfile | null;
  footerText?: string | null;
}

export function Footer({ profile, footerText }: FooterProps = {}) {
  const pathname = usePathname();
  const name = profile?.name || DEFAULT_NAME;
  const socials = [
    { name: "GitHub", Icon: GithubLogo, href: profile?.github || DEFAULT_GITHUB },
    { name: "LinkedIn", Icon: LinkedinLogo, href: profile?.linkedin || DEFAULT_LINKEDIN },
    { name: "Facebook", Icon: FacebookLogo, href: profile?.facebook || DEFAULT_FACEBOOK },
    { name: "Email", Icon: EnvelopeSimple, href: `mailto:${profile?.email || DEFAULT_EMAIL}` },
  ];
  const currentYear = new Date().getFullYear();
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
    const isAnchor = href.startsWith("#") || href.includes("#");
    if (isAnchor) {
      const anchorId = href.includes("#") ? href.split("#")[1] : href.slice(1);
      if (pathname === "/") {
        e.preventDefault();
        const target = document.getElementById(anchorId);
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Background Soft Glow */}
      <div className="pointer-events-none absolute -bottom-48 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full" />

      {/* Top hairline accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 py-20 md:grid-cols-12 md:gap-10">
          
          {/* Brand Column */}
          <div className="space-y-5 md:col-span-5">
            <a href="/" onClick={(e) => handleNavClick(e, "/#home")} aria-label="Home" className="inline-block">
              <Logo className="h-8 w-auto" />
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {footerText || profile?.bio || DEFAULT_BIO}
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ name, Icon, href }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Icon className="h-[18px] w-[18px]" weight="regular" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="space-y-5 md:col-span-3">
            <h4 className="text-[11px] font-sans uppercase tracking-[0.3em] text-primary font-semibold">
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
                    <span className="absolute left-0 right-0 bottom-[-2px] h-[1px] bg-primary origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status Column */}
          <div className="space-y-5 md:col-span-4">
            <h4 className="text-[11px] font-sans uppercase tracking-[0.3em] text-primary font-semibold">
              Availability
            </h4>
            
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-foreground">
                    Open for roles
                  </span>
                </div>
                <span className="text-[9px] font-sans uppercase text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Currently accepting freelance contracts, SaaS consulting, and full-time frontend/full-stack engineering roles.
              </p>

              <div className="space-y-2 text-[10px] font-sans text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <span className="text-foreground font-medium">Remote / UTC+6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Primary Stack</span>
                  <span className="text-foreground font-medium">React, Next.js, Go</span>
                </div>
              </div>

              <a href="/contact" className="block pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors duration-300"
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
                ? "text-primary/70"
                : "text-muted-foreground/20 dark:text-zinc-700/40"
            }`}
            style={{
              WebkitTextFillColor: "transparent",
              WebkitTextStroke: "1px currentColor"
            }}
          >
            {name}
          </span>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border py-8 md:flex-row">
          <div className="flex items-center gap-4 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-muted-foreground">
            <span>© {currentYear} MHR.DEV</span>
            <span className="hidden h-3 w-px bg-border md:block" />
            <span>
              {mounted ? `Dhaka, BD — ${timeString}` : "Dhaka, Bangladesh"}
            </span>
          </div>
          
          <a
            href="/"
            onClick={(e) => handleNavClick(e, "/#home")}
            className="group flex items-center gap-2 text-[10px] font-sans font-medium uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors duration-300 group-hover:border-primary group-hover:text-primary">
              <ArrowUp weight="bold" className="h-3 w-3" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
