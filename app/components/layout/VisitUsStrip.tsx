"use client";

import { MapPin, Phone, MessageSquare, Clock, ArrowRight } from "lucide-react";

export default function VisitUsStrip() {
  return (
    <section className="bg-white py-8 border-t border-neutral-100">
      <div className="container-brand">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Title */}
            <div className="md:col-span-3 space-y-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950">
                Visit Us
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-normal">
                We&apos;re here to help you see better.
              </p>
            </div>

            {/* Middle Info Columns */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 text-xs">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900">Darshana Optical</div>
                  <div className="text-neutral-500 text-[11px] leading-tight mt-0.5">
                    Tvk nagar, salem bypass road, Vasanth & co opposite, Harur - 636903
                  </div>
                </div>
              </div>

              {/* Call */}
              <div className="flex items-start gap-2.5">
                <Phone size={16} className="text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900">+91 88705 71536</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">Call Us</div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-2.5">
                <MessageSquare size={16} className="text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900">WhatsApp Us</div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">Chat with us</div>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-neutral-900 leading-tight">
                    Mon - Sat : 9:30 AM - 8:30 PM
                  </div>
                  <div className="text-neutral-500 text-[11px] mt-0.5">
                    Sunday : 10:00 AM - 2:00 PM
                  </div>
                </div>
              </div>
            </div>

            {/* Right Action */}
            <div className="md:col-span-2 flex justify-start md:justify-end">
              <a
                href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-brand-orange bg-white px-4 py-2.5 text-xs font-bold text-brand-orange hover:bg-orange-50 transition-colors shadow-xs"
              >
                <span>Get Directions</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
