"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, User, Phone, Mail, Check, Send, Sparkles, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { useBooking } from "./BookingContext";
import { EASE_STANDARD } from "../../lib/motion";

export default function BookingModal() {
  const { isOpen, closeBooking } = useBooking();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [testType, setTestType] = useState("Comprehensive Eye Test");
  const [isSuccess, setIsSuccess] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      setIsSuccess(true);
      // Persist appointment to TiDB MySQL Database
      fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          preferred_date: date || null,
          preferred_time: time,
          test_type: testType,
        }),
      }).catch((err) => console.error("Database save error:", err));

      const message = encodeURIComponent(
        `Hello Darshana Optical,\n\nI would like to book an Eye Test appointment.\n\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        (email ? `*Email:* ${email}\n` : "") +
        `*Test Type:* ${testType}\n` +
        `*Preferred Date:* ${date || "As soon as possible"}\n` +
        `*Preferred Time:* ${time}\n\n` +
        `Please confirm my booking.`
      );
      setTimeout(() => {
        window.open(`https://wa.me/918870571536?text=${message}`, "_blank");
      }, 1500);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setStep(1);
    setName("");
    setPhone("");
    setEmail("");
    setDate("");
    closeBooking();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBooking}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, ease: EASE_STANDARD }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-100 z-10 my-auto"
          >
            {/* Close Button */}
            <button
              onClick={closeBooking}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors cursor-pointer z-10"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {!isSuccess ? (
              <>
                <div className="mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles size={12} /> Easy Online Appointment
                  </span>
                  <h3 className="text-2xl font-extrabold text-neutral-950">Book Your Eye Test</h3>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">
                    Schedule a visit with our certified optometrist at Harur.
                  </p>
                </div>

                {/* Step Progress Indicator */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step >= 1 ? "bg-brand-orange text-white" : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      01
                    </span>
                    <span className="text-xs font-bold text-neutral-700">Details</span>
                  </div>
                  <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? "bg-brand-orange" : "bg-neutral-200"}`} />
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step >= 2 ? "bg-brand-orange text-white" : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      02
                    </span>
                    <span className="text-xs font-bold text-neutral-700">Service</span>
                  </div>
                  <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? "bg-brand-orange" : "bg-neutral-200"}`} />
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        step >= 3 ? "bg-brand-orange text-white" : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      03
                    </span>
                    <span className="text-xs font-bold text-neutral-700">Schedule</span>
                  </div>
                </div>

                <form onSubmit={handleNext}>
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Anand Kumar"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 88705 71536"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              pattern="[6-9][0-9]{9}"
                              minLength={10}
                              maxLength={10}
                              title="Enter a valid 10-digit Indian mobile number"
                              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none transition-all"
                            />
                            <p className="mt-1 text-[11px] text-neutral-400">10-digit mobile number (no spaces)</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Email Address <span className="text-neutral-400 text-[10px] lowercase font-normal">(optional — to receive confirmation)</span>
                          </label>
                          <div className="relative">
                            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="email"
                              placeholder="e.g. yourname@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-4 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!name || !phone}
                          className="w-full mt-4 btn-primary flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20 cursor-pointer disabled:opacity-50"
                        >
                          Continue to Service <ArrowRight size={16} />
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                            Select Service Requirement
                          </label>
                          <div className="space-y-2">
                            {[
                              "Comprehensive Eye Test",
                              "Prescription Update & Check",
                              "Computer Vision Strain Assessment",
                              "Progressive Lens Consultation",
                              "Frame & Lens Fitting",
                            ].map((service) => (
                              <button
                                key={service}
                                type="button"
                                onClick={() => setTestType(service)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                                  testType === service
                                    ? "border-brand-orange bg-brand-orange-soft/40 text-brand-orange shadow-xs"
                                    : "border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100"
                                }`}
                              >
                                <span>{service}</span>
                                {testType === service && <Check size={16} className="text-brand-orange" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20"
                          >
                            Continue to Schedule <ArrowRight size={16} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                              Preferred Date
                            </label>
                            <div className="relative">
                              <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                              <input
                                type="date"
                                value={date}
                                min={todayStr}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-3 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                              Preferred Time
                            </label>
                            <div className="relative">
                              <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                              <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pl-10 pr-3 text-sm text-neutral-900 focus:border-brand-orange focus:bg-white focus:outline-none transition-all cursor-pointer"
                              >
                                <option value="10:00 AM">10:00 AM - 12:00 PM</option>
                                <option value="12:00 PM">12:00 PM - 02:00 PM</option>
                                <option value="03:00 PM">03:00 PM - 05:00 PM</option>
                                <option value="06:00 PM">06:00 PM - 08:00 PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-4 border border-neutral-200/80 text-xs text-neutral-600 space-y-1">
                          <p className="font-bold text-neutral-950">Appointment Summary:</p>
                          <p>{name} • {phone}</p>
                          <p>{testType}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                          >
                            <Send size={16} /> Confirm & Book Via WhatsApp
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </>
            ) : (
              /* Success Screen with Animated SVG Checkmark */
              <div className="py-8 text-center space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-inner">
                  <svg className="h-12 w-12 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: EASE_STANDARD }}
                      d="M20 6L9 17l-5-5"
                    />
                  </svg>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="space-y-2"
                >
                  <h3 className="text-2xl font-extrabold text-neutral-950">Your Eye Test Is Booked!</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto">
                    Connecting to Darshana Optical WhatsApp for slot confirmation.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="pt-4 flex flex-col sm:flex-row justify-center gap-3"
                >
                  <a
                    href="https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-5 py-2.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50"
                  >
                    <MapPin size={14} className="text-brand-orange" /> Get Directions
                  </a>
                  <button onClick={handleReset} className="btn-primary text-xs py-2.5 px-6">
                    Done
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
