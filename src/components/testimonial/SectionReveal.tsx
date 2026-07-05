'use client';

import type { ComponentProps } from "react";
import { Reveal } from "@/components/global/Reveal";

type SectionRevealProps = ComponentProps<typeof Reveal> & { preview?: boolean };

// Wraps the shared scroll-Reveal, but in `preview` mode (admin template picker,
// where the section is scaled + clipped so ScrollTrigger never fires) it renders
// a plain, immediately-visible container instead — otherwise the preview would
// stay stuck at opacity 0.
export function SectionReveal({ preview, children, className, style, ...rest }: SectionRevealProps) {
  if (preview) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  return (
    <Reveal className={className} style={style} {...rest}>
      {children}
    </Reveal>
  );
}
