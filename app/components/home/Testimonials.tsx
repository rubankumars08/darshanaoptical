"use client";

import { Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEWS = [
  {
    name: "Priya S.",
    avatar: "/images/review-avatar-priya.png",
    rating: 5,
    text: "The eye test was clear and the staff explained everything simply. I also found a frame I liked.",
  },
  {
    name: "Karthik R.",
    avatar: "/images/avatar-1.jpg",
    rating: 5,
    text: "Good eye test and plenty of frame choices. The team helped me choose the right lenses.",
  },
  {
    name: "Anitha M.",
    avatar: "/images/avatar-2.jpg",
    rating: 5,
    text: "The staff were patient during my check-up. My new progressive glasses are comfortable for reading and distance.",
  },
  {
    name: "Suresh K.",
    avatar: "/images/avatar-3.jpg",
    rating: 5,
    text: "I got computer glasses for office work. They feel comfortable during long screen hours.",
  },
  {
    name: "Divya N.",
    avatar: "/images/avatar-4.jpg",
    rating: 5,
    text: "A good optical store in Harur. Friendly guidance, nice frames and fair prices.",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  const currentReview = REVIEWS[currentIndex];

  return (
    <section className="bg-white py-12 sm:py-16 border-t border-neutral-100">
      <div className="container-brand space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight text-balance">
            What customers say
          </h2>
          <a
            href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-orange hover:underline"
          >
            See Google reviews <ArrowRight size={14} />
          </a>
        </div>

        {/* Testimonials Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Active Review Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-2xl bg-neutral-50 p-6 sm:p-7 border border-neutral-200/80 shadow-xs"
              >
                {/* Customer Avatar */}
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-full border-2 border-brand-orange/30 shadow-xs bg-white">
                  <Image
                    src={currentReview.avatar}
                    alt={currentReview.name}
                    fill
                    sizes="80px"
                    quality={90}
                    className="object-cover"
                  />
                </div>

                {/* Review Text, Rating & Name */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-brand-orange">
                    {Array.from({ length: currentReview.rating }).map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-neutral-700 font-medium italic">
                    &ldquo;{currentReview.text}&rdquo;
                  </p>

                  <div className="pt-1">
                    <div className="text-xs sm:text-sm font-bold text-neutral-950">
                      {currentReview.name}
                    </div>
                    <div className="text-[11px] font-medium text-neutral-500">
                      Google Review
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Avatar Selectors + Pagination + Nav Arrows */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center space-y-4">
            {/* Avatars Row */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {REVIEWS.map((r, idx) => (
                <button
                  key={r.name}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View review from ${r.name}`}
                  className={`relative h-11 w-11 sm:h-13 sm:w-13 overflow-hidden rounded-full border-2 transition-all cursor-pointer ${
                    currentIndex === idx
                      ? "border-brand-orange scale-105 shadow-md ring-2 ring-brand-orange/20"
                      : "border-neutral-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    fill
                    sizes="52px"
                    quality={85}
                    className="object-cover"
                  />
                </button>
              ))}

              {/* Nav Arrows */}
              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={handlePrev}
                  aria-label="Previous review"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next review"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {REVIEWS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx
                      ? "w-4 bg-brand-orange"
                      : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
