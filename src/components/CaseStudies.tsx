'use client';

import { Badge } from "@/components/ui/badge";
import { GithubLogo, Globe } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const personalProjects = [
  {
    title: "NextDrop",
    desc: "A multi tenant based Parcel Managementt System for inside bangladesh with Admin, Rider, Customer dedicated dashboard.",
    tags: ["Personal", "Generative Art", "Creative Coding"],
    img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-8",
    height: "h-[500px]"
  },
  {
    title: "NeuroTrack",
    desc: "Personal health dashboard for tracking cognitive load and productivity trends.",
    tags: ["HealthTech", "Dashboard"],
    img: "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-4",
    height: "h-[500px]"
  },
  {
    title: "Zenith OS",
    desc: "Experiential web-based operating system mockup focused on hyper-minimalism.",
    tags: ["Experimental", "UI/UX"],
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-4",
    height: "h-[450px]"
  },
  {
    title: "Medicare",
    desc: "A Hostel management system including multi role based users.",
    tags: ["E-commerce", "Framer Motion"],
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    span: "md:col-span-8",
    height: "h-[450px]"
  }
];

export function CaseStudies() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
          }
        }
      );

      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, scale: 0.9, y: 50 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="projects" className="py-40 px-6 container max-w-7xl mx-auto">
      <div
        ref={titleRef}
        className="mb-24 space-y-4 text-center md:text-left"
      >
        <span className="text-primary text-xs font-bold uppercase tracking-[0.4em]">Personal Labs</span>
        <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase">Case <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">Studies</span></h2>
        <p className="text-muted-foreground text-lg max-w-xl">Deep dives into my personal ventures, open-source projects, and experimental engineering labs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {personalProjects.map((p, i) => (
          <div
            key={i}
            ref={el => { if (el) cardsRef.current[i] = el; }}
            className={`${p.span} ${p.height} relative group overflow-hidden glass-card border-border cursor-pointer bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110"
              style={{
                backgroundImage: `url('${p.img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-background/50 group-hover:bg-background/20 transition-all duration-500 mix-blend-multiply" />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent opacity-80" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-10 lg:p-14 flex flex-col justify-end h-full z-10">
              <div className="flex gap-3 mb-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                {p.tags.map(tag => (
                  <Badge key={tag} className="bg-foreground/5 text-foreground font-bold border-border px-4 rounded-full backdrop-blur-md">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-foreground mb-4 transition-colors duration-300 tracking-tighter drop-shadow-sm">
                {p.title}
              </h3>
              <p className="text-muted-foreground font-sans text-sm md:text-lg max-w-xl line-clamp-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                {p.desc}
              </p>
            </div>

            {/* Links Corner */}
            <div className="absolute top-10 right-10 flex gap-3 translate-x-12 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
              <a href={p.link} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm">
                <GithubLogo size={20} />
              </a>
              <a href={p.link} className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm">
                <Globe size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
