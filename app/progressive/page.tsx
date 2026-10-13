"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Eye,
  Layers,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Sun,
  Monitor,
  Check,
  Calendar,
  Award,
  Zap,
  MapPin,
  Phone
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import { useBooking } from "../components/booking/BookingContext";

const ZONES = [
  {
    id: "upper",
    title: "Distance Vision",
    scene: "Highway & Outdoors",
    desc: "Provides crystal-clear optics for driving, walking, outdoor activities, and viewing distant objects clearly.",
    color: "bg-blue-500",
    img: "/images/hero-woman.jpg",
  },
  {
    id: "middle",
    title: "Intermediate Vision",
    scene: "Computer & Workspace",
    desc: "Smooth progressive corridor designed for computer monitor distances, car dashboards, and desk work.",
    color: "bg-amber-500",
    img: "/images/cat-office.jpg",
  },
  {
    id: "lower",
    title: "Near & Reading Vision",
    scene: "Smartphone & Fine Print",
    desc: "Optimized bottom segment engineered for comfortable reading of smartphones, books, and fine text.",
    color: "bg-emerald-500",
    img: "/images/cat-women.jpg",
  },
];

const COMPARISON_TIERS = [
  {
    id: "basic",
    name: "Standard Progressive",
    corridor: "Narrow Corridor",
    corridorWidth: "w-1/3",
    desc: "Cost-effective entry multifocal, ideal for light everyday multi-tasking.",
  },
  {
    id: "advanced",
    name: "Advanced HD Progressive",
    corridor: "Wide Corridor",
    corridorWidth: "w-2/3",
    desc: "Significantly reduced peripheral soft blur, providing swift eye transitions.",
  },
  {
    id: "premium",
    name: "Personalized Digital Custom",
    corridor: "Panoramic Corridor",
    corridorWidth: "w-full",
    desc: "Customized to your exact facial parameters with maximum edge-to-edge clarity.",
  },
];

const WHO_FOR_POINTS = [
  "Need different corrections for distance and near vision (Presbyopia).",
  "Frequently switch between multiple pairs of distance and reading glasses.",
  "Work dynamically across computer, reading, and distance environment tasks.",
  "Want a seamless, single pair of stylish glasses for all everyday viewing distances.",
];

export default function ProgressivePage() {
  const { openBooking } = useBooking();
  const [activeZone, setActiveZone] = useState("upper");
  const [activeTier, setActiveTier] = useState("advanced");

  const activeZoneObj = ZONES.find((z) => z.id === activeZone) || ZONES[0];
  const activeTierObj = COMPARISON_TIERS.find((t) => t.id === activeTier) || COMPARISON_TIERS[1];

  const handleWhatsAppTalk = () => {
    const msg = encodeURIComponent("Hello Darshana Optical, I would like to ask about Progressive Lens options and expert fitting at your Harur store.");
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-[#faf8f5] py-12 sm:py-16 lg:py-20 border-b border-neutral-200/60">
          <div className="container-brand grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-extrabold uppercase tracking-wider">
                <Sparkles size={14} /> Seamless Multi-Focal Optics
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-none">
                See Near. See Far. <br />
                <span className="text-brand-orange">And Everything Between.</span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-xl">
                Progressive lenses combine multiple viewing zones into one pair of glasses without visible segment lines. Experience smooth, uninterrupted vision across all distances.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={openBooking}
                  className="btn-primary gap-2 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Eye Test</span>
                </button>
                <button
                  onClick={handleWhatsAppTalk}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Ask About Progressives</span>
                </button>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                <img
                  src="/images/lens-progressive.jpg"
                  alt="Progressive Lenses"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Multi-Focal Technology</span>
                    <h3 className="text-lg font-bold">No Bifocal Line. Total Clarity.</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW PROGRESSIVE LENSES WORK */}
        <section className="py-16 bg-white border-b border-neutral-100">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">How Progressive Lenses Work</h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Click on the viewing zones below to simulate how the lens delivers crisp optics for distance, computer, and reading.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-neutral-50 rounded-3xl p-8 border border-neutral-200/80 shadow-sm">
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="relative w-full max-w-sm aspect-4/3 rounded-3xl bg-neutral-950 border-4 border-neutral-800 p-2 shadow-xl flex flex-col overflow-hidden">
                  <div className="relative h-full w-full rounded-2xl overflow-hidden">
                    <img
                      src={activeZoneObj.img}
                      alt={activeZoneObj.title}
                      className="h-full w-full object-cover transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-neutral-950/40 pointer-events-none" />
                    <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-md">
                      Simulating: {activeZoneObj.scene}
                    </div>
                  </div>

                  <div className="absolute inset-2 flex flex-col">
                    <div
                      onClick={() => setActiveZone("upper")}
                      className={`flex-1 rounded-t-xl transition-all duration-300 flex items-center justify-center cursor-pointer border-b border-dashed border-white/30 ${
                        activeZone === "upper" ? "bg-blue-600/40 ring-2 ring-blue-400" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md">Distance Zone</span>
                    </div>

                    <div
                      onClick={() => setActiveZone("middle")}
                      className={`h-14 my-1 transition-all duration-300 flex items-center justify-center cursor-pointer border-b border-dashed border-white/30 ${
                        activeZone === "middle" ? "bg-amber-600/40 ring-2 ring-amber-400" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md">Intermediate Zone</span>
                    </div>

                    <div
                      onClick={() => setActiveZone("lower")}
                      className={`flex-1 rounded-b-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        activeZone === "lower" ? "bg-emerald-600/40 ring-2 ring-emerald-400" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md">Reading Zone</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                {ZONES.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => setActiveZone(zone.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      activeZone === zone.id
                        ? "bg-white border-brand-orange shadow-md scale-[1.01]"
                        : "bg-white/80 border-neutral-200/80 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`h-3 w-3 rounded-full ${zone.color}`} />
                      <h3 className="text-base font-bold text-neutral-950">{zone.title}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-600 font-medium pl-6">
                      {zone.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Corridor Comparison */}
            <div className="rounded-3xl bg-white p-8 border border-neutral-200 shadow-sm space-y-6">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Corridor Width
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 mt-1">
                  Viewing Corridor By Lens Tier
                </h3>
              </div>

              <div className="flex justify-center gap-2">
                {COMPARISON_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setActiveTier(tier.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTier === tier.id
                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>

              <div className="max-w-md mx-auto rounded-2xl bg-neutral-950 p-6 text-white text-center space-y-3">
                <div className="text-xs text-neutral-400 font-bold uppercase">Active Corridor: {activeTierObj.corridor}</div>
                <div className="h-5 rounded-full bg-neutral-800 p-1 flex items-center justify-center">
                  <div className={`h-full rounded-full bg-gradient-to-r from-brand-orange to-amber-400 ${activeTierObj.corridorWidth} transition-all duration-500`} />
                </div>
                <p className="text-xs text-neutral-300 font-medium">{activeTierObj.desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* STORE VISIT STRIP */}
        <section className="py-16 bg-neutral-50 border-t border-neutral-200/80">
          <div className="container-brand space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">Visit Our Harur Store</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin size={20} className="text-brand-orange shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-neutral-950">Darshana Optical</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Tvk nagar, salem bypass road, Vasanth & co opposite, Harur - 636903
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Store Photos Grid */}
              <div className="lg:col-span-5 grid grid-cols-4 gap-3">
                {["/images/store-1.jpg", "/images/store-2.jpg", "/images/store-3.jpg", "/images/store-4.jpg"].map((img, idx) => (
                  <div key={idx} className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <img src={img} alt={`Store ${idx + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

              <div className="lg:col-span-3 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-800 font-bold">
                  <Phone size={16} className="text-brand-orange" />
                  <span>+91 88705 71536</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-800 font-bold">
                  <MessageCircle size={16} className="text-brand-orange" />
                  <span>WhatsApp Us</span>
                </div>
                <a
                  href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary gap-2 text-xs font-bold w-full justify-center mt-2"
                >
                  <span>Get Directions</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
