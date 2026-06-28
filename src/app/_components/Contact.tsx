'use client';

import { useState } from "react";
import { toast } from "sonner";
import {
  EnvelopeSimple,
  WhatsappLogo,
  MapPin,
  Clock,
  PaperPlaneTilt,
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
} from "@phosphor-icons/react";
import { Reveal } from "@/components/global/Reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMAIL = "mdmobarakhossainrazu@gmail.com";

const info = [
  {
    icon: EnvelopeSimple,
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: WhatsappLogo,
    label: "WhatsApp",
    value: "+880 1824975616",
    href: "https://wa.me/8801824975616",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Dhaka, Bangladesh",
    href: undefined,
  },
  {
    icon: Clock,
    label: "Timezone",
    value: "GMT+6 (BST)",
    href: undefined,
  },
];

const socials = [
  { Icon: GithubLogo, href: "https://github.com/mdmhrz", label: "GitHub" },
  { Icon: LinkedinLogo, href: "https://www.linkedin.com/in/mdmhrz", label: "LinkedIn" },
  { Icon: FacebookLogo, href: "https://www.facebook.com/mdmhrz", label: "Facebook" },
];

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !type || !message.trim()) {
      toast.error("Please fill out all fields before sending.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, type, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      toast.success("Message sent! I will reach out to you soon.");

      // Clear form states
      setName("");
      setEmail("");
      setSubject("");
      setType("");
      setMessage("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <section id="contact" className="relative overflow-hidden border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: info */}
          <div>
            <Reveal>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Contact
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 text-4xl font-medium leading-[0.95] tracking-tight text-foreground md:text-6xl">
                Let&apos;s talk about your next project.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md leading-relaxed text-muted-foreground">
                Freelance work, full-time roles, or just a hello — my inbox is always open.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {info.map(({ icon: Icon, label, value, href }) => {
                  const inner = (
                    <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-foreground/20">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground">
                          {label}
                        </div>
                        <div className="mt-1 break-words text-sm font-medium text-foreground">
                          {value}
                        </div>
                      </div>
                    </div>
                  );
                  return href ? (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="block h-full">
                      {inner}
                    </a>
                  ) : (
                    <div key={label} className="h-full">{inner}</div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-6 flex items-center gap-3">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-indigo-600/5 dark:hover:bg-indigo-400/5 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-600/40 dark:hover:border-indigo-400/40"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: form */}
          <Reveal y={40} delay={0.1}>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-7 shadow-sm md:p-9"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Your name">
                  <Input
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-600/10 dark:focus-visible:ring-indigo-400/10"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-600/10 dark:focus-visible:ring-indigo-400/10"
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Subject">
                  <Input
                    name="subject"
                    type="text"
                    placeholder="What's this about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-12 w-full rounded-xl border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-600/10 dark:focus-visible:ring-indigo-400/10"
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Inquiry type">
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-12 w-full rounded-xl border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 text-sm text-foreground focus-visible:border-indigo-600 dark:focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-600/10 dark:focus-visible:ring-indigo-400/10">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-neutral-200 dark:border-zinc-700 text-foreground">
                      <SelectItem value="Freelance project">Freelance project</SelectItem>
                      <SelectItem value="Full-time role">Full-time role</SelectItem>
                      <SelectItem value="Collaboration">Collaboration</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Message">
                  <Textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="Tell me about your project..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] w-full rounded-xl border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-indigo-600 dark:focus-visible:border-indigo-400 focus-visible:ring-1 focus-visible:ring-indigo-600/10 dark:focus-visible:ring-indigo-400/10 resize-none"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-medium transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send message"}
                {!isSubmitting && <PaperPlaneTilt className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block space-y-2">
      <span className="ml-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        {label}
      </span>
      {children}
    </div>
  );
}
