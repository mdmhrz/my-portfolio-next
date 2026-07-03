'use client';

import { useEffect, useState } from "react";
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
import type { BlogListItem } from "@/components/blog";

interface PortfolioHomeProps {
  banner: any;
  experiences: any[];
  projects: any[];
  profile?: any;
  settings?: any;
  skills?: any[];
  homepageBlogs?: BlogListItem[];
}

export function PortfolioHome({ banner, experiences, projects, profile, settings, skills, homepageBlogs }: PortfolioHomeProps) {
  const [introDone, setIntroDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-primary selection:text-primary-foreground bg-background">
      <IntroLoader onDone={() => setIntroDone(true)} />
      <Navbar />

      <main className="relative z-10 w-full">
        <MouseFollower />
        <Hero start={introDone} reduced={reduced} banner={banner} profile={profile} />
        <TechMarquee />
        <Journey profile={profile} />
        <Experience experiences={experiences} />
        <Tools skills={skills} />
        <CaseStudies projects={projects} />
        <HomepageBlogs posts={homepageBlogs ?? []} settings={settings} />
        <CTA settings={settings} profile={profile} />
        <Contact profile={profile} />
        <Footer profile={profile} footerText={settings?.footerText} />
      </main>
    </div>
  );
}
