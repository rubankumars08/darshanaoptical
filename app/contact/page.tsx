"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Phone, MessageCircle, Clock, Mail, Send, CalendarCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { FaInstagram } from "react-icons/fa6";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import { useBooking } from "../components/booking/BookingContext";

export default function ContactPage() {
  const { openBooking } = useBooking();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Eye Test");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          interest,
          message: message || null,
        }),
      });
      if (!response.ok) throw new Error("Inquiry request failed");
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't send your enquiry. Check your connection and try again.");
      return;
    } finally {
      setSubmitting(false);
    }

    const formattedMsg = encodeURIComponent(
      `Hello Darshana Optical,\n\nNew Website Inquiry:\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Email:* ${email || "Not provided"}\n` +
      `*Interested In:* ${interest}\n` +
      `*Message:* ${message || "General inquiry"}\n\n` +
      `Please contact me.`
    );

    setTimeout(() => {
      window.location.assign(`https://wa.me/918870571536?text=${formattedMsg}`);
    }, 1000);
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-surface-warm via-white to-white py-16 sm:py-24">
          <div className="container-brand text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <MapPin size={14} /> Store Location & Contact
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight">
              Come Visit Us
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Find your next pair of glasses and get personalised optical guidance at Darshana Optical.
            </p>
          </div>
        </section>

        {/* Quick Contact Cards */}
        <section className="py-12 bg-surface-warm border-y border-neutral-200/80">
          <div className="container-brand">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Call Us */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange mb-4 transition-transform group-hover:scale-110">
                    <Phone size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950">Call Us</h3>
                  <p className="mt-1 text-xs text-neutral-600 font-medium">
                    Questions about eyewear, lenses, testing, or availability?
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <a
                    href="tel:+918870571536"
                    className="btn-primary w-full justify-center text-xs font-bold gap-2"
                  >
                    <Phone size={16} /> Call Now: +91 88705 71536
                  </a>
                </div>
              </motion.div>

              {/* WhatsApp */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4 transition-transform group-hover:scale-110">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950">WhatsApp</h3>
                  <p className="mt-1 text-xs text-neutral-600 font-medium">
                    Send us a quick message for instant store assistance.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <a
                    href="https://wa.me/918870571536"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary border-emerald-600 text-emerald-700 hover:bg-emerald-50 w-full justify-center text-xs font-bold gap-2"
                  >
                    <MessageCircle size={16} /> Chat on WhatsApp
                  </a>
                </div>
              </motion.div>

              {/* Eye Test */}
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4 transition-transform group-hover:scale-110">
                    <CalendarCheck size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950">Eye Test</h3>
                  <p className="mt-1 text-xs text-neutral-600 font-medium">
                    Prefer to plan your visit ahead of time?
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <button
                    onClick={openBooking}
                    className="btn-dark w-full justify-center text-xs font-bold gap-2 cursor-pointer"
                  >
                    <CalendarCheck size={16} /> Book Appointment
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Store Info & Map + Form Grid */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container-brand grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Store Information & Map */}
            <div className="lg:col-span-6 space-y-8">
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-950">Darshana Optical Store Information</h2>
                <p className="mt-1 text-xs text-neutral-500 font-medium">
                  Verified address and opening hours for our main store location in Harur.
                </p>
              </div>

              <div className="space-y-4 rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80 text-sm">
                <div className="flex items-start gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                  >
                    <MapPin size={20} className="text-brand-orange mt-0.5 shrink-0" />
                  </motion.div>
                  <div>
                    <div className="font-bold text-neutral-950">Verified Address</div>
                    <div className="text-neutral-600 text-xs">Tvk nagar, salem bypass road, Vasanth & co opposite, Harur - 636903</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-neutral-200/60">
                  <Phone size={20} className="text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-neutral-950">Verified Phone</div>
                    <div className="text-neutral-600 text-xs">+91 88705 71536</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-neutral-200/60">
                  <Clock size={20} className="text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-neutral-950">Verified Opening Hours</div>
                    <div className="text-neutral-600 text-xs">Mon – Sat: 9:30 AM – 8:30 PM</div>
                    <div className="text-neutral-600 text-xs">Sunday: 10:00 AM – 2:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-neutral-200/60">
                  <FaInstagram size={20} className="text-brand-orange mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-neutral-950">Follow on Instagram</div>
                    <a
                      href="https://www.instagram.com/darshanaoptical3108/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-orange hover:underline text-xs font-semibold"
                    >
                      @darshanaoptical3108
                    </a>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="relative aspect-16/10 overflow-hidden rounded-2xl border border-neutral-200 shadow-md">
                <iframe
                  title="Darshana Optical Google Map Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.886!2d78.47462!3d12.0559335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bac65dd021a596d%3A0xf21d8bcfdefaeddb!2sDarshana%20Optical!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
                  className="h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div>
                <a
                  href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary gap-2 w-full justify-center font-bold"
                >
                  <MapPin size={18} /> Get Directions on Google Maps
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-neutral-50 p-8 border border-neutral-200/80 shadow-lg">
                {!submitted ? (
                  <>
                    <h2 className="text-2xl font-extrabold text-neutral-950 mb-2">Send an Enquiry</h2>
                    <p className="text-xs text-neutral-600 mb-6 font-medium">
                      Fill out your details and our optometrist team will assist you promptly.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {submitError && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                          {submitError}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 88705 71536"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="darshanado@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          I&apos;m interested in *
                        </label>
                        <select
                          value={interest}
                          onChange={(e) => setInterest(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:outline-none cursor-pointer"
                        >
                          <option value="Eye Test">Eye Test</option>
                          <option value="Frames">Frames</option>
                          <option value="Lenses">Lenses</option>
                          <option value="Progressive Lenses">Progressive Lenses</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                          Message
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Tell us what you are looking for..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full btn-primary justify-center font-bold gap-2 text-base shadow-lg shadow-brand-orange/20 cursor-pointer disabled:cursor-wait disabled:opacity-60"
                      >
                        <Send size={18} /> {submitting ? "Sending..." : "Send Enquiry"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-950">Enquiry Sent!</h3>
                    <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                      Thank you for contacting Darshana Optical. Connecting to WhatsApp...
                    </p>
                  </div>
                )}
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
