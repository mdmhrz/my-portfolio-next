'use client';

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Journey } from "@/components/Journey";
import { Experience } from "@/components/Experience";
import { AIWorkflow } from "@/components/AIWorkflow";
import { CaseStudies } from "@/components/CaseStudies";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { MouseFollower } from "@/components/MouseFollower";

export default function Home() {
  return (
    <div className="relative min-h-screen selection:bg-primary selection:text-black bg-background">
      <Navbar />

      <main className="relative z-10 w-full">
        <Hero />
        <Journey />
        <Experience />
        <AIWorkflow />
        <CaseStudies />
        <Contact />
        <Footer />
      </main>
    </div>
  );
}
