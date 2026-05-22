'use client';

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Envelope, MapPin, Globe, PaperPlaneTilt, GithubLogo, LinkedinLogo, TwitterLogo } from "@phosphor-icons/react";

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
  return (
    <section id="contact" className="py-40 px-6 relative overflow-hidden bg-[#030303] border-t border-white/5">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Column: Info */}
          <div className="space-y-12">
            <div className="space-y-6">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary text-xs font-bold uppercase tracking-[0.4em]"
              >
                Inquiries
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-bold text-white tracking-tighter"
              >
                Let&apos;s talk about <br /> your <span className="text-primary">next project.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-muted-foreground text-lg max-w-md leading-relaxed"
              >
                Whether you have a specific project in mind or just want to say hi, my inbox is always open.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {contactInfo.map((info, idx) => (
                <motion.a 
                  key={idx}
                  href={info.href}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group"
                >
                  <div className="mb-4">{info.icon}</div>
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{info.label}</div>
                  <div className="text-white font-medium group-hover:text-primary transition-colors">{info.value}</div>
                </motion.a>
              ))}
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-end"
              >
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Follow Me</div>
                <div className="flex gap-4">
                  {socials.map((social, idx) => (
                    <a 
                      key={idx} 
                      href={social.href}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 bg-white/[0.02] backdrop-blur-3xl shadow-2xl z-10"
          >
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Inquiry Type</label>
                <select className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans cursor-pointer appearance-none">
                  <option className="bg-black">SaaS Development</option>
                  <option className="bg-black">UX/UI Engineering</option>
                  <option className="bg-black">System Architecture</option>
                  <option className="bg-black">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Message</label>
                <textarea 
                  rows={4}
                  placeholder="Tell me about your project..."
                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-4 py-4 text-white placeholder:text-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-sans resize-none"
                />
              </div>

              <Button className="w-full h-16 rounded-xl bg-primary text-primary-foreground font-bold text-base uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(20,184,166,0.2)] group">
                Send Message <PaperPlaneTilt size={20} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
