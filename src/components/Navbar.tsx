'use client';

import { motion } from "motion/react";
import { List, X, GithubLogo, LinkedinLogo, TwitterLogo, Envelope } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NavLinks = [
  { name: "Journey", href: "#journey" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Workflow", href: "#workflow" },
  { name: "Contact", href: "#contact" },
];

const SocialLinks = [
  { icon: <GithubLogo weight="bold" />, href: "#" },
  { icon: <LinkedinLogo weight="bold" />, href: "#" },
  { icon: <TwitterLogo weight="bold" />, href: "#" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
      className="fixed top-0 left-0 right-0 z-50 py-6 px-6 pointer-events-none"
    >
      <motion.nav
        className="mx-auto w-full max-w-7xl flex items-center justify-between px-8 py-4 rounded-3xl border border-border bg-background/80 glass pointer-events-auto backdrop-blur-3xl transition-all duration-300"
      >
        <div className="text-primary font-display font-bold text-xl tracking-tighter select-none">
          MHR.DEV
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {NavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:text-shadow-glow transition-all duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          <div className="w-px h-6 bg-border hidden md:block" />

          <ThemeToggle />

          <Button 
            variant="default"
            size="sm"
            className="rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] px-8 h-10"
          >
            Hire Me
          </Button>
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 text-foreground hover:text-primary transition-colors">
                <List size={28} weight="bold" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] border-l border-border bg-background/90 backdrop-blur-3xl p-0 flex flex-col justify-between">
              <div>
                <SheetHeader className="p-8 border-b border-border items-start">
                  <div className="flex items-center justify-between w-full">
                    <SheetTitle className="text-primary font-display font-bold text-2xl tracking-tighter">
                      MHR.DEV
                    </SheetTitle>
                    <ThemeToggle />
                  </div>
                </SheetHeader>

                <nav className="p-8 flex flex-col gap-6">
                  {NavLinks.map((link) => (
                    <SheetClose asChild key={link.name}>
                      <a
                        href={link.href}
                        className="text-3xl font-display font-bold text-muted-foreground hover:text-primary hover:pl-4 transition-all duration-300"
                      >
                        {link.name}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
              </div>

              <div className="p-8 space-y-12 mb-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.4em]">Connect</span>
                  <div className="flex gap-4">
                    {SocialLinks.map((social, i) => (
                      <a
                        key={i}
                        href={social.href}
                        className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/20 transition-all"
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                  Message Me
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>
    </motion.header>
  );
}
