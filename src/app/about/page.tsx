import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";
import { Navbar } from "@/components/global/Navbar";
import { Footer } from "@/components/global/Footer";
import { Reveal } from "@/components/global/Reveal";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  FileText,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  FacebookLogo,
  CheckCircle,
  ArrowLeft,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";

export const revalidate = 3600; // Cache and revalidate page every hour

// Dynamic SEO metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });
  const siteTitle = profile?.bio ? `About — ${profile.bio.slice(0, 50)}...` : "About Mobarak Hossain | Full-Stack Developer";
  const siteDesc = profile?.longBio ? profile.longBio.slice(0, 160) : "Learn more about Mobarak Hossain Razu, full-stack software developer, technical background, and experience.";

  return {
    title: siteTitle,
    description: siteDesc,
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
    },
  };
}

export default async function AboutPage() {
  const [profile, settings, skills] = await Promise.all([
    prisma.profile.findUnique({ where: { id: "singleton" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.skill.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);

  // Fallback defaults if DB is empty
  const defaultProfile = {
    name: "Mobarak Hossain Razu",
    designation: "Full-Stack Developer",
    bio: "Full-Stack Developer building modern web applications.",
    longBio: "I am a software engineer focused on designing and engineering high-performance SaaS platforms, clean user interfaces, and robust backend systems.",
    avatarUrl: "/images/placeholder-avatar.jpg",
    avatarAlt: "Mobarak Hossain Razu",
    location: "Dhaka, Bangladesh",
    availability: "Available for new opportunities",
    resumeUrl: "#",
  };

  const name = profile?.name || defaultProfile.name;
  const designation = profile?.designation || defaultProfile.designation;
  const bio = profile?.bio || defaultProfile.bio;
  const longBio = profile?.longBio || defaultProfile.longBio;
  const avatarUrl = profile?.avatarUrl || defaultProfile.avatarUrl;
  const avatarAlt = profile?.avatarAlt || defaultProfile.avatarAlt;
  const location = profile?.location || defaultProfile.location;
  const availability = profile?.availability || defaultProfile.availability;
  const resumeUrl = profile?.resumeUrl || defaultProfile.resumeUrl;

  const email = profile?.email || "mdmobarakhossainrazu@gmail.com";
  const github = profile?.github || "https://github.com/mdmhrz";
  const linkedin = profile?.linkedin || "https://www.linkedin.com/in/mdmhrz";
  const facebook = profile?.facebook || "https://www.facebook.com/mdmhrz";

  // Categorize skills
  const skillsByCategory = (skills || []).reduce((acc: Record<string, typeof skills>, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categoriesOrder = ["frontend", "backend", "devops", "tools", "other"];

  // Person Structured Data Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "jobTitle": designation,
    "url": "https://mhrazu.com/about",
    "image": avatarUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location,
    },
    "description": bio,
    "sameAs": [github, linkedin, facebook],
  };

  return (
    <AppearanceColorScope scope="public">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <Navbar />

        {/* Decorative background gradients */}
        <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute top-[600px] right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />

        <main className="container mx-auto max-w-5xl px-6 py-28 md:py-40">
          
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
            
            {/* Left Col: Avatar and Card Info */}
            <div className="lg:col-span-4 space-y-6">
              <Reveal delay={0.05} className="relative group mx-auto max-w-[280px] lg:max-w-none">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-2 aspect-square shadow-xl transition-all duration-500 hover:border-primary/30 hover:shadow-2xl">
                  
                  {/* Subtle pulsing background glow behind image */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-indigo-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={avatarAlt || "Mobarak Hossain Razu"}
                      fill
                      priority
                      className="object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700 ease-out scale-[1.01] hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center text-muted-foreground font-sans text-sm">
                      No Image Uploaded
                    </div>
                  )}
                </div>

                {/* Availability status badge hanging on the image */}
                {availability && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 shadow-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.1em] text-foreground">
                      {availability}
                    </span>
                  </div>
                )}
              </Reveal>

              {/* Quick Info Grid */}
              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm mt-6">
                  {location && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-5 w-5 text-foreground shrink-0" />
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Briefcase className="h-5 w-5 text-foreground shrink-0" />
                    <span>UTC+6 (Dhaka, BD)</span>
                  </div>

                  {resumeUrl && resumeUrl !== "#" && (
                    <div className="pt-2 border-t border-border/50">
                      <Button asChild className="w-full rounded-xl gap-2 font-semibold text-xs tracking-tight shadow-sm hover:shadow-md transition-all duration-300">
                        <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                          <FileText weight="bold" className="h-4 w-4" />
                          Download Resume
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Social Channels */}
              <Reveal delay={0.15}>
                <div className="flex items-center justify-center lg:justify-start gap-3 mt-4">
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="GitHub"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <GithubLogo className="h-5 w-5" />
                    </a>
                  )}
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <LinkedinLogo className="h-5 w-5" />
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <FacebookLogo className="h-5 w-5" />
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      aria-label="Email"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <EnvelopeSimple className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Right Col: About Story and Skills */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Header */}
              <div>
                <Reveal delay={0.05}>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-sans">
                    Professional Profile
                  </span>
                </Reveal>
                <Reveal delay={0.1}>
                  <h1 className="mt-4 text-4xl font-medium leading-[0.95] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                    {name}
                  </h1>
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="mt-6 text-lg md:text-xl font-medium leading-relaxed text-foreground">
                    {bio}
                  </p>
                </Reveal>
              </div>

              {/* Detailed Background narrative */}
              {longBio && (
                <div className="border-t border-border/50 pt-8">
                  <Reveal delay={0.2}>
                    <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-primary font-semibold mb-6">
                      My Story &amp; Approach
                    </h2>
                  </Reveal>
                  <Reveal delay={0.25}>
                    <div className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-muted-foreground space-y-6 whitespace-pre-line">
                      {longBio}
                    </div>
                  </Reveal>
                </div>
              )}

              {/* Skills section */}
              {skills && skills.length > 0 && (
                <div className="border-t border-border/50 pt-8">
                  <Reveal delay={0.25}>
                    <h2 className="text-xs font-sans uppercase tracking-[0.3em] text-primary font-semibold mb-8">
                      Tools &amp; Stack Expertise
                    </h2>
                  </Reveal>
                  
                  <div className="space-y-6">
                    {categoriesOrder.map((cat, idx) => {
                      const categorySkills = skillsByCategory[cat];
                      if (!categorySkills || categorySkills.length === 0) return null;
                      return (
                        <Reveal key={cat} delay={0.3 + idx * 0.05} className="space-y-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            {cat === "frontend" ? "Frontend & Styling" : 
                             cat === "backend" ? "Backend & Database" : 
                             cat === "devops" ? "Cloud & Infrastructure" : 
                             cat === "tools" ? "Developer Tools" : "Additional Stack"}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {categorySkills.map((skill) => (
                              <div
                                key={skill.id}
                                className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:border-primary/25 hover:text-foreground transition-all duration-200"
                              >
                                {skill.name}
                              </div>
                            ))}
                          </div>
                        </Reveal>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ready to connect footer box */}
              <Reveal delay={0.4}>
                <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Have an exciting idea?</h3>
                      <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                        Let&apos;s collaborate to design and develop your next SaaS product, dashboard interface, or web application.
                      </p>
                    </div>
                    <Button asChild className="rounded-full shadow-sm font-semibold text-xs tracking-tight shrink-0">
                      <Link href="/contact">
                        Get in touch
                        <ArrowUpRight weight="bold" className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>
        </main>

        <Footer profile={profile} footerText={settings?.footerText} />
      </div>
    </AppearanceColorScope>
  );
}
