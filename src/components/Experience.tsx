'use client';

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BarChart3, Network, ArrowUpRight } from "lucide-react";

const experiences = [
  {
    title: "Taskip",
    icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
    status: "Live",
    description: "Advanced task management system with real-time collaboration and kanban boards.",
    points: ["Optimizing client-side rendering", "Implementation of Drag & Drop"]
  },
  {
    title: "ReportGenix",
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
    status: "Product",
    description: "Automated reporting tool for generating complex business insights and data visualizations.",
    points: ["Dynamic PDF generation engine", "Complex chart integrations"]
  },
  {
    title: "Xilacer",
    icon: <Network className="w-8 h-8 text-primary" />,
    status: "Scale",
    description: "Enterprise marketplace platform connecting specialized talent with high-end projects.",
    points: ["Secure payment gateway architecture", "Multitenant user dashboard"]
  }
];

export function Experience() {
  return (
    <section id="experience" className="py-32 bg-muted/20 border-y border-white/5 relative">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter">Professional Tenure</h2>
            <p className="text-lg text-muted-foreground max-w-xl">Deep integration within engineering teams to build high-performance products used by thousands.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="glass-card px-8 py-6 border-primary/20 backdrop-blur-3xl bg-primary/5 text-right relative group"
          >
            <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="block font-display text-2xl md:text-4xl text-primary font-bold tracking-tight relative">XGENIOUS</span>
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest relative">Frontend Developer | 2025 – Present</span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-10 bg-white/[0.01] hover:bg-white/[0.03] transition-all group flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all">
                  {exp.icon}
                </div>
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-4 font-mono font-bold tracking-widest">
                  {exp.status}
                </Badge>
              </div>

              <h4 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-primary transition-colors flex items-center gap-2">
                {exp.title} <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-muted-foreground hover:text-primary" />
              </h4>
              <p className="text-muted-foreground font-sans leading-relaxed mb-10 flex-grow">
                {exp.description}
              </p>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {exp.points.map((point, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    <span className="text-sm font-sans text-muted-foreground/80">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
