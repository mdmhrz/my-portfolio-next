'use client';

import { useEffect, useState, Fragment, type ReactNode } from "react";
import { IntroLoader } from "@/components/global/IntroLoader";
import { Navbar } from "@/components/global/Navbar";
import { Hero } from "./Hero";
import { TechMarquee } from "./TechMarquee";
import { Journey } from "./Journey";
import { Experience } from "./Experience";
import { Tools } from "./Tools";
import { CaseStudies } from "./CaseStudies";
import { CTA } from "./CTA";
import { Contact } from "./Contact";
import { Footer } from "@/components/global/Footer";
import { MouseFollower } from "@/components/global/MouseFollower";
import { HomepageBlogs } from "./HomepageBlogs";
import { HomepageTestimonials } from "./HomepageTestimonials";
import type { BlogListItem } from "@/components/blog";
import type { TestimonialItem } from "@/components/testimonial";

interface SectionConfigItem {
  key: string;
  visible: boolean;
  order: number;
}

interface PortfolioHomeProps {
  banner: any;
  experiences: any[];
  projects: any[];
  profile?: any;
  settings?: any;
  skills?: any[];
  homepageBlogs?: BlogListItem[];
  testimonials?: TestimonialItem[];
  cta?: any;
  footer?: any;
  navLinks?: any[];
  sections?: SectionConfigItem[];
}

export function PortfolioHome({
  banner,
  experiences,
  projects,
  profile,
  settings,
  skills,
  homepageBlogs,
  testimonials,
  cta,
  footer,
  navLinks,
  sections,
}: PortfolioHomeProps) {
  const [introDone, setIntroDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Every homepage content section lives here, keyed by SectionConfig.key. Hero and
  // Footer are permanent chrome (not hideable/reorderable) and stay outside this map —
  // adding a new hideable section requires both a registry entry here and a matching
  // SectionConfig row (seeded via a migration).
  const SECTION_REGISTRY: Record<string, () => ReactNode> = {
    techMarquee: () => <TechMarquee />,
    journey: () => <Journey profile={profile} />,
    experience: () => <Experience experiences={experiences} />,
    tools: () => <Tools skills={skills} />,
    caseStudies: () => <CaseStudies projects={projects} />,
    homepageBlogs: () => <HomepageBlogs posts={homepageBlogs ?? []} settings={settings} />,
    testimonials: () => <HomepageTestimonials testimonials={testimonials ?? []} settings={settings} />,
    cta: () => <CTA cta={cta} profile={profile} />,
    contact: () => <Contact profile={profile} />,
  };

  const orderedSections = (sections ?? [])
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="relative min-h-screen selection:bg-primary selection:text-primary-foreground bg-background">
      <IntroLoader onDone={() => setIntroDone(true)} />
      <Navbar navLinks={navLinks} logoUrl={settings?.logoUrl} logoAlt={settings?.logoAlt} logoUrlDark={settings?.logoUrlDark} logoAltDark={settings?.logoAltDark} />

      <main className="relative z-10 w-full">
        <MouseFollower />
        <Hero start={introDone} reduced={reduced} banner={banner} profile={profile} />
        {orderedSections.map((section) => (
          <Fragment key={section.key}>{SECTION_REGISTRY[section.key]?.()}</Fragment>
        ))}
        <Footer profile={profile} footer={footer} navLinks={navLinks} logoUrl={settings?.logoUrl} logoAlt={settings?.logoAlt} logoUrlDark={settings?.logoUrlDark} logoAltDark={settings?.logoAltDark} />
      </main>
    </div>
  );
}
