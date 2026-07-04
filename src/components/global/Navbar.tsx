'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { List, GithubLogo, LinkedinLogo, FacebookLogo } from "@phosphor-icons/react";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import { Logo } from "@/components/global/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Magnetic } from "@/components/global/Magnetic";

// Resilience fallback — used only if navLinks isn't provided or the fetch returned none,
// so the header is never blank while the DB source of truth is unreachable.
const FALLBACK_NAV_LINKS = [
  { name: "Journey", href: "/#journey" },
  { name: "Experience", href: "/#experience" },
  { name: "Skills", href: "/#skills" },
  { name: "Work", href: "/#work" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/contact" },
  { name: "About", href: "/about" },
];

const SocialLinks = [
  { Icon: GithubLogo, href: "https://github.com/mdmhrz", label: "GitHub" },
  { Icon: LinkedinLogo, href: "https://www.linkedin.com/in/mdmhrz", label: "LinkedIn" },
  { Icon: FacebookLogo, href: "https://www.facebook.com/mdmhrz", label: "Facebook" },
];

const RESUME_URL =
  "https://drive.google.com/file/d/1c6qzTSxSI84Tx2DBd5QByb_B1Kc6lxaU/view?usp=drive_link";

const NAV_OFFSET = 96;

interface NavLinkItem {
  label: string;
  href: string;
  showInNav: boolean;
}

interface NavbarProps {
  navLinks?: NavLinkItem[];
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoUrlDark?: string | null;
  logoAltDark?: string | null;
}

export function Navbar({ navLinks, logoUrl, logoAlt, logoUrlDark, logoAltDark }: NavbarProps = {}) {
  const filtered = navLinks?.filter((l) => l.showInNav) ?? [];
  const links = filtered.length > 0
    ? filtered.map((l) => ({ name: l.label, href: l.href }))
    : FALLBACK_NAV_LINKS;
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>("");
  // Radix Sheet portals to <body> by default, which escapes AppearanceColorScope
  // ([data-appearance="public"]). Render the portal inside the scope so the
  // mobile sidebar inherits the same theme variables as the rest of the page.
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(
      document.querySelector<HTMLElement>("[data-appearance='public']") ?? document.body
    );
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

  // Scroll-spy: highlight the nav link of the section currently in view (only on homepage).
  useEffect(() => {
    if (pathname !== "/") return;

    const ids = ["home", ...links.map((l) => l.href.includes("#") ? l.href.split("#")[1] : "").filter(Boolean)];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${NAV_OFFSET}px 0px -55% 0px`,
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname, links]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-50 px-4 py-4 pointer-events-none md:px-6"
    >
      <motion.nav className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-border bg-background/70 px-5 py-3 backdrop-blur-xl transition-colors duration-300 md:px-7">
        <a
          href="/"
          onClick={(e) => handleNavClick(e, "/#home")}
          aria-label="Home"
        >
          <Logo src={logoUrl} alt={logoAlt} srcDark={logoUrlDark} altDark={logoAltDark} />
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const linkAnchor = link.href.includes("#") ? link.href.split("#")[1] : "";
            const isActive = link.href === pathname || (pathname === "/" && linkAnchor && activeId === linkAnchor);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
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
            <Button
              asChild
              className="hidden h-9 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.03] active:scale-95 sm:inline-flex"
            >
              <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">
                Resume
              </a>
            </Button>
          </Magnetic>

          {/* Mobile sidebar */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="h-9 w-9">
                  <List size={24} weight="bold" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                container={portalContainer}
                className="w-[85vw] border-l border-border bg-background/95 p-0 backdrop-blur-xl sm:w-[400px]"
              >
                <SheetHeader className="flex flex-row items-center justify-between border-b border-border p-6">
                  <SheetTitle asChild>
                    <a href="/" aria-label="Home">
                      <Logo src={logoUrl} alt={logoAlt} srcDark={logoUrlDark} altDark={logoAltDark} />
                    </a>
                  </SheetTitle>
                  <ThemeToggle />
                </SheetHeader>

                <nav className="flex flex-col gap-2 p-6">
                  {links.map((link) => {
                    const linkAnchor = link.href.includes("#") ? link.href.split("#")[1] : "";
                    const isActive = link.href === pathname || (pathname === "/" && linkAnchor && activeId === linkAnchor);
                    return (
                      <SheetClose asChild key={link.name}>
                        <a
                          href={link.href}
                          onClick={(e) => handleNavClick(e, link.href)}
                          className={`text-2xl font-medium tracking-tight transition-all duration-300 hover:translate-x-1 ${
                            isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {link.name}
                        </a>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="p-6 pt-0">
                  <Button
                    asChild
                    className="h-10 w-full rounded-full text-xs font-semibold uppercase tracking-[0.16em]"
                  >
                    <a href={RESUME_URL} target="_blank" rel="noopener noreferrer">
                      Resume
                    </a>
                  </Button>
                </div>

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
