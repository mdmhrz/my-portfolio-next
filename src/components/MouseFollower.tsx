'use client';

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "motion/react";

// A smart, context-aware cursor ring that expands, glows, and shifts to brand indigo,
// and displays custom text tags (e.g. "VIEW") when hovering over qualified elements.
export function MouseFollower() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [cursorText, setCursorText] = useState("");

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
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden rounded-full border md:flex items-center justify-center font-mono text-[9px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 select-none uppercase overflow-hidden"
      animate={{
        width: cursorText ? 64 : (isHovering ? 56 : 28),
        height: cursorText ? 64 : (isHovering ? 56 : 28),
        backgroundColor: cursorText ? "rgba(99, 102, 241, 0.08)" : (isHovering ? "rgba(99, 102, 241, 0.06)" : "rgba(0, 0, 0, 0)"),
        borderColor: cursorText ? "rgba(99, 102, 241, 0.6)" : (isHovering ? "rgba(99, 102, 241, 0.55)" : "rgba(163, 163, 163, 0.35)"),
        borderWidth: (cursorText || isHovering) ? "1.5px" : "1px",
        boxShadow: (cursorText || isHovering) ? "0 0 15px rgba(99, 102, 241, 0.15)" : "none",
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
