'use client';

import { useEffect, useState } from "react";
import { IntroLoader } from "@/components/IntroLoader";
import { Navbar } from "@/components/shared/Navbar";
import { Hero } from "@/components/hero/Hero";
import { TechMarquee } from "@/components/home/TechMarquee";
import { Journey } from "@/components/home/Journey";
import { Experience } from "@/components/home/Experience";
import { Tools } from "@/components/home/Tools";
import { CaseStudies } from "@/components/home/CaseStudies";
import { CTA } from "@/components/home/CTA";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/shared/Footer";
import { MouseFollower } from "@/components/MouseFollower";

interface PortfolioHomeProps {
  banner: any;
  experiences: any[];
  projects: any[];
}

export function PortfolioHome({ banner, experiences, projects }: PortfolioHomeProps) {
  const [introDone, setIntroDone] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="relative min-h-screen selection:bg-primary selection:text-black bg-background">
      <IntroLoader onDone={() => setIntroDone(true)} />
      <Navbar />

      <main className="relative z-10 w-full">
        <MouseFollower />
        <Hero start={introDone} reduced={reduced} banner={banner} />
        <TechMarquee />
        <Journey />
        <Experience experiences={experiences} />
        <Tools />
        <CaseStudies projects={projects} />
        <CTA />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
