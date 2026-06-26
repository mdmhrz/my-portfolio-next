'use client';

import { 
  GithubLogo, 
  LinkedinLogo, 
  TwitterLogo, 
  Envelope, 
  ArrowUpRight 
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const socials = [
  { name: "GitHub", icon: <GithubLogo weight="bold" className="w-6 h-6" />, href: "https://github.com" },
  { name: "LinkedIn", icon: <LinkedinLogo weight="bold" className="w-6 h-6" />, href: "https://linkedin.com" },
  { name: "Twitter", icon: <TwitterLogo weight="bold" className="w-6 h-6" />, href: "https://twitter.com" },
  { name: "Email", icon: <Envelope weight="bold" className="w-6 h-6" />, href: "mailto:hello@mhr.dev" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative pt-24 pb-12 overflow-hidden bg-background">
      {/* Decorative Gradient Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
      
      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="text-foreground font-display font-black text-3xl tracking-tighter">
                MHR.DEV
              </div>
              <p className="text-muted-foreground font-sans text-lg max-w-md leading-relaxed">
                Engineering high-performance digital products and immersive experiences with a focus on scalability and precision.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-300 group"
                  title={social.name}
                >
                  <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-foreground font-display font-bold text-lg uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4">
              {["Hero", "Journey", "Experience", "Workflow", "Projects"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-foreground font-mono text-sm tracking-tight transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Availability Status */}
          <div className="space-y-8">
            <h4 className="text-foreground font-display font-bold text-lg uppercase tracking-widest">Status</h4>
            <div className="glass-card p-6 border-border bg-card shadow-sm dark:shadow-none space-y-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-foreground"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">Available for Hire</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Currently open to new opportunities and interesting technical challenges.
              </p>
              <Button variant="outline" size="sm" className="w-full border-border text-foreground hover:bg-foreground/5 text-xs font-bold uppercase tracking-widest h-9">
                Get In Touch <ArrowUpRight weight="bold" className="ml-2 w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-border gap-8">
          <div className="flex items-center gap-8 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.3em]">
            <span>© {currentYear} ALL RIGHTS RESERVED</span>
            <span className="hidden md:block w-px h-3 bg-border" />
            <span className="hidden md:block">LOCATED IN BANGLADESH</span>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-foreground/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative font-display font-black text-4xl text-foreground/[0.03] select-none tracking-tighter">
              MOBARAK HOSSAIN RAZU
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Logo Outline Background */}
      <div className="absolute -bottom-24 -left-20 text-[20rem] font-black text-foreground/[0.02] select-none pointer-events-none leading-none tracking-tighter">
        MHR
      </div>
    </footer>
  );
}
