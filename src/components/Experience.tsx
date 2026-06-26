'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  MapPin,
  Lightning,
  X,
  Globe,
  Users,
  ShieldCheck,
  Browser,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ChartLine,
  Robot,
  CurrencyDollar,
  ChatCircleText,
  Target,
  Wrench
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ProfProject {
  id: string;
  title: string;
  category: string;
  desc: string;
  fullDesc: string;
  quickFacts: string[];
  tech: string[];
  keyFeatures: { title: string; desc: string; icon: React.ReactNode }[];
  contributions: string[];
  role: string;
  live: string;
  accent: string;
  image: string;
}

const profProjects: ProfProject[] = [
  {
    id: "taskip",
    title: "Taskip",
    category: "Full-Scale Agency OS",
    desc: "All-in-one agency management and white-label client portal platform for digital service teams.",
    fullDesc: "Taskip serves as a comprehensive operating system that replaces fragmented tools like Asana and Trello. It consolidates CRM, project management, billing, and collaboration features into a single, high-performance workspace. Developed for freelancers and digital agencies, it allows businesses to build branded hubs with granular permissions and automated workflows.",
    quickFacts: ["HQ: Dhaka, Bangladesh", "Client: Xgenious", "Core: Agency CRM & Project Management"],
    tech: ["Next.js", "Shadcn UI", "Zustand", "TypeScript", "Zod", "React DnD", "Realtime Data", "Vercel", "Laravel (Backend)"],
    keyFeatures: [
      { title: "White-Label Portal", desc: "Custom branding, domains, and granular client permissions.", icon: <Browser weight="duotone" /> },
      { title: "Financial & Billing", desc: "Automated quotes, proposals, and digital signatures with Stripe integration.", icon: <CurrencyDollar weight="duotone" /> },
      { title: "AI Utilities", desc: "Contextual message replies and automated project scope drafting.", icon: <Robot weight="duotone" /> },
      { title: "Communication Suite", desc: "Centralized live chat, email structures, and direct WhatsApp integration.", icon: <ChatCircleText weight="duotone" /> },
      { title: "Project Management", desc: "Built-in time tracking, task estimation metrics, and internal/external file visibility.", icon: <Target weight="duotone" /> }
    ],
    contributions: [
      "Engineered 30+ CRM modules including Pipelines, Tickets, and Client Portals",
      "Optimized build procedures and frontend architecture for maximum runtime performance",
      "Implemented complex Authentication and Real-time data synchronization layers",
      "Redesigned Dashboard and Discussion modules for improved user engagement"
    ],
    role: "Frontend Developer",
    live: "https://taskip.app",
    accent: "#14b8a6",
    image: "/projects/taskip.png"
  },
  {
    id: "reportgenix",
    title: "Reportgenix",
    category: "AI E-commerce Analytics",
    desc: "AI-powered reporting platform for Shopify merchants to track sales, profits, and behavior instantly.",
    fullDesc: "Reportgenix simplifies complex data analysis for Shopify store owners. It features a natural language processing assistant (Genix AI) that allows users to ask business questions in plain English and receive instant charts and predictive trends. It manages sales, inventory, and customer behavior reports without the need for manual spreadsheets.",
    quickFacts: ["Focus: Shopify Analytics", "Core: AI Dashboard", "Status: Scale"],
    tech: ["React (Vite)", "Laravel", "AI Assistant", "Data Visualization", "Tailwind CSS"],
    keyFeatures: [
      { title: "Genix AI Assistant", desc: "Ask business questions in plain English for instant custom reports.", icon: <Robot weight="duotone" /> },
      { title: "Custom Report Builder", desc: "Drag-and-drop system with 100+ pre-built analytics templates.", icon: <Wrench weight="duotone" /> },
      { title: "Workflow Automation", desc: "Live sync every few minutes with email and Slack reporting.", icon: <Clock weight="duotone" /> },
      { title: "Global Support", desc: "Multi-currency aggregation and normalization for cross-border operations.", icon: <Globe weight="duotone" /> }
    ],
    contributions: [
      "Lead developer for the Core Report Builder interface",
      "Architected the drag-and-drop template system for merchants",
      "Implemented real-time Shopify data visualization layers",
      "Integrated multi-currency support into the analytics engine"
    ],
    role: "Frontend Developer",
    live: "https://reportgenix.com/",
    accent: "#8b5cf6",
    image: "/projects/reportgenix.png"
  },
  {
    id: "xilancer",
    title: "Xilancer",
    category: "Freelance Marketplace",
    desc: "Pre-built marketplace clone script enabling entrepreneurs to launch service platforms globally.",
    fullDesc: "Xilancer is a high-end freelance marketplace script designed by Xgenious. It mimics the popular gig-based business models, providing fixed-price contracts, custom requests, and hourly hiring through a secure milestone-based infrastructure.",
    quickFacts: ["Type: Codecanyon Product", "Audience: Entrepreneurs", "Stack: Laravel Ecosystem"],
    tech: ["Laravel", "HTML5", "CSS3", "JavaScript", "Bootstrap", "Flutter App Support"],
    keyFeatures: [
      { title: "Project Models", desc: "Fixed-price gigs, custom requests, and hourly contracts.", icon: <Target weight="duotone" /> },
      { title: "Escrow Wallet", desc: "Secure milestone-based payment system with integrated web-wallets.", icon: <ShieldCheck weight="duotone" /> },
      { title: "Communication", desc: "In-app live chat tool with file attachment support.", icon: <ChatCircleText weight="duotone" /> },
      { title: "Monetization", desc: "Commission settings, subscription plans, and featured promotions.", icon: <ChartLine weight="duotone" /> }
    ],
    contributions: [
      "Assigned as the key Frontend Developer during the project's inception in the company",
      "Developed the modular project model architecture and gig interfaces",
      "Integrated the milestone-based secure payment flow UX",
      "Engineered the administrative word-phrase auditing and security tools"
    ],
    role: "Frontend Developer",
    live: "https://xilancer.xgenious.com/",
    accent: "#f59e0b",
    image: "/projects/xilancer.png"
  }
];

export function Experience() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Initial load animations
    const ctx = gsap.context(() => {
      // Title reveal
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

      // Stagger cards reveal
      cardsRef.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 100, rotateX: 10 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
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

  useEffect(() => {
    if (selectedProjectId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProjectId]);

  const selectedProject = profProjects.find(p => p.id === selectedProjectId);

  return (
    <section ref={containerRef} id="experience" className="py-40 relative bg-background overflow-hidden border-y border-border">
      <div className="container max-w-7xl mx-auto px-6">
        <div
          ref={titleRef}
          className="mb-24 flex flex-col items-start gap-4"
        >
          <span className="text-foreground/50 text-xs font-bold uppercase tracking-[0.4em] ml-1">The Career Record</span>
          <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-tight uppercase">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50">Tenure</span>
          </h2>
        </div>

        {/* Company Node: XGENIOUS */}
        <div
          ref={el => { if (el) cardsRef.current[0] = el; }}
          className="glass-card mb-20 p-8 md:p-12 bg-card border-border overflow-hidden relative group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
        >
          <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2 opacity-50">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm tracking-widest uppercase"><MapPin size={14} /> Dhaka, BD</div>
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em]">Active Since 2024</div>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <Briefcase className="text-foreground w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none mb-3">XGENIOUS</h3>
                <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em]">
                  <Lightning size={16} weight="duotone" /> Senior Frontend Developer
                </div>
              </div>
            </div>

            <div className="max-w-4xl space-y-6">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Leading the frontend evolution of complex SaaS architectures and enterprise marketplace solutions. Specialized in optimizing massive React/Next.js codebases and implementing advanced state machines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                  <CheckCircle size={20} className="text-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Architected 30+ CRM modules across integrated SaaS ecosystems.</span>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                  <CheckCircle size={20} className="text-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Optimized build performance and frontend latency for global users.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Projects Inventory */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-grow" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em] whitespace-nowrap">Core Engineering Accomplishments</span>
            <div className="h-px bg-border flex-grow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {profProjects.map((p, idx) => (
              <div
                key={p.id}
                ref={el => { if (el) cardsRef.current[idx + 1] = el; }}
                onClick={() => setSelectedProjectId(p.id)}
                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden glass-card border-border hover:border-foreground/20 transition-all cursor-pointer bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none"
              >
                {/* Image Container with inner shadow for depth */}
                <div className="absolute inset-x-0 top-0 h-[60%] overflow-hidden z-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20 z-10 pointer-events-none" />
                  <Image 
                    src={p.image} 
                    alt={p.title} 
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Overlay to blend image with card background slightly */}
                  <div className="absolute inset-0 bg-background/10 mix-blend-multiply transition-opacity group-hover:opacity-0" />
                </div>
                
                {/* Gradient transition from image to solid content area */}
                <div className="absolute inset-x-0 top-[40%] h-[25%] bg-gradient-to-b from-transparent via-background/80 to-background z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-[45%] bg-card z-10 pointer-events-none" />

                <div className="absolute inset-0 p-8 flex flex-col justify-end z-20">
                  <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div>
                      <Badge className="bg-foreground/5 text-foreground border-border mb-3 px-3 py-1 rounded-full text-[9px] font-bold tracking-widest backdrop-blur-md">{p.category.toUpperCase()}</Badge>
                      <h4 className="text-2xl md:text-3xl font-black text-foreground drop-shadow-sm tracking-tighter">{p.title}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {p.desc}
                    </p>
                    <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-2">
                      Explore Technical Scope <ArrowUpRight weight="bold" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL-PAGE IMMERSIVE STAGE - PORTAL */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100000] bg-background overflow-y-auto no-scrollbar scroll-smooth"
            >
              <div className="min-h-screen relative bg-background">
                {/* Immersive Header (Hides Navbar) */}
                <div className="fixed top-0 left-0 w-full p-6 md:p-8 flex justify-between items-center z-[100001] bg-background/80 backdrop-blur-3xl border-b border-border">
                  <div className="text-foreground font-bold text-xl tracking-tighter">MHR.DEV <span className="text-muted-foreground ml-3">/ PROJECT STAGE</span></div>
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-card transition-all bg-background group shadow-sm dark:shadow-none"
                  >
                    <X size={24} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                  {/* Hero Section (Cleaned Up & Restyled) */}
                <div className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-border">
                  <div className="absolute inset-0 z-0 bg-background">
                    <Image 
                      src={selectedProject.image} 
                      alt={selectedProject.title} 
                      fill
                      className="object-cover object-top opacity-[0.15] mix-blend-overlay blur-xl"
                      priority
                    />
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-3xl" />
                  </div>

                  <div className="container max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-end justify-between gap-12">
                    
                    {/* Left: Huge Title */}
                    <div className="space-y-6 max-w-4xl">
                      <Badge className="bg-foreground/5 text-foreground border-border px-6 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase">
                        {selectedProject.category}
                      </Badge>
                      <h2 className="text-6xl md:text-[6rem] lg:text-[8rem] font-medium tracking-tight leading-[0.9] text-foreground">
                        {selectedProject.title}
                      </h2>
                    </div>

                    {/* Right: Quick Tech Tags */}
                    <div className="flex flex-wrap md:justify-end gap-2 max-w-sm mb-4">
                      {selectedProject.tech.map(t => (
                        <span key={t} className="text-[10px] font-medium text-muted-foreground border border-border px-4 py-1.5 rounded-full bg-card shadow-sm dark:shadow-none">
                          {t}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Technical Content Deep-Dive */}
                <div className="container max-w-7xl mx-auto py-20 px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                  
                  {/* Left Column: Vision & Features */}
                  <div className="lg:col-span-8 space-y-24">
                    
                    {/* Vision Text */}
                    <div className="space-y-8">
                      <p className="text-xl md:text-3xl text-foreground font-medium leading-[1.6] tracking-tight">
                        {selectedProject.fullDesc}
                      </p>
                      
                      {/* Image Presentation */}
                      <div className="w-full aspect-[16/10] relative rounded-3xl overflow-hidden border border-border bg-card mt-16 shadow-lg dark:shadow-none">
                         <Image 
                           src={selectedProject.image}
                           alt={selectedProject.title}
                           fill
                           className="object-cover object-top"
                         />
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-12">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-foreground" />
                        <h4 className="text-foreground text-sm font-bold uppercase tracking-[0.2em]">Core Capabilities</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {selectedProject.keyFeatures.map((f, i) => (
                          <div key={i} className="p-8 rounded-3xl bg-card border border-border hover:border-foreground/20 transition-all group shadow-sm dark:shadow-none">
                            <div className="text-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                              {f.icon}
                            </div>
                            <h5 className="text-lg font-bold text-foreground mb-2">{f.title}</h5>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              {f.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sticky Sidebar Info */}
                  <div className="lg:col-span-4 space-y-12">
                    <div className="sticky top-40 space-y-8">
                      
                      {/* Live Operation Button */}
                      <a href={selectedProject.live} target="_blank" rel="noreferrer" className="block mb-12">
                        <Button className="w-full h-16 rounded-2xl bg-foreground text-background font-medium text-base hover:scale-[1.02] active:scale-95 transition-all shadow-lg border border-border">
                          View Live Project <ArrowUpRight size={20} className="ml-3" />
                        </Button>
                      </a>

                      {/* Quick Facts */}
                      <div className="space-y-6">
                         <h4 className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">Project Facts</h4>
                         <div className="space-y-4">
                            {selectedProject.quickFacts.map((fact, i) => (
                              <div key={i} className="py-3 border-b border-border text-foreground font-medium text-sm">
                                {fact}
                              </div>
                            ))}
                         </div>
                      </div>

                      {/* Role & Contributions */}
                      <div className="pt-10 space-y-6">
                         <h4 className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">Engineering Role</h4>
                         <div className="text-foreground font-black text-2xl tracking-tight leading-none mb-6">
                           {selectedProject.role}
                         </div>
                         
                         <div className="space-y-4 pt-4">
                           {selectedProject.contributions.map((imp, i) => (
                             <div key={i} className="flex gap-4 items-start">
                               <CheckCircle size={16} className="text-foreground mt-1 shrink-0" />
                               <span className="text-sm text-muted-foreground leading-relaxed">{imp}</span>
                             </div>
                           ))}
                         </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Footer Signature */}
                <div className="py-40 text-center opacity-5 select-none pointer-events-none sticky bottom-0">
                  <h3 className="text-[18vw] font-black text-foreground leading-none tracking-tighter uppercase whitespace-nowrap">
                    {selectedProject.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}
