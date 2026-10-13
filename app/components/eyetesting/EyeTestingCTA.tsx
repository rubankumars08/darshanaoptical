"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CalendarCheck, PhoneCall, ShieldCheck, Clock, Award, Sparkles } from "lucide-react";

interface EyeTestingCTAProps {
  onBookClick: () => void;
}

export default function EyeTestingCTA({ onBookClick }: EyeTestingCTAProps) {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container-brand">
        <div className="relative overflow-hidden rounded-2xl bg-brand-orange text-white shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Column: Customer Visual */}
            <div className="hidden lg:flex lg:col-span-3 items-center justify-center p-6">
              <div className="relative h-44 w-44 rounded-2xl overflow-hidden shadow-md border-2 border-white/30">
                <Image
                  src="/images/avatar-priya.jpg"
                  alt="Happy Customer at Darshana Optical"
                  fill
                  sizes="180px"
                  quality={90}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Middle Column: Copy & Badges */}
            <div className="col-span-1 lg:col-span-6 p-6 sm:p-8 lg:py-10 lg:px-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                YOUR VISION, OUR PRIORITY
              </p>

              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-white leading-tight">
                Book Your Eye Test Today
              </h2>

              <p className="text-xs sm:text-sm text-white/90 font-normal leading-relaxed">
                Take the first step towards clearer vision and better eye health.
              </p>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-white/95 pt-2">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} /> Quick Appointment
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Award size={14} /> Expert Eye Care
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Trusted by Thousands
                </div>
              </div>
            </div>

            {/* Right Column: CTA Button & Phone */}
            <div className="col-span-1 lg:col-span-3 p-6 sm:p-8 lg:p-6 flex flex-col items-center justify-center text-center">
              <button
                onClick={onBookClick}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-neutral-900 shadow-md transition-transform hover:scale-105 cursor-pointer w-full sm:w-auto"
              >
                <CalendarCheck size={18} className="text-brand-orange" />
                <span>Book Eye Test Now</span>
              </button>

              <p className="mt-3 text-xs font-medium text-white/90">
                or Call Us: <a href="tel:+918870571536" className="font-bold hover:underline">+91 88705 71536</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
