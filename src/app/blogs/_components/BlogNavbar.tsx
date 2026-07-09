'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import { Logo } from "@/components/global/Logo";
import { cn } from "@/lib/utils";

const navLinkBase =
  "text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300";

interface BlogNavbarProps {
  logoUrl?: string | null;
  logoAlt?: string | null;
  logoUrlDark?: string | null;
  logoAltDark?: string | null;
}

export function BlogNavbar({ logoUrl, logoAlt, logoUrlDark, logoAltDark }: BlogNavbarProps = {}) {
  const pathname = usePathname();
  const onBlogs = pathname.startsWith("/blogs");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Back to portfolio home" className="flex items-center">
          <Logo className="h-7 w-auto" src={logoUrl} alt={logoAlt} srcDark={logoUrlDark} altDark={logoAltDark} />
        </Link>

        <nav className="flex items-center gap-5 sm:gap-8">
          <Link
            href="/blogs"
            className={cn(
              navLinkBase,
              onBlogs ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Blogs
          </Link>
          <Link
            href="/"
            className={cn(
              navLinkBase,
              "text-muted-foreground hover:text-foreground"
            )}
          >
            Portfolio
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
