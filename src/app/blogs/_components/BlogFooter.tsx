'use client';

import Link from "next/link";
import {
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
  EnvelopeSimple,
  ArrowUpRight,
} from "@phosphor-icons/react";
import { Logo } from "@/components/global/Logo";

const socials = [
  { name: "GitHub", Icon: GithubLogo, href: "https://github.com/mdmhrz" },
  { name: "LinkedIn", Icon: LinkedinLogo, href: "https://www.linkedin.com/in/mdmhrz" },
  { name: "Facebook", Icon: FacebookLogo, href: "https://www.facebook.com/mdmhrz" },
  { name: "Email", Icon: EnvelopeSimple, href: "mailto:mdmobarakhossainrazu@gmail.com" },
];

export function BlogFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <Link href="/" className="flex items-center">
            <Logo className="h-7 w-auto" />
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            View Portfolio
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

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

        <div className="mt-10 border-t border-border/60 pt-6">
          <p className="text-[11px] font-sans uppercase tracking-[0.2em] text-muted-foreground/70">
            © {currentYear} Mobarak Hossain Razu — Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
