'use client';

import { useEffect, useState } from "react";
import { IntroLoader } from "@/components/IntroLoader";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/hero/Hero";
import { TechMarquee } from "@/components/TechMarquee";
import { Journey } from "@/components/Journey";
import { Experience } from "@/components/Experience";
import { Tools } from "@/components/Tools";
import { ArchitectureShowcase } from "@/components/ArchitectureShowcase";
import { CaseStudies } from "@/components/CaseStudies";
import { CTA } from "@/components/CTA";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { MouseFollower } from "@/components/MouseFollower";

export default function Home() {
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
        <Hero start={introDone} reduced={reduced} />
        <TechMarquee />
        <Journey />
        <Experience />
        <Tools />
        {/* <ArchitectureShowcase /> */}
        <CaseStudies />
        <CTA />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
