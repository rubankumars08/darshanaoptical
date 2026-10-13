"use client";

import Link from "next/link";
import { useBooking } from "./components/booking/BookingContext";
import {
  Home,
  CalendarCheck,
  Glasses,
  Eye,
  Layers,
  Tag,
  MapPin,
  Phone,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Compass,
} from "lucide-react";

export default function NotFound() {
  const { openBooking } = useBooking();

  const quickLinks = [
    {
      title: "Spectacle Frames",
      desc: "1,200+ lightweight frames for men, women & kids",
      href: "/frames",
      icon: Glasses,
      badge: "1200+ Styles",
    },
    {
      title: "Eyeglass Lenses",
      desc: "Blue-cut digital protection & anti-glare lenses",
      href: "/lenses",
      icon: Layers,
      badge: "Anti-Glare",
    },
    {
      title: "Progressive Lenses",
      desc: "Line-free seamless vision for distance and reading",
      href: "/progressive",
      icon: Eye,
      badge: "No-Line",
    },
    {
      title: "Computerized Eye Test",
      desc: "Precision eye checkup with expert optometrists",
      href: "/eye-testing",
      icon: Eye,
      badge: "In Harur",
    },
    {
      title: "Special Offers",
      desc: "Affordable combo packages & frame discounts",
      href: "/offers",
      icon: Tag,
      badge: "Save More",
    },
    {
      title: "Store Location & Contact",
      desc: "Opposite Vasanth & Co, Salem Bypass Road, Harur",
      href: "/contact",
      icon: MapPin,
      badge: "Open 7 Days",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1e1f24] selection:bg-[#fc5a06] selection:text-white">
      {/* Minimal Brand Bar */}
      <header className="w-full border-b border-[#e6e6e8] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#fff0e8] text-[#fc5a06] flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
              <Glasses className="w-5 h-5 text-[#fc5a06]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#1e1f24] leading-tight">
                Darshana <span className="text-[#fc5a06]">Optical</span>
              </span>
              <span className="text-[10px] font-semibold text-[#858791] tracking-wider uppercase">
                Harur, Tamil Nadu
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4b4c54] hover:text-[#fc5a06] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <a
              href="tel:+918870571536"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fff0e8] text-[#fc5a06] text-xs font-bold hover:bg-[#fc5a06] hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 88705 71536</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main 404 Hero & Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 sm:py-16">
        {/* Ambient brand orange glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#fc5a06]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ffd8c4]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl w-full mx-auto text-center">
          {/* Eyecare Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fff0e8] text-[#fc5a06] text-xs font-bold tracking-wide uppercase mb-6 shadow-xs border border-[#ffd8c4]">
            <Sparkles className="w-3.5 h-3.5 text-[#fc5a06]" />
            <span>404 Error &bull; Out of Focus</span>
          </div>

          {/* Graphical 404 with Glasses Centerpiece */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 my-2 select-none">
            <span className="text-7xl sm:text-9xl font-black tracking-tighter text-[#1e1f24]">
              4
            </span>
            <div className="relative flex items-center justify-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white shadow-xl shadow-black/5 border border-[#e6e6e8] animate-pulse">
              <Glasses className="w-12 h-12 sm:w-20 sm:h-20 text-[#fc5a06]" strokeWidth={1.75} />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#fc5a06] rounded-full ring-4 ring-white" />
            </div>
            <span className="text-7xl sm:text-9xl font-black tracking-tighter text-[#1e1f24]">
              4
            </span>
          </div>

          {/* Heading and Description */}
          <h1 className="mt-6 text-2xl sm:text-4xl font-extrabold text-[#1e1f24] tracking-tight">
            Looking a Little Blurry?
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[#666872] max-w-xl mx-auto leading-relaxed">
            The page you are looking for might have been moved, renamed, or doesn&apos;t exist.
            Let&apos;s get your vision back on track.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fc5a06] text-white font-semibold hover:bg-[#e94f00] transition-all shadow-md shadow-[#fc5a06]/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
            >
              <Home className="w-4 h-4" />
              <span>Back to Homepage</span>
            </Link>

            <button
              type="button"
              onClick={openBooking}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1e1f24] text-white font-semibold hover:bg-[#24252a] transition-all shadow-md shadow-black/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#fc5a06]" />
              <span>Book Eye Test</span>
            </button>

            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.history.back()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#36363e] font-semibold hover:bg-[#f3f3f4] hover:text-[#1e1f24] border border-[#e6e6e8] transition-all text-sm sm:text-base cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Destination Grid */}
          <div className="mt-14 pt-10 border-t border-[#e6e6e8] text-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#858791] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#fc5a06]" />
                <span>Explore Popular Destinations</span>
              </h2>
              <span className="text-xs text-[#858791]">Darshana Optical</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex flex-col justify-between p-4 rounded-2xl bg-white border border-[#e6e6e8] shadow-xs hover:shadow-md hover:border-[#fc5a06]/40 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#fff0e8] text-[#fc5a06] flex items-center justify-center group-hover:bg-[#fc5a06] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-[#fc5a06] bg-[#fff0e8] px-2 py-0.5 rounded-full border border-[#ffd8c4]">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#1e1f24] group-hover:text-[#fc5a06] transition-colors text-sm">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#666872] leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Need help footer strip */}
          <div className="mt-10 p-5 rounded-2xl bg-[#fff4ee] border border-[#ffd8c4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-[#ffd8c4] flex items-center justify-center text-[#fc5a06] shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-[#1e1f24] text-sm">Need immediate assistance?</h4>
                <p className="text-xs text-[#666872]">
                  Our opticians in Harur are ready to help you find the right frame or eye test.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="tel:+918870571536"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#1e1f24] font-bold text-xs border border-[#ffd8c4] hover:border-[#fc5a06] hover:text-[#fc5a06] transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-[#fc5a06]" />
                <span>+91 88705 71536</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fc5a06] text-white font-bold text-xs hover:bg-[#e94f00] transition-colors shadow-xs"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Visit Store</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal copyright footer */}
      <footer className="w-full py-4 text-center border-t border-[#e6e6e8] bg-white text-xs text-[#858791]">
        <p>&copy; {new Date().getFullYear()} Darshana Optical, Harur. All rights reserved.</p>
      </footer>
    </div>
  );
}
