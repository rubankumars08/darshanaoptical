"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa6";
import { useBooking } from "../booking/BookingContext";

export default function Footer() {
  const { openBooking } = useBooking();

  return (
    <footer id="contact" className="bg-[#141517] text-neutral-400 text-xs">
      <div className="container-brand grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Darshana Optical Logo"
              width={150}
              height={36}
              loading="lazy"
              decoding="async"
              className="h-9 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-[200px]">
            Quality eye care. Stylish eyewear. Better vision for a better life.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://wa.me/918870571536"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-[#25D366] hover:text-white transition-colors"
            >
              <FaWhatsapp size={14} />
            </a>
            <a
              href="https://www.instagram.com/darshanaoptical3108/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram @darshanaoptical3108"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 hover:bg-linear-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-colors"
            >
              <FaInstagram size={14} />
            </a>
          </div>
        </div>

        {/* Col 2: Explore */}
        <div>
          <h4 className="mb-3 text-xs font-bold text-white uppercase tracking-wider">
            Explore
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/eye-testing" className="hover:text-brand-orange transition-colors">Eye Testing</Link></li>
            <li><Link href="/frames" className="hover:text-brand-orange transition-colors">Frames</Link></li>
            <li><Link href="/lenses" className="hover:text-brand-orange transition-colors">Lenses</Link></li>
            <li><Link href="/progressive-lenses" className="hover:text-brand-orange transition-colors">Progressive Lenses</Link></li>
            <li><Link href="/offers" className="hover:text-brand-orange transition-colors">Offers</Link></li>
          </ul>
        </div>

        {/* Col 3: Quick Links */}
        <div>
          <h4 className="mb-3 text-xs font-bold text-white uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/book-eye-test" className="hover:text-brand-orange transition-colors">Book Eye Test</Link></li>
            <li><Link href="/frame-finder" className="hover:text-brand-orange transition-colors">Smart Frame Finder</Link></li>
            <li><Link href="/lens-finder" className="hover:text-brand-orange transition-colors">Smart Lens Finder</Link></li>
            <li><Link href="/gallery" className="hover:text-brand-orange transition-colors">Gallery</Link></li>
            <li><Link href="/contact" className="hover:text-brand-orange transition-colors">Store Location</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact Us */}
        <div>
          <h4 className="mb-3 text-xs font-bold text-white uppercase tracking-wider">
            Contact Us
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li className="flex items-center gap-2">
              <Phone size={13} className="text-neutral-400 shrink-0" />
              <a href="tel:+918870571536" className="hover:text-brand-orange">+91 88705 71536</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={13} className="text-neutral-400 shrink-0" />
              <a href="mailto:darshanado@gmail.com" className="hover:text-brand-orange">darshanado@gmail.com</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={13} className="text-neutral-400 shrink-0 mt-0.5" />
              <span>Tvk nagar, salem bypass road, Vasanth & co opposite, Harur - 636903</span>
            </li>
          </ul>
        </div>

        {/* Col 5: Opening Hours */}
        <div>
          <h4 className="mb-3 text-xs font-bold text-white uppercase tracking-wider">
            Opening Hours
          </h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li className="flex items-center gap-2">
              <Clock size={13} className="text-neutral-400 shrink-0" />
              <span>Mon - Sat : 9:30 AM - 8:30 PM</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock size={13} className="text-neutral-400 shrink-0" />
              <span>Sunday : 10:00 AM - 2:00 PM</span>
            </li>
            <li className="pt-1 text-brand-orange font-bold">
              We are open all 7 days!
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="container-brand flex flex-col items-center justify-between gap-3 py-4 text-[11px] text-neutral-500 sm:flex-row">
          <span>© {new Date().getFullYear()} Darshana Optical. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-brand-orange">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-brand-orange">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
