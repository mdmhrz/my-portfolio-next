'use client';

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "motion/react";

// A smart, context-aware cursor ring that expands, glows, and shifts to the theme
// primary, and displays custom text tags (e.g. "VIEW") when hovering over qualified elements.
export function MouseFollower() {
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");
  // Resolved `--primary` as "r, g, b" so motion can interpolate the glow (it can't
  // tween oklch/color-mix). The ring's own `text-primary` lets the browser resolve it.
  const [primaryRgb, setPrimaryRgb] = useState("99, 102, 241");

  useEffect(() => {
    const read = () => {
      if (!ringRef.current) return;
      const c = getComputedStyle(ringRef.current).color; // resolves text-primary → rgb()
      const m = c.match(/-?\d+\.?\d*/g);
      if (m && m.length >= 3) {
        setPrimaryRgb(`${Math.round(+m[0])}, ${Math.round(+m[1])}, ${Math.round(+m[2])}`);
      }
    };
    read();
    // Re-resolve when the theme (light/dark) class flips.
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const springConfig = { damping: 30, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Match links, buttons, inputs, option fields, textareas, role buttons, or custom cursor pointer classes
      const isInteractive = target.closest(
        'button, a, input, select, textarea, [role="button"], .cursor-pointer, [onClick]'
      );
      setIsHovering(!!isInteractive);

      // Extract optional cursor text attributes
      const textTarget = target.closest('[data-cursor-text]') as HTMLElement | null;
      if (textTarget) {
        setCursorText(textTarget.getAttribute('data-cursor-text') || "");
      } else {
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ringRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full border md:flex items-center justify-center font-mono text-[9px] font-bold tracking-widest text-primary select-none uppercase overflow-hidden"
      animate={{
        width: cursorText ? 64 : (isHovering ? 56 : 28),
        height: cursorText ? 64 : (isHovering ? 56 : 28),
        backgroundColor: cursorText ? `rgba(${primaryRgb}, 0.08)` : (isHovering ? `rgba(${primaryRgb}, 0.06)` : "rgba(0, 0, 0, 0)"),
        borderColor: cursorText ? `rgba(${primaryRgb}, 0.6)` : (isHovering ? `rgba(${primaryRgb}, 0.55)` : "rgba(163, 163, 163, 0.35)"),
        borderWidth: (cursorText || isHovering) ? "1.5px" : "1px",
        boxShadow: (cursorText || isHovering) ? `0 0 15px rgba(${primaryRgb}, 0.15)` : "none",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <AnimatePresence>
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            {cursorText}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
