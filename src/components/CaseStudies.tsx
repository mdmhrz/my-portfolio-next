'use client';

import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "HallPoint",
    desc: "Revolutionizing the way student halls and communities manage resources and event engagement.",
    tags: ["Community Tech", "Next.js"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuANII3nE3Efhi2sbvU0K49bkSG9Zo9gj0YCAqU-aABp_gMpd1pETktHdbMmTxWzjTZddBWdXxkvhTWa3-4_pWXXxwjaPuvEFrSPfUPTnEWbVein-fedB8IKyTSTVnYIuC5GhiEzwzRZdyl_fxU50-rPxPw3CBYoIqJ68MnSr-4UwIbQyd5FDbAlbsN07i0K2eo8K4EasqMaCQk5JzgxzZSmHw8DkMKw7A-8wq9vBjjhiKAq7n_v39KmgrZNj6BAKQy1Oa3mpdQlgAY",
    span: "md:col-span-8",
    height: "h-[500px]"
  },
  {
    title: "AltPick",
    desc: "Intelligent alternative product discovery engine.",
    tags: ["Curation"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzNYrVbHL7y7OLjOJoXwuC_mLJ9u31N8h94a88bzfxLFDLYS7W0LM5K9e0zqMs2R7K2RPsrYELzdjC5hcYgeCmzYdrwVyJHr-1zPuYXAo618k2JQV5F5PMQ9RlBn4fq70JjmdrQIQ9cOo2XI5AvzLG8-TdlPrGl7hjUS5VMykoe4DLlgv8xhxgelL03M62_G-AHe8f-6_5tTMA4vLxQcwXnosIoGn2rmdthOdBpJXwHTT9LuyCmyYGHNX_sYhx2c6r8BE3lBP61RI",
    span: "md:col-span-4",
    height: "h-[500px]"
  },
  {
    title: "JobTrack",
    desc: "Personal CRM for managing modern career growth.",
    tags: ["Productivity"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuNhdjIkrnh5CmK7eLZbuC_-rNZfwnRBdnRaKB_vZbll-8MTuHSuHDf80QQzPFyEoY0YAZuYJI2_xaPh6cMomnbKwNuZShQx9OonEMVxtle_MqPHTUmwiC1Nl3snsmW-dQhCYqV6qws5nz8f3qTKlxeP6G75UqeJ6w6fgJLfLMDO6VwD-rwj6_h1kvDxulsjd4fAiLJ1CmD2e655N4BGMtXZM2O2hQbDt4zSrPTz4w9hOIsIGHaDXsNBDdSaGSihX9hHpWA2W1U-Q",
    span: "md:col-span-4",
    height: "h-[450px]"
  },
  {
    title: "NexDrop",
    desc: "Peer-to-peer lightning-fast encrypted file sharing infrastructure.",
    tags: ["Fintech", "Security"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG61PoDpWZUBtOcQSASuKTblEWem6VW9by6h260Nnrv_NcB0xBMUPbS9NlIqVZ7RGS0brgZG1TZlrPodbJQDBAi3QRAFbzPFNcsNk7m8JNuAoRMAATUJH10Or2BGHwXrcBBe57HVwO6V8UVOTeyvqV_qL6vE85BqyxXRK6xhXkGANUrZO2u8-QHwtJ5f0dtIEGIwm-Enhzj9GWd_KkcdsAlF5kfwbM8Ij2KtDI6sAAY2uFAXHO40ryWgsxhmShsBv-eewT-LVCYUg",
    span: "md:col-span-8",
    height: "h-[450px]"
  }
];

export function CaseStudies() {
  return (
    <section id="projects" className="py-32 px-6 container max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="mb-20"
      >
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tighter">Featured Case Studies</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {projects.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            viewport={{ once: true }}
            className={`${p.span} ${p.height} relative group rounded-[2.5rem] overflow-hidden glass-card border-white/5 cursor-pointer`}
          >
            {/* Background Image with Parallax-ish Effect */}
            <div 
              className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110"
              style={{
                backgroundImage: `url('${p.img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-500" />
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-10 lg:p-14 flex flex-col justify-end h-full">
              <div className="flex gap-3 mb-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                {p.tags.map(tag => (
                  <Badge key={tag} className="bg-primary text-black font-bold border-none px-4">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300">
                {p.title}
              </h3>
              <p className="text-muted-foreground font-sans text-sm md:text-lg max-w-xl line-clamp-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                {p.desc}
              </p>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-8 right-8 w-12 h-12 rounded-full glass border-white/10 flex items-center justify-center translate-x-12 translate-y-[-12px] group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 bg-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
