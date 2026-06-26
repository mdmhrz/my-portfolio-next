'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text1Ref = useRef<HTMLHeadingElement>(null);
  const text2Ref = useRef<HTMLHeadingElement>(null);
  const text3Ref = useRef<HTMLHeadingElement>(null); // no longer used, kept for clean diff
  const subRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance Animation
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.fromTo(overlayRef.current, 
      { scaleY: 1 },
      { scaleY: 0, transformOrigin: "top", duration: 1.5, ease: "power4.inOut" }
    )
    .fromTo([text1Ref.current, text2Ref.current],
      { y: 100, opacity: 0, rotateX: -20 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.1 },
      "-=0.8"
    )
    .fromTo(subRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.8"
    )
    .fromTo(btnRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      "-=0.8"
    );

    // Scroll Parallax
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      y: 200,
      opacity: 0.2,
    });

    // Fluid Mouse Follower Logic
    const handleMouseMove = (e: MouseEvent) => {
      if (!cursorFollowerRef.current) return;
      
      const { clientX, clientY } = e;
      
      // We use GSAP quickTo for highly performant mouse tracking
      gsap.to(cursorFollowerRef.current, {
        x: clientX - 300, // offset by half width
        y: clientY - 300, // offset by half height
        duration: 2,
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);

  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-center overflow-hidden bg-background pt-20"
    >
      {/* Black Entrance Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 z-50 bg-foreground pointer-events-none"
      />

      {/* Interactive Mouse Fluid Follower */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-background">
        
        {/* Following Gradient Blur */}
        <div 
          ref={cursorFollowerRef}
          className="absolute w-[600px] h-[600px] bg-foreground/15 rounded-full blur-[100px] mix-blend-screen"
          style={{ transform: "translate(-50%, -50%)" }}
        />
        
        {/* Fixed Ambient Glow for that "smoke/water" base */}
        <div className="absolute top-1/2 left-1/4 w-[1000px] h-[400px] bg-foreground/10 rounded-full blur-[140px] -rotate-45 mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-[800px] h-[500px] bg-foreground/10 rounded-full blur-[140px] rotate-12 mix-blend-screen" />
      </div>

      <div className="container relative z-10 mx-auto px-6 flex flex-col items-center text-center">
        
        <div className="mb-6 flex items-center justify-center">
          <div className="px-5 py-2 rounded-full border border-border bg-card flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
             <span className="text-[11px] font-medium tracking-wide text-muted-foreground">Crafting High-Performance Web Apps</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-0 mb-8 perspective-[1000px]">
          <h1 
            ref={text1Ref} 
            className="text-[12vw] md:text-[6rem] lg:text-[7rem] leading-none font-medium tracking-tight text-foreground"
          >
            Engineering that you
          </h1>
          <h1 
            ref={text2Ref} 
            className="text-[12vw] md:text-[6rem] lg:text-[7rem] leading-none font-medium tracking-tight text-foreground"
          >
            need Indeed
          </h1>
        </div>

        <p 
          ref={subRef}
          className="max-w-2xl text-base md:text-lg text-muted-foreground font-normal leading-relaxed mb-12"
        >
          Elevate your product with custom web architecture and high-performance engineering. Showcase your story through robust code and strategic technical solutions.
        </p>

        <div ref={btnRef} className="flex items-center gap-4">
          <button className="h-12 px-8 rounded-full border border-border bg-background text-foreground font-medium text-sm hover:bg-muted transition-colors duration-300">
            Get Started Now
          </button>
          
          <button className="h-12 px-8 rounded-full border border-border bg-background text-foreground font-medium text-sm hover:bg-muted transition-colors duration-300">
            See Projects
          </button>
        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-70 w-full max-w-2xl px-6">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Scroll down</span>
        <div className="h-px bg-border flex-grow" />
        <div className="w-5 h-8 border border-muted-foreground rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
        <div className="h-px bg-border flex-grow" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">to see projects</span>
      </div>

    </section>
  );
}