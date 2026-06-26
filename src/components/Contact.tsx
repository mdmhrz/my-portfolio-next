'use client';

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
import { Reveal } from "@/components/Reveal";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const type = String(data.get("type") || "");
    const message = String(data.get("message") || "");
    const subject = encodeURIComponent(`[${type || "Inquiry"}] New message from ${name || "someone"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: info */}
          <div>
            <Reveal>
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
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
                        <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          {label}
                        </div>
                        <div className="mt-1 break-words text-sm font-medium text-foreground">
                          {value}
                        </div>
                      </div>
                    </div>
                  );
                  return href ? (
                    <a key={label} href={href} target="_blank" rel="noreferrer">
                      {inner}
                    </a>
                  ) : (
                    <div key={label}>{inner}</div>
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
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
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
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    className={inputClass}
                  />
                </Field>
                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Inquiry type">
                  <select name="type" className={`${inputClass} cursor-pointer`} defaultValue="">
                    <option value="" disabled>
                      Select a type
                    </option>
                    <option>Freelance project</option>
                    <option>Full-time role</option>
                    <option>Collaboration</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Message">
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder="Tell me about your project..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-transform hover:scale-[1.01]"
              >
                Send message
                <PaperPlaneTilt className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
