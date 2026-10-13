"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw, MessageCircle, Eye, Shield, Sun, Layers, Check } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

export default function SmartLensFinderPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1..4 = Qs, 5 = result
  const [visionNeed, setVisionNeed] = useState("");
  const [screenTime, setScreenTime] = useState("");
  const [activity, setActivity] = useState("");
  const [multiGlasses, setMultiGlasses] = useState("");

  const handleReset = () => {
    setStep(0);
    setVisionNeed("");
    setScreenTime("");
    setActivity("");
    setMultiGlasses("");
  };

  const handleDiscussWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello Darshana Optical,\n\nI completed your Smart Lens Finder quiz:\n` +
      `*Vision Needs:* ${visionNeed}\n` +
      `*Screen Time:* ${screenTime}\n` +
      `*Primary Activity:* ${activity}\n` +
      `*Multiple Pairs:* ${multiGlasses}\n\n` +
      `I would like to discuss recommended lens options with your optometrist.`
    );
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-surface-warm py-12 sm:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 border border-neutral-200/80 shadow-xl relative">
            {/* Top Progress Bar */}
            {step >= 1 && step <= 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  <span>Question 0{step} of 04</span>
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
              {/* INTRO */}
              {step === 0 && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="relative w-32 h-32 mx-auto overflow-hidden rounded-full border-4 border-orange-100 shadow-md">
                    <img
                      src="/images/lens-progressive.jpg"
                      alt="Smart Lens Finder"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950">
                      Find Your Ideal Lens Solution
                    </h1>
                    <p className="text-base text-neutral-600 max-w-md mx-auto font-medium leading-relaxed">
                      A quick diagnostic quiz to find the optimal lens type and coatings customized to your everyday screen time and lifestyle.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      Start Lens Quiz <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Q1: VISION NEED */}
              {step === 1 && (
                <motion.div
                  key="q1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">What is your primary vision need?</h2>
                    <p className="text-xs text-neutral-500 mt-1">Select your main focal requirement.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Distance Only (Driving / Distance)", desc: "Clear single-vision for outdoor and road viewing", icon: Eye },
                      { label: "Near / Reading Only", desc: "Close-up magnification for books, hobbies, and reading", icon: Eye },
                      { label: "Both Near & Far (Multifocal)", desc: "Seamless correction for distance, computer, and reading", icon: Layers },
                      { label: "Zero Power (Screen Protection)", desc: "Plano lenses with Blue Light & UV protection filters", icon: Shield }
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setVisionNeed(opt.label);
                            setStep(2);
                          }}
                          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                            visionNeed === opt.label
                              ? "border-brand-orange bg-brand-orange-soft/40 shadow-md ring-2 ring-brand-orange/30"
                              : "border-neutral-200/80 bg-neutral-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs text-brand-orange mb-3">
                            <Icon size={20} />
                          </div>
                          <div className="font-bold text-sm text-neutral-950">{opt.label}</div>
                          <p className="text-xs text-neutral-600 mt-1">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Q2: SCREEN TIME */}
              {step === 2 && (
                <motion.div
                  key="q2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">How many hours do you spend on screens?</h2>
                    <p className="text-xs text-neutral-500 mt-1">Smartphones, laptops, monitors, or TV daily.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Light (Under 2 hours)", desc: "Minimal digital exposure", img: "/images/cat-office.jpg" },
                      { label: "Moderate (2 – 6 hours)", desc: "Standard daily work & phone use", img: "/images/hero-woman.jpg" },
                      { label: "Heavy (6+ hours)", desc: "High digital strain / IT professionals", img: "/images/cat-women.jpg" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setScreenTime(opt.label);
                          setStep(3);
                        }}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                          screenTime === opt.label
                            ? "border-brand-orange bg-brand-orange-soft/40 shadow-md ring-2 ring-brand-orange/30"
                            : "border-neutral-200/80 bg-neutral-50 hover:bg-white"
                        }`}
                      >
                        <div className="h-20 w-20 mx-auto overflow-hidden rounded-full mb-3 border-2 border-white shadow-xs">
                          <img src={opt.img} alt={opt.label} className="h-full w-full object-cover" />
                        </div>
                        <div className="font-bold text-xs text-neutral-950">{opt.label}</div>
                        <p className="text-[11px] text-neutral-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Q3: OUTDOOR & SUNLIGHT */}
              {step === 3 && (
                <motion.div
                  key="q3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">How often are you outdoors or driving?</h2>
                    <p className="text-xs text-neutral-500 mt-1">To determine photochromic light adaptation and night glare needs.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Mostly Indoors", desc: "Standard anti-reflective clarity", icon: Shield },
                      { label: "Frequent Outdoor Travel", desc: "Photochromic Transitions tint recommended", icon: Sun },
                      { label: "Night Driving Focus", desc: "Anti-glare Night Drive coating recommended", icon: Eye }
                    ].map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setActivity(opt.label);
                            setStep(4);
                          }}
                          className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            activity === opt.label
                              ? "border-brand-orange bg-brand-orange-soft/40 shadow-md ring-2 ring-brand-orange/30"
                              : "border-neutral-200/80 bg-neutral-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white shadow-2xs text-brand-orange mb-3">
                            <Icon size={24} />
                          </div>
                          <div className="font-bold text-xs text-neutral-950">{opt.label}</div>
                          <p className="text-[11px] text-neutral-500 mt-1">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Q4: MULTIPLE GLASSES PREFERENCE */}
              {step === 4 && (
                <motion.div
                  key="q4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">Do you prefer one single pair for everything?</h2>
                    <p className="text-xs text-neutral-500 mt-1">Or dedicated separate pairs for reading/computer.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Yes, One Pair for Everything", desc: "Seamless Progressive or Anti-Fatigue All-in-One" },
                      { label: "No, Dedicated Specialized Pairs", desc: "Separate reading, driving, or computer glasses" }
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setMultiGlasses(opt.label);
                          setStep(5);
                        }}
                        className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                          multiGlasses === opt.label
                            ? "border-brand-orange bg-brand-orange-soft/40 shadow-md ring-2 ring-brand-orange/30"
                            : "border-neutral-200/80 bg-neutral-50 hover:bg-white"
                        }`}
                      >
                        <div className="font-bold text-sm text-neutral-950">{opt.label}</div>
                        <p className="text-xs text-neutral-600 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 5: RESULTS */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} /> Diagnostic Complete
                  </span>

                  <h2 className="text-3xl font-extrabold text-neutral-950">Recommended Lens Solutions</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
                    <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80 flex items-center gap-4">
                      <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-white p-1">
                        <img src="/images/lens-progressive.jpg" alt="Lens Match" className="h-full w-full object-cover rounded-lg" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-brand-orange">Primary Recommendation</span>
                        <h3 className="text-base font-bold text-neutral-950">High-Definition Progressive</h3>
                        <p className="text-xs text-neutral-600 font-medium">
                          Engineered for all-day seamless focus.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80 flex items-center gap-4">
                      <div className="w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-white p-1">
                        <img src="/images/hero-woman.jpg" alt="Coating Match" className="h-full w-full object-cover rounded-lg" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-brand-orange">Essential Coating</span>
                        <h3 className="text-base font-bold text-neutral-950">Blue-Cut + Anti-Glare</h3>
                        <p className="text-xs text-neutral-600 font-medium">
                          Protects from screen strain and night glare.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap justify-center gap-4">
                    <Link href="/lenses" className="btn-primary">
                      Explore All Lenses
                    </Link>
                    <button
                      onClick={handleDiscussWhatsApp}
                      className="btn-secondary gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      <MessageCircle size={18} /> Discuss with Optometrist
                    </button>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      <RotateCcw size={14} /> Retake Quiz
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
