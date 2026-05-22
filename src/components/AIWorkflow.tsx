'use client';

import { motion } from "motion/react";

const modules = [
  {
    tag: "AGENTIC CODING",
    title: "Automated Logic Synthesis",
    desc: "Leveraging autonomous AI agents for boiler-plating, unit testing, and complex logic refactoring to 10x development velocity."
  },
  {
    tag: "RAG ARCHITECTURE",
    title: "Knowledge-Augmented Apps",
    desc: "Building Retrieval-Augmented Generation systems to give LLMs private context and precise data interaction capabilities."
  },
  {
    tag: "AI CLI TOOLING",
    title: "Custom Dev Automations",
    desc: "Developing internal CLI tools integrated with AI models to automate deployments, code reviews, and environment setups."
  }
];

export function AIWorkflow() {
  return (
    <section id="workflow" className="py-32 px-6 container max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as any }}
        viewport={{ once: true }}
        className="glass-card rounded-[2rem] overflow-hidden border-primary/20 bg-black/40 backdrop-blur-3xl shadow-2xl relative"
      >
        {/* Terminal Header */}
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-primary/50 shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <span className="font-mono text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] overflow-hidden whitespace-nowrap">
              AI_INTEGRATION_MODULE.V2
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-primary tracking-widest hidden sm:inline">SYSTEM STABLE</span>
          </div>
        </div>

        {/* Content Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {modules.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-12 space-y-8 group hover:bg-primary/[0.02] transition-colors"
            >
              <span className="inline-block font-mono text-[10px] font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 tracking-widest group-hover:bg-primary group-hover:text-black transition-all">
                {m.tag}
              </span>
              <h4 className="text-2xl font-display font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform">
                {m.title}
              </h4>
              <p className="text-muted-foreground font-sans leading-relaxed text-sm lg:text-base">
                {m.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Scanning Line Effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20 animate-scan" />
      </motion.div>
    </section>
  );
}
