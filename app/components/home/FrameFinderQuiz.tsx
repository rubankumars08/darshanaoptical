"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ArrowRight, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import { useBooking } from "../booking/BookingContext";

const FACE_SHAPES = [
  {
    id: "round",
    name: "Round",
    recommended: "Square & Rectangle Frames",
    desc: "Adds sharp angles to balance softer facial curves",
    frameSvg: "M4 6h16v12H4z",
  },
  {
    id: "oval",
    name: "Oval",
    recommended: "Aviator & Wayfarer Frames",
    desc: "Balances natural proportions with bold geometry",
    frameSvg: "M3 9c0-3 3-5 9-5s9 2 9 5-4 7-9 7-9-4-9-7z",
  },
  {
    id: "square",
    name: "Square",
    recommended: "Round & Cat-Eye Frames",
    desc: "Softens strong jawlines with rounded curves",
    frameSvg: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z",
  },
  {
    id: "heart",
    name: "Heart",
    recommended: "Light Oval & Bottom-Heavy Frames",
    desc: "Draws attention downward to balance broader forehead",
    frameSvg: "M4 8c2-4 6-4 8 0 2-4 6-4 8 0 0 6-8 10-8 10S4 14 4 8z",
  },
  {
    id: "diamond",
    name: "Diamond",
    recommended: "Rimless & Browline Frames",
    desc: "Accentuates cheekbones while highlighting eyes",
    frameSvg: "M12 2l8 10-8 10-8-10z",
  },
];

const STYLES = [
  { id: "modern", title: "Modern Minimalist", desc: "Sleek, lightweight, subtle elegance" },
  { id: "classic", title: "Classic Vintage", desc: "Timeless tortoiseshell & aviators" },
  { id: "bold", title: "Bold Statement", desc: "Thick acetate, distinct colors" },
  { id: "sport", title: "Active & Durable", desc: "Flexible, anti-slip, lightweight" },
];

export default function FrameFinderQuiz() {
  const [step, setStep] = useState(1);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);
  const { openBooking } = useBooking();

  const activeFaceObj = FACE_SHAPES.find((f) => f.id === (hoveredFace || selectedFace));

  const resetQuiz = () => {
    setStep(1);
    setSelectedFace(null);
    setSelectedStyle(null);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-dark p-6 sm:p-10 text-white shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-orange">
          <Sparkles size={14} /> 60-Second Smart Frame Finder
        </p>
        <span className="text-xs font-medium text-neutral-400">Step {step} of 3</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold">What is your face shape?</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Hover over a face shape to preview recommended frame silhouettes!
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {FACE_SHAPES.map((face) => {
                const isSelected = selectedFace === face.id;
                const isHovered = hoveredFace === face.id;
                return (
                  <motion.button
                    key={face.id}
                    onClick={() => setSelectedFace(face.id)}
                    onMouseEnter={() => setHoveredFace(face.id)}
                    onMouseLeave={() => setHoveredFace(null)}
                    animate={{
                      scale: isSelected ? 1.04 : 1,
                      opacity: selectedFace && !isSelected ? 0.5 : 1,
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-xl p-4 transition-all border ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange/15 shadow-md"
                        : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700"
                    }`}
                  >
                    {/* Face Shape Graphic + Frame Overlay */}
                    <div className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800/80">
                      {/* Face Outline */}
                      <svg className="h-10 w-10 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="9" />
                      </svg>
                      {/* Animated Frame Silhouette Overlay */}
                      <motion.svg
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: isSelected || isHovered ? 1 : 0.4, scale: 1 }}
                        className="absolute h-8 w-8 text-brand-orange"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d={face.frameSvg} />
                      </motion.svg>
                    </div>

                    <span className="text-sm font-semibold">{face.name}</span>
                    {isSelected && (
                      <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-orange text-white">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Dynamic Face Shape Recommendation Card */}
            {activeFaceObj && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-4"
              >
                <p className="text-xs font-bold text-brand-orange uppercase">Recommended for {activeFaceObj.name} Face:</p>
                <p className="mt-1 text-sm font-bold text-white">{activeFaceObj.recommended}</p>
                <p className="mt-0.5 text-xs text-neutral-300">{activeFaceObj.desc}</p>
              </motion.div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!selectedFace}
                className={!selectedFace ? "opacity-50 cursor-not-allowed" : ""}
              >
                Next Step <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold">Which style feels like you?</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Select your preferred aesthetic for daily wear.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STYLES.map((st) => {
                const isSelected = selectedStyle === st.id;
                return (
                  <motion.button
                    key={st.id}
                    onClick={() => setSelectedStyle(st.id)}
                    animate={{
                      scale: isSelected ? 1.02 : 1,
                      opacity: selectedStyle && !isSelected ? 0.45 : 1,
                    }}
                    className={`flex items-start gap-4 rounded-xl p-4 text-left border transition-all ${
                      isSelected
                        ? "border-brand-orange bg-brand-orange/15"
                        : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-brand-orange bg-brand-orange text-white" : "border-neutral-600"}`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-white">{st.title}</p>
                      <p className="mt-1 text-xs text-neutral-400">{st.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-neutral-400 hover:text-white"
              >
                ← Back
              </button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!selectedStyle}
                className={!selectedStyle ? "opacity-50 cursor-not-allowed" : ""}
              >
                See Match Results <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-4"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange">
              <Check size={28} strokeWidth={3} />
            </div>
            <h3 className="mt-4 text-2xl font-bold">Your Perfect Match is Ready!</h3>
            <p className="mt-2 text-sm text-neutral-300 max-w-md mx-auto">
              Based on your <span className="font-semibold text-white uppercase">{selectedFace}</span> face shape and{" "}
              <span className="font-semibold text-white uppercase">{selectedStyle}</span> preference, we recommend:
            </p>

            <div className="mt-6 inline-block rounded-xl border border-brand-orange/40 bg-neutral-900 p-4 text-left max-w-sm w-full">
              <p className="text-xs font-bold text-brand-orange uppercase">Top Recommendation:</p>
              <p className="mt-1 text-base font-bold text-white">DO-301 Square Tortoise Frame</p>
              <p className="text-xs text-neutral-400 mt-1">Lightweight acetate, anti-glare ready</p>
              <div className="mt-3 flex items-center justify-end border-t border-neutral-800 pt-3">
                <Button onClick={openBooking} variant="primary" size="sm">
                  Try On At Store
                </Button>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={resetQuiz}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
              >
                <RotateCcw size={14} /> Retake Quiz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
