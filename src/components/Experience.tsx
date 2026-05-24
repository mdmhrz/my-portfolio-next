'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  MapPin,
  Lightning,
  X,
  Globe,
  Cpu,
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
    accent: "#14b8a6"
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
    accent: "#8b5cf6"
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
    accent: "#f59e0b"
  }
];

export function Experience() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    <section id="experience" className="py-40 relative bg-background overflow-hidden border-y border-border">
      <div className="container max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-24 flex flex-col items-start gap-4"
        >
          <span className="text-primary text-xs font-bold uppercase tracking-[0.4em] ml-1">The Career Record</span>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter leading-tight">
            Professional <span className="text-primary">Tenure</span>
          </h2>
        </motion.div>

        {/* Company Node: XGENIOUS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card mb-20 p-8 md:p-12 bg-muted border-primary/20 backdrop-blur-3xl overflow-hidden relative group"
        >
          <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2 opacity-50">
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase"><MapPin size={14} /> Dhaka, BD</div>
            <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em]">Active Since 2024</div>
          </div>

          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                <Briefcase className="text-primary w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none mb-3">XGENIOUS</h3>
                <div className="flex items-center gap-2 text-primary/60 font-bold text-[10px] uppercase tracking-[0.3em]">
                  <Lightning size={16} weight="duotone" /> Senior Frontend Developer
                </div>
              </div>
            </div>

            <div className="max-w-4xl space-y-6">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Leading the frontend evolution of complex SaaS architectures and enterprise marketplace solutions. Specialized in optimizing massive React/Next.js codebases and implementing advanced state machines.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex gap-4 p-4 rounded-xl bg-muted border border-border">
                  <CheckCircle size={20} className="text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">Architected 30+ CRM modules across integrated SaaS ecosystems.</span>
                </div>
                <div className="flex gap-4 p-4 rounded-xl bg-muted border border-border">
                  <CheckCircle size={20} className="text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">Optimized build performance and frontend latency for global users.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Work Projects Inventory */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-px bg-border flex-grow" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em] whitespace-nowrap">Core Engineering Accomplishments</span>
            <div className="h-px bg-border flex-grow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {profProjects.map((p, idx) => (
              <motion.div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden glass-card border border-border hover:border-primary/40 transition-all cursor-pointer"
              >
                {/* Technical Abstract Pattern (No humans) */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-background transition-all group-hover:scale-105 duration-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity">
                  <Cpu size={240} weight="thin" className="text-foreground" />
                </div>

                <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent">
                  <div className="space-y-6 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <div>
                      <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-4 py-1 rounded-full text-[9px] font-bold tracking-widest">{p.category.toUpperCase()}</Badge>
                      <h4 className="text-3xl font-bold text-foreground">{p.title}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 line-clamp-none-group-hover">
                      {p.desc}
                    </p>
                    <div className="flex items-center gap-3 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore Technical Scope <ArrowUpRight weight="bold" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* FULL-PAGE IMMERSIVE STAGE - PORTAL */}
      {mounted && createPortal(
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
                <div className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-[100001] bg-background/80 backdrop-blur-3xl border-b border-border">
                  <div className="text-primary font-bold text-xl tracking-tighter">MHR.DEV <span className="text-muted-foreground ml-3">/ PROJECT STAGE</span></div>
                  <button
                    onClick={() => setSelectedProjectId(null)}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-all bg-muted group"
                  >
                    <X size={24} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                {/* Hero Section */}
                <div className="relative pt-40 pb-32 px-6 overflow-hidden">
                  <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none opacity-40 translate-x-1/2 -translate-y-1/2" />

                  <div className="container max-w-7xl mx-auto relative z-10 text-center space-y-10">
                    <Badge className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black tracking-[0.4em] h-auto border-none">
                      {selectedProject.category.toUpperCase()}
                    </Badge>
                    <h2 className="text-6xl md:text-[8vw] font-black text-foreground tracking-tighter leading-[0.8] uppercase">
                      {selectedProject.title}
                    </h2>

                    <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                      {selectedProject.tech.map(t => (
                        <span key={t} className="text-[10px] font-bold text-muted-foreground border border-border px-6 py-2 rounded-full uppercase tracking-[0.2em] bg-muted backdrop-blur-md">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
                      {selectedProject.quickFacts.map((fact, i) => (
                        <div key={i} className="p-4 border-l border-primary/20 text-left">
                          <div className="text-[9px] font-bold text-primary/40 uppercase tracking-widest mb-1">Quick Fact</div>
                          <div className="text-foreground font-medium text-sm">{fact}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Technical Content Deep-Dive */}
                <div className="container max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 lg:grid-cols-12 gap-20">
                  <div className="lg:col-span-12">
                    <div className="h-px bg-border mb-20" />
                  </div>

                  {/* Left Column: Description & Features */}
                  <div className="lg:col-span-7 space-y-24">
                    <div className="space-y-10">
                      <h4 className="text-primary text-xs font-bold uppercase tracking-[0.5em]">Project Vision & Architecture</h4>
                      <p className="text-2xl md:text-3xl text-foreground/90 font-medium leading-relaxed">
                        {selectedProject.fullDesc}
                      </p>
                    </div>

                    <div className="space-y-12">
                      <h4 className="text-primary text-xs font-bold uppercase tracking-[0.5em]">Core Capabilities</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {selectedProject.keyFeatures.map((f, i) => (
                          <div key={i} className="p-8 rounded-[2rem] bg-muted border border-border hover:border-primary/20 transition-all group">
                            <div className="text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                              {f.icon}
                              <div className="w-12 h-12 absolute scale-[2] blur-xl bg-primary/10 rounded-full opacity-50" />
                            </div>
                            <h5 className="text-xl font-bold text-foreground mb-3">{f.title}</h5>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              {f.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Roles & Personal Impact */}
                  <div className="lg:col-span-5 space-y-12">
                    <div className="sticky top-40 space-y-8">
                      <div className="glass-card p-10 bg-muted space-y-12 border-border shadow-2xl">
                        <div className="space-y-6">
                          <h4 className="text-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <Users size={18} className="text-primary" /> Professional Role
                          </h4>
                          <div className="text-primary font-black text-2xl uppercase tracking-tighter">{selectedProject.role}</div>
                        </div>

                        <div className="space-y-8">
                          <h4 className="text-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                            <CheckCircle size={18} className="text-primary" /> Key Contributions & Optimization
                          </h4>
                          <div className="space-y-4">
                            {selectedProject.contributions.map((imp, i) => (
                              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-card border border-border items-start">
                                <CheckCircle size={16} className="text-primary mt-1 shrink-0" />
                                <span className="text-sm text-muted-foreground leading-relaxed font-medium">{imp}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-8 border-t border-border flex flex-col gap-4">
                          <a href={selectedProject.live} target="_blank" rel="noreferrer" className="block">
                            <Button className="w-full h-18 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest group shadow-[0_0_40px_rgba(20,184,166,0.3)]">
                              View Live Operation <ArrowUpRight size={20} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Button>
                          </a>
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
