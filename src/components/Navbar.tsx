'use client';

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { List, GithubLogo, LinkedinLogo, FacebookLogo } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLenisRef } from "@/components/SmoothScroll";
import { Logo } from "@/components/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Magnetic } from "@/components/Magnetic";

const NavLinks = [
  { name: "Journey", href: "#journey" },
  { name: "Experience", href: "#experience" },
  { name: "Skills", href: "#skills" },
  { name: "Work", href: "#work" },
  { name: "Contact", href: "#contact" },
];

const SocialLinks = [
  { Icon: GithubLogo, href: "https://github.com/mdmhrz", label: "GitHub" },
  { Icon: LinkedinLogo, href: "https://www.linkedin.com/in/mdmhrz", label: "LinkedIn" },
  { Icon: FacebookLogo, href: "https://www.facebook.com/mdmhrz", label: "Facebook" },
];

const NAV_OFFSET = 96;

export function Navbar() {
  const lenisRef = useLenisRef();
  const [activeId, setActiveId] = useState<string>("");

  // Smooth scroll on anchor click — uses Lenis when available, falls back to native.
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

  // Scroll-spy: highlight the nav link of the section currently in view.
  useEffect(() => {
    const ids = ["home", ...NavLinks.map((l) => l.href.slice(1))];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top that is intersecting.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Trigger when a section's top crosses the navbar zone.
        rootMargin: `-${NAV_OFFSET}px 0px -55% 0px`,
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 px-4 py-4 pointer-events-none md:px-6"
    >
      <motion.nav className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-border bg-background/70 px-5 py-3 backdrop-blur-xl transition-colors duration-300 md:px-7">
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, "#home")}
          aria-label="Home"
        >
          <Logo />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {NavLinks.map((link) => {
            const isActive = activeId === link.href.slice(1);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Magnetic>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              className="hidden h-9 items-center rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:scale-[1.03] active:scale-95 sm:inline-flex"
            >
              Get in touch
            </a>
          </Magnetic>

          {/* Mobile sidebar */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="p-1.5 text-foreground transition-colors hover:text-muted-foreground"
                >
                  <List size={24} weight="bold" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[85vw] border-l border-border bg-background/95 p-0 backdrop-blur-xl sm:w-[400px]"
              >
                <SheetHeader className="flex flex-row items-center justify-between border-b border-border p-6">
                  <SheetTitle asChild>
                    <a href="#home" aria-label="Home">
                      <Logo />
                    </a>
                  </SheetTitle>
                  <ThemeToggle />
                </SheetHeader>

                <nav className="flex flex-col gap-2 p-6">
                  {NavLinks.map((link) => {
                    const isActive = activeId === link.href.slice(1);
                    return (
                      <SheetClose asChild key={link.name}>
                        <a
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link.href)}
                          className={`text-2xl font-medium tracking-tight transition-all duration-300 hover:translate-x-1 ${
                            isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {link.name}
                        </a>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="space-y-4 p-6">
                  <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    Connect
                  </span>
                  <div className="flex gap-3">
                    {SocialLinks.map(({ Icon, href, label }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={label}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.nav>
    </motion.header>
  );
}
