"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { CalendarCheck, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Button from "../ui/Button";
import ScrollProgress from "../motion/ScrollProgress";
import { useBooking } from "../booking/BookingContext";

// ─── Single source of truth for all nav links ─────────────────────────────────
// activeMatch: extra pathnames that should also highlight this link
const NAV_LINKS: { href: string; label: string; activeMatch?: string[] }[] = [
  { href: "/", label: "Home" },
  { href: "/eye-testing", label: "Eye Testing" },
  { href: "/frames", label: "Frames" },
  { href: "/lenses", label: "Lenses" },
  { href: "/progressive-lenses", label: "Progressive", activeMatch: ["/progressive"] },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

function isLinkActive(pathname: string, href: string, activeMatch?: string[]) {
  if (pathname === href) return true;
  return activeMatch?.some((p) => pathname === p) ?? false;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const { openBooking } = useBooking();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled((prev) => {
      if (!prev && latest > 72) return true;
      if (prev && latest < 40) return false;
      return prev;
    });
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-default [overflow-anchor:none] ${
        scrolled
          ? "border-border-default bg-white/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white"
      }`}
    >
      {/* Top bar — collapses on scroll */}
      <motion.div
        animate={{ height: scrolled ? 0 : 32 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="hidden overflow-hidden md:block"
      >
        <TopBar />
      </motion.div>

      <div className="container-brand relative flex items-center justify-between">
        <motion.div
          animate={{ height: scrolled ? 60 : 72 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full items-center justify-between"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.img
              initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              src="/logo.png"
              alt="Darshana Optical Logo"
              width={180}
              height={48}
              decoding="async"
              className="h-10 sm:h-12 w-auto object-contain transition-all duration-300"
            />
          </Link>

          {/* Desktop Nav — auto-generated from NAV_LINKS */}
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map(({ href, label, activeMatch }) => {
              const active = isLinkActive(pathname, href, activeMatch);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                    active ? "text-brand-orange font-bold" : "text-neutral-700"
                  }`}
                >
                  {label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                      active
                        ? "w-full scale-x-100"
                        : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <button
            onClick={openBooking}
            className="hidden md:inline-flex items-center justify-center rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-brand-orange-hover shadow-sm cursor-pointer"
          >
            Book Eye Test
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-900 lg:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu — same NAV_LINKS data */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-neutral-100 bg-white lg:hidden"
          >
            <nav className="container-brand flex flex-col py-4">
              {NAV_LINKS.map(({ href, label, activeMatch }) => {
                const active = isLinkActive(pathname, href, activeMatch);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-lg px-2 py-3 text-base font-semibold transition-colors ${
                      active
                        ? "text-brand-orange"
                        : "text-neutral-800 hover:text-brand-orange"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}

              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
                variant="primary"
                icon={CalendarCheck}
                className="mt-4 w-full"
              >
                Book Eye Test
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollProgress />
    </header>
  );
}
