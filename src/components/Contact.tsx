'use client';

import { Button } from "@/components/ui/button";
import { Envelope, MapPin, Globe, PaperPlaneTilt, GithubLogo, LinkedinLogo, TwitterLogo } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const contactInfo = [
  {
    icon: <Envelope size={24} weight="duotone" className="text-primary" />,
    label: "Email",
    value: "hello@mhr.dev",
    href: "mailto:hello@mhr.dev"
  },
  {
    icon: <MapPin size={24} weight="duotone" className="text-primary" />,
    label: "Location",
    value: "Dhaka, Bangladesh",
    href: "#"
  },
  {
    icon: <Globe size={24} weight="duotone" className="text-primary" />,
    label: "Timezone",
    value: "GMT+6 (BST)",
    href: "#"
  }
];

const socials = [
  { icon: <GithubLogo size={20} />, href: "#" },
  { icon: <LinkedinLogo size={20} />, href: "#" },
  { icon: <TwitterLogo size={20} />, href: "#" }
];

export function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Info column animation
      gsap.fromTo(infoRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          }
        }
      );

      // Form animation
      gsap.fromTo(formRef.current,
        { opacity: 0, x: 50, rotateY: 10 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="contact" className="py-40 px-6 relative overflow-hidden bg-background border-t border-border">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Column: Info */}
          <div ref={infoRef} className="space-y-12">
            <div className="space-y-6">
              <span className="text-primary text-xs font-bold uppercase tracking-[0.4em]">
                Inquiries
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
                Let&apos;s talk about <br /> your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">next project.</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
                Whether you have a specific project in mind or just want to say hi, my inbox is always open.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {contactInfo.map((info, idx) => (
                <a 
                  key={idx}
                  href={info.href}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all group shadow-sm dark:shadow-none"
                >
                  <div className="mb-4">{info.icon}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{info.label}</div>
                  <div className="text-foreground font-medium group-hover:text-primary transition-colors">{info.value}</div>
                </a>
              ))}
              
              <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-end shadow-sm dark:shadow-none">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Follow Me</div>
                <div className="flex gap-4">
                  {socials.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.href}
                      className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div 
            ref={formRef}
            className="glass-card p-8 md:p-12 bg-card backdrop-blur-3xl shadow-lg z-10 perspective-[1000px]"
          >
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Inquiry Type</label>
                <select className="w-full bg-card border border-border rounded-xl px-4 py-4 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans cursor-pointer appearance-none">
                  <option className="bg-background">SaaS Development</option>
                  <option className="bg-background">UX/UI Engineering</option>
                  <option className="bg-background">System Architecture</option>
                  <option className="bg-background">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  rows={4}
                  placeholder="Tell me about your project..."
                  className="w-full bg-card border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans resize-none"
                />
              </div>

              <Button className="w-full h-16 rounded-xl bg-foreground text-background font-bold text-base uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg group border border-border">
                Send Message <PaperPlaneTilt size={20} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
