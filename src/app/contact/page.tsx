import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";
import { Navbar } from "@/components/global/Navbar";
import { Footer } from "@/components/global/Footer";
import { Reveal } from "@/components/global/Reveal";
import { ContactForm } from "./_components/ContactForm";
import {
  EnvelopeSimple,
  WhatsappLogo,
  MapPin,
  Clock,
  ArrowLeft,
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
} from "@phosphor-icons/react/dist/ssr";

export const revalidate = 3600; // Cache and revalidate page every hour

// Dynamic SEO metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const about = await prisma.about.findUnique({ where: { id: "singleton" } });
  const siteTitle = "Contact Mobarak Hossain Razu | Full-Stack Software Developer";
  const siteDesc = about?.bio ? `Get in touch with Mobarak Hossain: ${about.bio}` : "Contact Mobarak Hossain Razu for freelance projects, full-time opportunities, or tech collaboration.";

  return {
    title: siteTitle,
    description: siteDesc,
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
    },
  };
}

export default async function ContactPage() {
  const [banner, about] = await Promise.all([
    prisma.banner.findFirst(),
    prisma.about.findUnique({ where: { id: "singleton" } }),
  ]);

  const email = banner?.email || "mdmobarakhossainrazu@gmail.com";
  const github = banner?.github || "https://github.com/mdmhrz";
  const linkedin = banner?.linkedin || "https://www.linkedin.com/in/mdmhrz";
  const facebook = banner?.facebook || "https://www.facebook.com/mdmhrz";
  const whatsapp = banner?.whatsapp || "+880 1824975616";
  const location = about?.location || "Dhaka, Bangladesh";
  const availability = about?.availability || "Open to work";

  const contactOptions = [
    {
      icon: EnvelopeSimple,
      label: "Email",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: WhatsappLogo,
      label: "WhatsApp",
      value: whatsapp.startsWith("http") ? "Send a message" : whatsapp,
      href: whatsapp.startsWith("http") ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Location",
      value: location,
      href: undefined,
    },
    {
      icon: Clock,
      label: "Timezone",
      value: "GMT+6 (BST)",
      href: undefined,
    },
  ];

  const socialLinks = [
    { Icon: GithubLogo, href: github, label: "GitHub" },
    { Icon: LinkedinLogo, href: linkedin, label: "LinkedIn" },
    { Icon: FacebookLogo, href: facebook, label: "Facebook" },
  ];

  // ContactPage Structured Data Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Mobarak Hossain Razu",
    "description": "Send a message to Mobarak Hossain Razu for full-stack, Next.js, Go, or database development collaboration.",
    "url": "https://mhrazu.com/contact",
    "mainEntity": {
      "@type": "Person",
      "name": "Mobarak Hossain Razu",
      "email": email,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location,
      },
    },
  };

  return (
    <AppearanceColorScope scope="public">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar />

        {/* Dynamic ambient backgrounds */}
        <div className="pointer-events-none absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute top-[500px] left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

        <main className="container mx-auto max-w-6xl px-6 py-28 md:py-40">
          
          {/* Back button */}
          <div className="mb-10">
            <Reveal delay={0.02}>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft weight="bold" className="h-4 w-4" />
                Back to Home
              </Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            
            {/* Left Column: Headings & Direct Contact Channels */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <Reveal delay={0.05}>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-mono">
                    Let&apos;s Connect
                  </span>
                </Reveal>
                <Reveal delay={0.1}>
                  <h1 className="mt-4 text-4xl font-medium leading-[0.95] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    Let&apos;s talk about your next project.
                  </h1>
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="mt-6 leading-relaxed text-muted-foreground">
                    Freelance work, remote engineering roles, or consulting inquiries — my inbox is always open. Fill out the form, or reach out directly on any channel.
                  </p>
                </Reveal>
              </div>

              {/* Contact options cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactOptions.map(({ icon: Icon, label, value, href }, idx) => {
                  const cardContent = (
                    <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:bg-primary/[0.02]">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
                      <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          {label}
                        </div>
                        <div className="mt-1.5 break-all text-sm font-medium text-foreground">
                          {value}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <Reveal key={label} delay={0.2 + idx * 0.05} className="h-full">
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer" className="block h-full">
                          {cardContent}
                        </a>
                      ) : (
                        <div className="h-full">{cardContent}</div>
                      )}
                    </Reveal>
                  );
                })}
              </div>

              {/* Social links row */}
              <div className="space-y-4 pt-4">
                <Reveal delay={0.35}>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    Find Me Online
                  </span>
                </Reveal>
                <Reveal delay={0.4} className="flex items-center gap-3">
                  {socialLinks.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </Reveal>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <Reveal delay={0.25} y={30}>
                <ContactForm />
              </Reveal>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </AppearanceColorScope>
  );
}
