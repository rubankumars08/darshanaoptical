"use client";

import Image from "next/image";
import {
  CalendarCheck,
  Settings,
  Glasses,
  Search,
  User,
  ArrowRight,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useBooking } from "../booking/BookingContext";
import { EASE_STANDARD } from "../../lib/motion";

const FEATURES = [
  { icon: Settings, label: "Accurate\nEye Test" },
  { icon: Glasses, label: "500+\nFrame Choices" },
  { icon: Search, label: "Lenses for\nDaily Needs" },
  { icon: User, label: "Friendly\nHelp" },
];

export default function Hero() {
  const { openBooking } = useBooking();
  const prefersReduced = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.setProperty("--parallax-x", `${relX * -14}px`);
    imageRef.current.style.setProperty("--parallax-y", `${relY * -10}px`);
  }

  function handleMouseLeave() {
    if (!imageRef.current) return;
    imageRef.current.style.setProperty("--parallax-x", "0px");
    imageRef.current.style.setProperty("--parallax-y", "0px");
  }

  return (
    <section
      className="overflow-hidden bg-[#fafafa] py-10 md:py-16 lg:py-20"
      data-lens-cursor="true"
      data-lens-text="Vision Focus"
    >
      <div className="container-brand">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="min-w-0 lg:col-span-6 space-y-6">
            {/* Trusted Location Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_STANDARD }}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200/80 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 shadow-2xs"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
              <span>Harur&apos;s trusted optical store</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_STANDARD }}
              className="max-w-full break-words text-4xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-5xl lg:text-[54px] leading-[1.1] [text-wrap:balance]"
            >
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE_STANDARD }}
                className="block"
              >
                Clear vision.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.24, ease: EASE_STANDARD }}
                className="block text-brand-orange"
              >
                Confident you.
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: EASE_STANDARD }}
              className="max-w-full text-base text-neutral-600 leading-relaxed font-normal sm:max-w-xl sm:text-lg [text-wrap:pretty]"
            >
              Get your eyes tested and choose comfortable glasses that suit
              your face, daily work and budget.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: EASE_STANDARD }}
              className="flex flex-wrap items-center gap-3.5 pt-1"
            >
              <button
                onClick={openBooking}
                className="btn-primary gap-2.5 cursor-pointer"
              >
                <CalendarCheck size={18} />
                <span>Book Eye Test</span>
              </button>

              <a
                href="/frames"
                className="btn-secondary group gap-2.5"
              >
                <span>See Frames</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
            </motion.div>

            {/* Feature Pills Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="pt-6 border-t border-neutral-200/60"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {FEATURES.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.55 + idx * 0.08,
                        ease: EASE_STANDARD,
                      }}
                      className="flex items-start gap-2.5 group"
                    >
                      <Icon
                        size={18}
                        className="text-brand-orange shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-115"
                      />
                      <span className="text-xs font-semibold text-neutral-700 leading-tight whitespace-pre-line">
                        {f.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual with Circular Lens Mask Reveal & Badge */}
          <div
            className="relative min-w-0 lg:col-span-6 flex justify-center lg:justify-end"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full max-w-lg">
              {/* Circular Lens Mask Expand on Entry */}
              <motion.div
                ref={imageRef}
                initial={{
                  clipPath: prefersReduced
                    ? "circle(100% at 50% 50%)"
                    : "circle(0% at 50% 50%)",
                  filter: "blur(8px)",
                  opacity: 0,
                }}
                animate={{
                  clipPath: "circle(85% at 50% 50%)",
                  filter: "blur(0px)",
                  opacity: 1,
                }}
                transition={{ duration: 0.95, delay: 0.25, ease: EASE_STANDARD }}
                style={{
                  transform:
                    "translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0)",
                  transition: "transform 0.2s ease-out",
                }}
                className="relative aspect-4/3 sm:aspect-square overflow-hidden rounded-3xl bg-neutral-100 shadow-xl"
              >
                <Image
                  src="/images/hero-woman.jpg"
                  alt="Darshana Optical - Stylish Eyewear"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
                  quality={90}
                  className="object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              </motion.div>

              {/* Floating Badge on Right with Inverted Parallax Shift */}
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.85, filter: "blur(6px)" }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  y: prefersReduced ? 0 : [0, -6, 0],
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.7 },
                  x: { duration: 0.6, delay: 0.7 },
                  scale: { duration: 0.6, delay: 0.7 },
                  filter: { duration: 0.6, delay: 0.7 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{
                  transform:
                    "translate3d(calc(var(--parallax-x, 0px) * -1.5), calc(var(--parallax-y, 0px) * -1.5), 0)",
                  transition: "transform 0.25s ease-out",
                }}
                className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl border border-neutral-100 flex flex-col items-center justify-center text-center w-28 sm:w-32 z-10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange mb-1.5 shadow-2xs">
                  <Glasses size={22} />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-neutral-950 leading-none">
                  500+
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-1">
                  Frames to Choose
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
