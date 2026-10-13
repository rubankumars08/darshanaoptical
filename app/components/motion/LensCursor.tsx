"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export default function LensCursor() {
  const prefersReduced = useReducedMotion();
  const [active, setActive] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);
  const [isPointerFine, setIsPointerFine] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 300, mass: 0.2 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (prefersReduced) return;
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    setIsPointerFine(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const lensSection = target?.closest("[data-lens-cursor='true']");

      if (lensSection) {
        setActive(true);
        const customText = lensSection.getAttribute("data-lens-text");
        setHoverText(customText || "1.05x Focus");
      } else {
        setActive(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, prefersReduced]);

  if (prefersReduced || !isPointerFine || !active) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="pointer-events-none fixed top-0 left-0 z-50 flex h-28 w-28 items-center justify-center rounded-full border border-white/60 bg-white/10 shadow-[0_8px_32px_rgba(252,90,6,0.25)] backdrop-blur-[2px] transition-all duration-150"
    >
      {/* Outer Optical Ring */}
      <div className="absolute inset-0 rounded-full border border-brand-orange/40 animate-pulse" />
      
      {/* Light Reflection Accent */}
      <div className="absolute top-2 right-4 h-3 w-7 -rotate-45 rounded-full bg-white/40 blur-[1px]" />
      
      {/* Focus Crosshair Indicator */}
      <div className="relative flex items-center justify-center text-center">
        <div className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
        {hoverText && (
          <span className="absolute top-5 whitespace-nowrap rounded-full bg-neutral-900/90 px-2 py-0.5 text-[10px] font-semibold text-white tracking-wider uppercase shadow-sm">
            {hoverText}
          </span>
        )}
      </div>
    </motion.div>
  );
}
