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

interface PortfolioHomeProps {
  banner: any;
  experiences: any[];
  projects: any[];
  about?: any;
  settings?: any;
  skills?: any[];
}

export function PortfolioHome({ banner, experiences, projects, about, settings, skills }: PortfolioHomeProps) {
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
        <Journey about={about} />
        <Experience experiences={experiences} />
        <Tools skills={skills} />
        <CaseStudies projects={projects} />
        <CTA settings={settings} about={about} />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
