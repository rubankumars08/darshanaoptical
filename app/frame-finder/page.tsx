"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check, RotateCcw, MessageCircle, Glasses, ShieldCheck, Heart } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

export default function SmartFrameFinderPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1..4 = questions, 5 = results
  const [gender, setGender] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [style, setStyle] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);

  const handleTogglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter((item) => item !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleReset = () => {
    setStep(0);
    setGender("");
    setFaceShape("");
    setStyle("");
    setPriorities([]);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello Darshana Optical,\n\nI used your Smart Frame Finder tool:\n` +
      `*Shopping For:* ${gender || "Any"}\n` +
      `*Face Shape:* ${faceShape || "Not Sure"}\n` +
      `*Preferred Style:* ${style || "General"}\n` +
      `*Priorities:* ${priorities.join(", ") || "Comfort"}\n\n` +
      `Please show me matching frames during my visit!`
    );
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-surface-warm py-12 sm:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          {/* Tool Outer Card */}
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 border border-neutral-200/80 shadow-xl relative">
            {/* Top Progress Bar */}
            {step >= 1 && step <= 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  <span>Step 0{step} of 04</span>
                  <span>{step * 25}% Completed</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-orange"
                    initial={{ width: "0%" }}
                    animate={{ width: `${step * 25}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* STEP 0: INTRO */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="relative w-32 h-32 mx-auto overflow-hidden rounded-full border-4 border-orange-100 shadow-md">
                    <img
                      src="/images/frame-finder.jpg"
                      alt="Smart Frame Finder"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950">
                      Find Your Ideal Frame
                    </h1>
                    <p className="text-base text-neutral-600 max-w-md mx-auto font-medium leading-relaxed">
                      Answer a few quick questions and we&apos;ll suggest frame styles tailored to your face shape, style preference, and budget.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      Start Finder <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: GENDER / TARGET */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">Who is this frame for?</h2>
                    <p className="text-xs text-neutral-500 mt-1">Select your preferred category.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Men", img: "/images/cat-men.jpg" },
                      { label: "Women", img: "/images/cat-women.jpg" },
                      { label: "Kids", img: "/images/cat-kids.jpg" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setGender(opt.label);
                          setStep(2);
                        }}
                        className={`group p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          gender === opt.label
                            ? "border-brand-orange bg-brand-orange-soft/40 shadow-md ring-2 ring-brand-orange/30"
                            : "border-neutral-200/80 bg-neutral-50 hover:bg-white hover:border-neutral-300"
                        }`}
                      >
                        <div className="h-20 w-20 mx-auto overflow-hidden rounded-full mb-3 border-2 border-white shadow-xs">
                          <img src={opt.img} alt={opt.label} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-bold text-sm text-neutral-900 group-hover:text-brand-orange">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: FACE SHAPE */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">What is your face shape?</h2>
                    <p className="text-xs text-neutral-500 mt-1">We balance angles and curves for the perfect look.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Oval", img: "/images/avatar-2.jpg" },
                      { label: "Round", img: "/images/avatar-1.jpg" },
                      { label: "Square", img: "/images/avatar-3.jpg" },
                      { label: "Heart", img: "/images/avatar-4.jpg" },
                      { label: "Diamond", img: "/images/avatar-5.jpg" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setFaceShape(opt.label);
                          setStep(3);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          faceShape === opt.label
                            ? "border-brand-orange bg-brand-orange-soft/40 shadow-md ring-2 ring-brand-orange/30"
                            : "border-neutral-200/80 bg-neutral-50 hover:bg-white"
                        }`}
                      >
                        <div className="h-14 w-14 mx-auto overflow-hidden rounded-full mb-2 border border-neutral-200">
                          <img src={opt.img} alt={opt.label} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-bold text-xs text-neutral-900">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: STYLE PREFERENCE */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">Select your preferred style</h2>
                    <p className="text-xs text-neutral-500 mt-1">Choose the aesthetic you love most.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Classic & Timeless", img: "/images/frame-1.jpg" },
                      { label: "Modern & Bold", img: "/images/frame-3.jpg" },
                      { label: "Minimalist & Thin", img: "/images/frame-2.jpg" },
                      { label: "Trendy & Colorful", img: "/images/frame-6.jpg" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setStyle(opt.label);
                          setStep(4);
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          style === opt.label
                            ? "border-brand-orange bg-brand-orange-soft/40 shadow-md"
                            : "border-neutral-200/80 bg-neutral-50 hover:bg-white"
                        }`}
                      >
                        <div className="aspect-4/3 overflow-hidden rounded-xl bg-white mb-3 p-1">
                          <img src={opt.img} alt={opt.label} className="h-full w-full object-contain" />
                        </div>
                        <span className="font-bold text-xs text-neutral-900">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 4: PRIORITIES */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">What matters most to you?</h2>
                    <p className="text-xs text-neutral-500 mt-1">Select all key factors.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["Ultra Lightweight", "High Durability", "All-Day Comfort", "Premium Brand", "Best Value Price", "Flexible TR90 Fit"].map((opt) => {
                      const isSel = priorities.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleTogglePriority(opt)}
                          className={`p-4 rounded-2xl border text-left flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                            isSel
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
                              : "bg-neutral-50 border-neutral-200/80 text-neutral-800 hover:bg-white"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSel && <Check size={16} className="text-brand-orange" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setStep(5)}
                      className="btn-primary gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      See Recommended Matches <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: RESULTS WITH REAL IMAGES */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} /> Personalized Recommendation
                  </span>

                  <h2 className="text-3xl font-extrabold text-neutral-950">Your Curated Matches</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
                    <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80 flex items-center gap-4">
                      <div className="w-24 h-20 shrink-0 overflow-hidden rounded-xl bg-white p-1">
                        <img src="/images/frame-1.jpg" alt="Match 1" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-brand-orange">Top Fit</span>
                        <h3 className="text-base font-bold text-neutral-950">Classic Acetate & Square</h3>
                        <p className="text-xs text-neutral-600 font-medium">
                          Ideal for {faceShape || "balanced"} face contours.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80 flex items-center gap-4">
                      <div className="w-24 h-20 shrink-0 overflow-hidden rounded-xl bg-white p-1">
                        <img src="/images/frame-3.jpg" alt="Match 2" className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-brand-orange">Alternative Pick</span>
                        <h3 className="text-base font-bold text-neutral-950">Featherlight TR90 / Metal</h3>
                        <p className="text-xs text-neutral-600 font-medium">
                          Prioritizes {priorities[0] || "comfort and durability"}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap justify-center gap-4">
                    <Link href="/frames" className="btn-primary">
                      Browse Full Collection
                    </Link>
                    <button
                      onClick={handleShareWhatsApp}
                      className="btn-secondary gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      <MessageCircle size={18} /> Show Results on WhatsApp
                    </button>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      <RotateCcw size={14} /> Start Over
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
