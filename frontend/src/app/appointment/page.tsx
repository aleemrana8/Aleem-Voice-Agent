"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Calendar, Clock, Stethoscope, MapPin, CheckCircle2, ArrowRight, Phone, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const doctorsList = [
  { id: "DOC001", name: "Dr. Aleem", locations: ["Islamabad", "Multan"] },
  { id: "DOC002", name: "Dr. Mohsin", locations: ["Islamabad"] },
  { id: "DOC003", name: "Dr. Zain", locations: ["Multan"] },
];

const timeSlots = [
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
];

export default function AppointmentPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", phone: "", dob: "", location: "", doctor: "", date: "", time: "", reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState(doctorsList);

  useEffect(() => {
    if (form.location) {
      setFilteredDoctors(doctorsList.filter((d) => d.locations.includes(form.location)));
    } else {
      setFilteredDoctors(doctorsList);
    }
  }, [form.location]);

  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const today = new Date().toISOString().split("T")[0];

  const inputClass = "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50";
  const selectClass = "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50";

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">AI Appointment Booking</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Book Your <span className="gradient-text">Appointment</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Choose your doctor, pick a time, and confirm — no account needed. Or call our AI for voice booking.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-12 text-center glow-blue">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Appointment Requested!</h2>
              <p className="text-white/40 mb-6 max-w-md mx-auto">
                Your appointment request for <strong className="text-white/70">{form.doctor}</strong> on{" "}
                <strong className="text-white/70">{form.date}</strong> at{" "}
                <strong className="text-white/70">{formatTime(form.time)}</strong> in{" "}
                <strong className="text-white/70">{form.location}</strong> has been submitted.
              </p>
              <p className="text-sm text-white/25 mb-8">
                Our AI system will confirm your appointment shortly. You can also call our AI assistant for instant confirmation.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => { setSubmitted(false); setStep(1); setForm({ name: "", phone: "", dob: "", location: "", doctor: "", date: "", time: "", reason: "" }); }} variant="outline" className="border-white/[0.08] text-white/50 rounded-xl">
                  Book Another
                </Button>
                <Link href="/voice-call">
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl">
                    <Phone className="w-4 h-4 mr-2" /> Call AI to Confirm
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-10">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" : "bg-white/[0.06] text-white/30"}`}>
                      {s}
                    </div>
                    {s < 3 && <div className={`w-12 h-0.5 rounded transition-all ${step > s ? "bg-blue-500/50" : "bg-white/[0.06]"}`} />}
                  </div>
                ))}
              </div>

              <div className="glass rounded-2xl p-8">
                {/* Step 1: Patient Info */}
                {step === 1 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Patient Information</h3>
                    <p className="text-sm text-white/30 mb-6">No account needed — just provide your basic info.</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/50 text-xs uppercase tracking-wider">Full Name *</Label>
                          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} placeholder="Muhammad Aleem" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/50 text-xs uppercase tracking-wider">Phone *</Label>
                          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className={inputClass} placeholder="+92 300-1234567" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Date of Birth</Label>
                        <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={inputClass} />
                      </div>
                      <Button onClick={() => { if (form.name && form.phone) setStep(2); }} disabled={!form.name || !form.phone}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-11 font-semibold disabled:opacity-30">
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Doctor & Location */}
                {step === 2 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Choose Doctor & Location</h3>
                    <p className="text-sm text-white/30 mb-6">Select your preferred branch and doctor.</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Location *</Label>
                        <select className={selectClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value, doctor: "" })}>
                          <option value="">Select location</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Multan">Multan</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Doctor *</Label>
                        <div className="space-y-2">
                          {filteredDoctors.map((doc) => (
                            <button key={doc.id} onClick={() => setForm({ ...form, doctor: doc.name })}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${form.doctor === doc.name ? "bg-blue-500/10 border-blue-500/30" : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"}`}>
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-xl">👨‍⚕️</div>
                              <div>
                                <p className="text-sm font-medium text-white/70">{doc.name}</p>
                                <p className="text-[11px] text-white/30">General Medicine · {doc.locations.join(", ")}</p>
                              </div>
                              {form.doctor === doc.name && <CheckCircle2 className="w-5 h-5 text-blue-400 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={() => setStep(1)} variant="outline" className="border-white/[0.08] text-white/50 rounded-xl h-11 flex-1">Back</Button>
                        <Button onClick={() => { if (form.location && form.doctor) setStep(3); }} disabled={!form.location || !form.doctor}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-11 font-semibold flex-1 disabled:opacity-30">
                          Continue <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Date & Time */}
                {step === 3 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Select Date & Time</h3>
                    <p className="text-sm text-white/30 mb-6">Pick your preferred appointment slot. Hours: 3 PM - 12 AM (Break: 8-9 PM).</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Date *</Label>
                        <Input type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
                      </div>
                      {form.date && (
                        <div className="space-y-2">
                          <Label className="text-white/50 text-xs uppercase tracking-wider">Time Slot *</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((slot) => (
                              <button key={slot} onClick={() => setForm({ ...form, time: slot })}
                                className={`py-2.5 rounded-lg text-[12px] font-medium transition-all ${form.time === slot ? "bg-blue-500/20 border-blue-500/40 text-blue-300 border" : "bg-white/[0.03] border border-white/[0.06] text-white/40 hover:bg-white/[0.06]"}`}>
                                {formatTime(slot)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Reason for Visit</Label>
                        <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className={inputClass} placeholder="General checkup, follow-up..." />
                      </div>

                      {/* Summary */}
                      {form.date && form.time && (
                        <div className="rounded-xl bg-blue-500/[0.05] border border-blue-500/10 p-4">
                          <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400" /> Appointment Summary
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-white/40"><User className="w-3.5 h-3.5" /> {form.name}</div>
                            <div className="flex items-center gap-2 text-white/40"><Stethoscope className="w-3.5 h-3.5" /> {form.doctor}</div>
                            <div className="flex items-center gap-2 text-white/40"><MapPin className="w-3.5 h-3.5" /> {form.location}</div>
                            <div className="flex items-center gap-2 text-white/40"><Calendar className="w-3.5 h-3.5" /> {form.date}</div>
                            <div className="flex items-center gap-2 text-white/40"><Clock className="w-3.5 h-3.5" /> {formatTime(form.time)}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button onClick={() => setStep(2)} variant="outline" className="border-white/[0.08] text-white/50 rounded-xl h-11 flex-1">Back</Button>
                        <Button onClick={handleSubmit} disabled={!form.date || !form.time}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl h-11 font-semibold flex-1 disabled:opacity-30">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Booking
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Alternative */}
              <div className="text-center mt-8">
                <p className="text-sm text-white/20 mb-3">Prefer voice booking?</p>
                <Link href="/voice-call">
                  <Button variant="outline" className="rounded-full border-white/[0.08] text-white/40 hover:text-white px-6">
                    <Phone className="w-4 h-4 mr-2" /> Call AI Assistant Instead
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
