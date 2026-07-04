'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  src?: string | null;
  alt?: string | null;
  srcDark?: string | null;
  altDark?: string | null;
}

export function Logo({ className, src, alt, srcDark, altDark }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid a flash of the wrong variant: until the theme is known client-side,
  // prefer whichever custom logo is set (or the light one), never guess dark.
  const isDark = mounted && resolvedTheme === "dark";
  const activeSrc = isDark && srcDark ? srcDark : src;
  const activeAlt = isDark && srcDark ? altDark : alt;

  if (activeSrc) {
    return (
      <Image
        src={activeSrc}
        alt={activeAlt || "Site logo"}
        width={112}
        height={28}
        className={cn("h-7 w-auto object-contain", className)}
        unoptimized
      />
    );
  }

  return (
    <svg
      viewBox="0 0 205 165.4"
      role="img"
      aria-label="MHR logo"
      className={cn("h-7 w-auto text-foreground", className)}
    >
      <g>
        <path
          fill="currentColor"
          d="M82.4,125l-11.9,11.9c-2.3,2.3-5.9,2.3-8.2,0l0,0l-16-16l-4.1-4.1l-16-16l-4.1-4.1L10.2,84.8
            c-2.3-2.3-2.3-5.9,0-8.2l11.9-11.9l4.1-4.1l16-16l4.1-4.1l11.9-11.9c2.3-2.3,5.9-2.3,8.2,0l11.9,11.9l-16,16l-4.1,4.1l-16,16
            l-4.1,4.1l4.1,4.1l16,16l4.1,4.1l16,16L82.4,125z"
        />
        <path
          fill="currentColor"
          d="M98.4,60.6L86.5,72.5c-2.3,2.3-5.9,2.3-8.2,0L66.4,60.6l11.9-11.9c2.3-2.3,5.9-2.3,8.2,0
            L98.4,60.6z"
        />
        <path
          fill="currentColor"
          d="M194.8,76.6c2.3,2.3,2.3,5.9,0,8.2l-11.9,11.9l-4.1,4.1l-32,32c-2.3,2.3-5.9,2.3-8.2,0
            l-11.9-11.9l20.1-20.1l16-16l4.1-4.1l-4.1-4.1l-16-16l-4.1-4.1l-4.1,4.1l-16,16l-4.1,4.1l-11.9,11.9c-2.3,2.3-5.9,2.3-8.2,0
            L86.5,80.7l16-16l4.1-4.1l16-16l4.1-4.1l11.9-11.9c2.3-2.3,5.9-2.3,8.2,0l11.9,11.9l4.1,4.1l16,16l4.1,4.1L194.8,76.6z"
        />
        <rect
          x="125.5"
          y="75.2"
          transform="matrix(0.7071 -0.7071 0.7071 0.7071 -21.1265 122.102)"
          fill="currentColor"
          width="22.6"
          height="22.6"
        />
      </g>
    </svg>
  );
}
