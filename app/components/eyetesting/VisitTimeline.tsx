"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { CalendarCheck, ClipboardList, Monitor, FileCheck, MessageSquare } from "lucide-react";
import { EASE_STANDARD } from "../../lib/motion";

const STEPS = [
  {
    num: "1",
    title: "Book Appointment",
    desc: "Choose a convenient date & time for your eye test.",
    icon: CalendarCheck,
  },
  {
    num: "2",
    title: "Initial Screening",
    desc: "Basic tests to check your eye health and vision parameters.",
    icon: ClipboardList,
  },
  {
    num: "3",
    title: "Detailed Examination",
    desc: "Advanced testing using modern equipment for accurate diagnosis.",
    icon: Monitor,
  },
  {
    num: "4",
    title: "Prescription & Advice",
    desc: "Get your prescription and expert advice for better eye care.",
    icon: FileCheck,
  },
  {
    num: "5",
    title: "Follow-up Care",
    desc: "We guide you with the best solutions and follow-up support.",
    icon: MessageSquare,
  },
];

export default function VisitTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.3"],
  });

  const lineScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="process-timeline" ref={containerRef} className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="container-brand space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Your Eye Testing Journey
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 font-normal">
            Simple, seamless and thorough process for your clear vision.
          </p>
        </div>

        {/* Timeline Grid with Dotted & Filled Connecting Line */}
        <div className="relative">
          {/* Connecting Base Dotted Line (Desktop) */}
          <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] border-t-2 border-dashed border-neutral-300 z-0" />

          {/* Animated Orange Connecting Fill Line */}
          <motion.div
            style={{ scaleX: lineScaleX }}
            className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-0.5 bg-brand-orange origin-left z-0 shadow-[0_0_8px_rgba(252,90,6,0.6)]"
          />

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, scale: 0.94, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.12, duration: 0.5, ease: EASE_STANDARD }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center text-center group cursor-default"
                >
                  {/* Top Circle Icon on Line */}
                  <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white border border-neutral-200 text-brand-orange shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-brand-orange group-hover:shadow-md">
                    <Icon size={22} className="text-brand-orange" strokeWidth={1.75} />
                  </div>

                  {/* Number Badge + Title */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-white text-xs font-bold shrink-0 shadow-xs">
                      {step.num}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-950 leading-snug">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-neutral-600 font-normal max-w-[200px]">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
