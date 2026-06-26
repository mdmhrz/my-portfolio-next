'use client';

'use client';

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
      {/* Top hairline accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 py-20 md:grid-cols-12 md:gap-10">
          {/* Brand */}
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground/30 hover:bg-card hover:text-foreground"
                >
                  <Icon className="h-[18px] w-[18px]" weight="regular" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-5 md:col-span-3">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {nav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    <span className="h-1 w-1 rounded-full bg-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Status */}
          <div className="space-y-5 md:col-span-4">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Status
            </h4>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-foreground" />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-foreground">
                  Available for hire
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Open to new opportunities and interesting technical challenges.
              </p>
              <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")} className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full rounded-full border-border text-foreground hover:bg-foreground/5"
                >
                  Get in touch
                  <ArrowUpRight weight="bold" className="ml-1 h-3 w-3" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Outlined name watermark — visible design centerpiece */}
        <div
          aria-hidden
          className="select-none whitespace-nowrap pt-4 text-center text-[clamp(2.5rem,11vw,7rem)] font-semibold uppercase leading-none tracking-tight text-muted-foreground/15"
        >
          Mobarak Hossain
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border py-8 md:flex-row">
          <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            <span>© {currentYear} MHR.DEV</span>
            <span className="hidden h-3 w-px bg-border md:block" />
            <span className="hidden md:block">Dhaka, Bangladesh</span>
          </div>
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="group flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Back to top
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border transition-colors duration-300 group-hover:border-foreground/30">
              <ArrowUp weight="bold" className="h-3 w-3" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
