'use client';

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
// import { Mail, Linkedin, FileText, ArrowRight } from "lucide-react";

export function CTA() {
  const currentYear = new Date().getFullYear();

  return (
    <section id="contact" className="relative py-32 overflow-hidden bg-background">
      {/* High Contrast CTA */}
      <div className="bg-primary py-32 px-6 relative z-10 overflow-hidden rounded-[3rem] mx-6">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/5 rounded-full border border-black/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/5 rounded-full border border-black/10 blur-2xl pointer-events-none translate-y-1/2 -translate-x-1/4" />

        <div className="container max-w-4xl mx-auto text-center relative z-20">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-bold text-black mb-10 tracking-tighter"
          >
            Ready to Build<br />the Future?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto mb-16"
          >
            I am currently accepting new projects and engineering roles. Let's discuss how we can build something extraordinary together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button className="h-20 px-12 rounded-2xl bg-black text-white hover:bg-black/90 hover:scale-105 active:scale-95 transition-all text-xl font-bold group">
              Get in Touch <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
