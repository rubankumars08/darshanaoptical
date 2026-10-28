"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Phone, Mail, CheckCircle2, MessageCircle, MapPin, Sparkles, ArrowLeft } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

const TIME_SLOTS = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
];

const REASONS = [
  "Routine Eye Test",
  "Vision Problem",
  "New Glasses",
  "Prescription Update",
  "Progressive Lens Consultation",
  "Other",
];

export default function DedicatedBookPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [reason, setReason] = useState("Routine Eye Test");
  const [wearsGlasses, setWearsGlasses] = useState("Yes");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          preferred_date: date || null,
          preferred_time: selectedTime,
          test_type: reason,
          wears_glasses: wearsGlasses,
          notes: notes || null,
        }),
      });
      if (!response.ok) throw new Error("Appointment request failed");
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't save your appointment. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const localToday = new Date();
  localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  const todayStr = localToday.toISOString().split("T")[0];

  const handleWhatsAppConfirm = () => {
    const msg = encodeURIComponent(
      `Hello Darshana Optical,\n\nI submitted an appointment request:\n` +
      `*Name:* ${name}\n` +
      `*Phone:* ${phone}\n` +
      `*Preferred Date:* ${date || "As soon as possible"}\n` +
      `*Preferred Time:* ${selectedTime}\n` +
      `*Reason:* ${reason}\n` +
      `*Wears Glasses:* ${wearsGlasses}\n` +
      `*Notes:* ${notes || "None"}\n\n` +
      `Please confirm my slot!`
    );
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent("Eye Test Appointment at Darshana Optical");
    const details = encodeURIComponent(`Eye Test Visit for ${name}. Location: Darshana Optical, Harur.`);
    const location = encodeURIComponent("Darshana Optical, Tvk nagar, salem bypass road, Harur");
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-surface-warm py-12 sm:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          {/* Main Appointment Box */}
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 border border-neutral-200/80 shadow-xl">
            {!submitted ? (
              <div className="space-y-8">
                {/* Form Header */}
                <div className="text-center max-w-xl mx-auto space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={14} /> Priority Appointment Booking
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
                    Book Your Eye Test
                  </h1>
                  <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                    Choose a convenient date and time to request your appointment at Darshana Optical, Harur.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {submitError}
                    </div>
                  )}
                  {/* Your Details */}
                  <div className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                      1. Your Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 88705 71536"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          pattern="[6-9][0-9]{9}"
                          minLength={10}
                          maxLength={10}
                          title="Enter a valid 10-digit Indian mobile number"
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Appointment Slot */}
                  <div className="space-y-4 pt-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                      2. Appointment Date & Time
                    </h2>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        min={todayStr}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full sm:w-1/2 rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-2">
                        Select Preferred Time Slot *
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              selectedTime === slot
                                ? "bg-brand-orange text-white shadow-md"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reason & Preferences */}
                  <div className="space-y-4 pt-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                      3. Visit Reason & History
                    </h2>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Reason for Visit *
                      </label>
                      <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none cursor-pointer"
                      >
                        {REASONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-2">
                        Do you currently wear glasses?
                      </label>
                      <div className="flex gap-4">
                        {["Yes", "No"].map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setWearsGlasses(opt)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              wearsGlasses === opt
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any specific symptoms or requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 px-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submission CTA */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full btn-primary justify-center font-bold text-base py-4 shadow-xl shadow-brand-orange/25 cursor-pointer disabled:cursor-wait disabled:opacity-60"
                    >
                      {submitting ? "Saving appointment..." : "Request Appointment"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Confirmation State with Animated Checkmark */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-6"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
                  <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      d="M20 6L9 17l-5-5"
                    />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold text-neutral-950">
                    Appointment Request Received
                  </h2>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto font-medium leading-relaxed">
                    Thank you, <span className="font-bold text-neutral-950">{name}</span>. Your appointment request for <span className="font-bold text-brand-orange">{date || "upcoming slot"} at {selectedTime}</span> has been received. Our optical team will confirm your selected time.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleAddToCalendar}
                    className="btn-secondary gap-2 text-xs font-bold cursor-pointer"
                  >
                    <Calendar size={16} /> Add to Calendar
                  </button>

                  <a
                    href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary gap-2 text-xs font-bold cursor-pointer"
                  >
                    <MapPin size={16} /> Get Directions
                  </a>

                  <button
                    onClick={handleWhatsAppConfirm}
                    className="btn-primary gap-2 text-xs font-bold cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                  >
                    <MessageCircle size={16} /> WhatsApp Us
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
