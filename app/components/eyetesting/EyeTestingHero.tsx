"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarCheck, ArrowRight, Cpu, UserCheck, ShieldCheck, HeartHandshake, Users } from "lucide-react";

interface EyeTestingHeroProps {
  onBookClick: () => void;
}

const TRUST_PILLS = [
  { icon: Cpu, label: "Advanced Technology" },
  { icon: UserCheck, label: "Certified Optometrists" },
  { icon: ShieldCheck, label: "Accurate Prescription" },
  { icon: HeartHandshake, label: "Personalised Care" },
  { icon: Users, label: "Trusted by 5000+ Patients" },
];

export default function EyeTestingHero({ onBookClick }: EyeTestingHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-10 md:py-16 lg:py-20">
      <div className="container-brand">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Copy & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50/80 px-3.5 py-1.5 text-xs font-bold tracking-wider text-brand-orange">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              EXPERT EYE CARE, CLEARER VISION
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl lg:text-[54px] leading-[1.12]">
              Eye Testing <br />
              <span className="text-brand-orange">You Can Trust.</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl text-base text-neutral-600 leading-relaxed font-normal sm:text-lg">
              Comprehensive eye examination using advanced technology to detect vision issues early and ensure the best clarity for your eyes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onBookClick}
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-orange/20 transition-transform hover:scale-[1.02] hover:bg-brand-orange-hover cursor-pointer"
              >
                <CalendarCheck size={18} />
                Book Eye Test
              </button>

              <a
                href="#process-timeline"
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-800 hover:text-brand-orange transition-colors"
              >
                Explore Our Process <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust Pills Strip */}
            <div className="pt-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                {TRUST_PILLS.map((pill) => {
                  const Icon = pill.icon;
                  return (
                    <div
                      key={pill.label}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600"
                    >
                      <Icon size={16} className="text-neutral-500 shrink-0" />
                      <span>{pill.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-lg">
              {/* Main Doctor Patient Image */}
              <div className="relative aspect-4/3 sm:aspect-16/11 overflow-hidden rounded-2xl bg-neutral-100 shadow-xl border border-neutral-200/80">
                <Image
                  src="/images/cta-consultation.jpg"
                  alt="Doctor performing professional eye consultation and vision testing on patient"
                  fill
                  sizes="(max-width: 1024px) 100vw, 540px"
                  quality={90}
                  priority
                  className="object-cover"
                />
              </div>

              {/* Floating Badge: 5000+ Happy Patients */}
              <div className="absolute -bottom-4 right-4 sm:-right-4 rounded-xl bg-white p-3.5 shadow-xl border border-neutral-100/80 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-base font-extrabold text-neutral-900 leading-none">
                    5000+
                  </div>
                  <div className="text-xs font-medium text-neutral-500 mt-1">
                    Happy Patients
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
