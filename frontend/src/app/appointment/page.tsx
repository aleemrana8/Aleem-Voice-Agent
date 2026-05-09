"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Calendar, Clock, Phone, ArrowRight, ArrowLeft,
  CheckCircle2, Stethoscope, MapPin, Loader2, AlertCircle, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { checkPublicAvailability, createPublicAppointment } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};

const doctors = [
  { id: "DOC001", name: "Dr. Aleem Rehman", specialization: "Senior Physician", locations: ["Islamabad", "Multan"], color: "from-blue-500 to-cyan-500" },
  { id: "DOC002", name: "Dr. Mohsin Khan", specialization: "General Physician", locations: ["Islamabad"], color: "from-violet-500 to-purple-500" },
  { id: "DOC003", name: "Dr. Zain Abbas", specialization: "General Physician", locations: ["Multan"], color: "from-emerald-500 to-teal-500" },
];

const steps = ["Doctor", "Date & Time", "Details", "Confirm"];

export default function AppointmentPage() {
  const [step, setStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");

  const doctor = doctors.find(d => d.id === selectedDoctor);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot("");
      setError("");
      checkPublicAvailability(selectedDoctor, selectedDate)
        .then((data) => { setSlots(data.available_slots || []); setLoadingSlots(false); })
        .catch(() => { setError("Could not load availability."); setLoadingSlots(false); });
    }
  }, [selectedDoctor, selectedDate]);

  const canProceed = () => {
    switch (step) {
      case 0: return selectedDoctor && selectedLocation;
      case 1: return selectedDate && selectedSlot;
      case 2: return patientName.trim() && patientPhone.trim();
      case 3: return true;
      default: return false;
    }
  };

  const handleBook = async () => {
    setBooking(true);
    setError("");
    try {
      await createPublicAppointment({ doctor_id: selectedDoctor, date: selectedDate, time_slot: selectedSlot, patient_name: patientName, patient_phone: patientPhone, reason: reason || undefined });
      setBooked(true);
    } catch (err: any) {
      setError(err.message || "Booking failed.");
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-[#060a14] text-white">
        <Navbar />
        <section className="pt-40 pb-32 px-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Appointment Booked!</h1>
            <p className="text-white/35 mb-6">Your appointment has been successfully scheduled.</p>
            <div className="glass-card rounded-xl p-6 text-left space-y-3 mb-8">
              {[
                ["Doctor", doctor?.name], ["Location", selectedLocation], ["Date", selectedDate],
                ["Time", selectedSlot], ["Patient", patientName], ["Phone", patientPhone],
                ...(reason ? [["Reason", reason]] : []),
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between text-sm border-b border-white/[0.03] pb-2 last:border-0 last:pb-0">
                  <span className="text-white/30">{k}</span><span className="text-white/60">{v}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => { setBooked(false); setStep(0); setSelectedDoctor(""); setSelectedDate(""); setSelectedSlot(""); setPatientName(""); setPatientPhone(""); setReason(""); }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8 h-11">
              Book Another Appointment
            </Button>
          </motion.div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-10 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[180px]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.12] mb-6">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Book Appointment</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 leading-[0.95]">
            Schedule Your <span className="gradient-text">Visit</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-white/35 max-w-lg mx-auto">
            Book an appointment in minutes — no account needed. Choose your doctor, date, and time slot.
          </motion.p>
        </div>
      </section>

      {/* Progress */}
      <section className="px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : i === step ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/[0.04] text-white/25"
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:inline ${i === step ? "text-white/60" : "text-white/20"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-px mx-1 ${i < step ? "bg-emerald-500/40" : "bg-white/[0.04]"}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Steps */}
      <section className="px-6 pb-32">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
                {doctors.map((doc) => (
                  <button key={doc.id} onClick={() => { setSelectedDoctor(doc.id); setSelectedLocation(doc.locations[0]); }}
                    className={`w-full text-left glass-card rounded-xl p-5 transition-all hover:bg-white/[0.04] ${selectedDoctor === doc.id ? "ring-1 ring-blue-500/40 bg-blue-500/[0.04]" : ""}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${doc.color} flex items-center justify-center shadow-lg`}>
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white/70">{doc.name}</p>
                        <p className="text-xs text-white/25">{doc.specialization}</p>
                        <div className="flex gap-2 mt-1.5">
                          {doc.locations.map(l => (
                            <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/25">{l}</span>
                          ))}
                        </div>
                      </div>
                      {selectedDoctor === doc.id && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </div>
                  </button>
                ))}
                {doctor && doctor.locations.length > 1 && (
                  <div className="mt-4">
                    <label className="text-[10px] text-white/20 uppercase tracking-wider mb-2 block">Select Location</label>
                    <div className="flex gap-3">
                      {doctor.locations.map(l => (
                        <button key={l} onClick={() => setSelectedLocation(l)}
                          className={`flex-1 glass-card rounded-xl p-3 text-center text-sm transition-all ${selectedLocation === l ? "ring-1 ring-blue-500/40 bg-blue-500/[0.04] text-white/70" : "text-white/25 hover:bg-white/[0.04]"}`}>
                          <MapPin className="w-4 h-4 mx-auto mb-1" />{l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <h2 className="text-xl font-semibold">Select Date & Time</h2>
                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-wider mb-2 block">Date</label>
                  <input type="date" min={today} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/30 [color-scheme:dark] transition" />
                </div>
                {selectedDate && (
                  <div>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider mb-2 block">Available Slots</label>
                    {loadingSlots ? (
                      <div className="flex items-center gap-2 text-white/25 py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading availability...</div>
                    ) : slots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map(slot => (
                          <button key={slot} onClick={() => setSelectedSlot(slot)}
                            className={`rounded-xl p-3 text-sm text-center transition-all ${selectedSlot === slot ? "bg-blue-500/20 ring-1 ring-blue-500/40 text-blue-300" : "bg-white/[0.03] text-white/35 hover:bg-white/[0.06] border border-white/[0.04]"}`}>
                            <Clock className="w-3.5 h-3.5 mx-auto mb-1" />{slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-white/20 py-8 text-sm">No slots available. Try another date.</div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-semibold">Your Details</h2>
                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                  <input type="text" required value={patientName} onChange={e => setPatientName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Phone Number *</label>
                  <input type="tel" required value={patientPhone} onChange={e => setPatientPhone(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition" placeholder="+92 300 0000000" />
                </div>
                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Reason (Optional)</label>
                  <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition resize-none" placeholder="Brief description..." />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-xl font-semibold">Review & Confirm</h2>
                <div className="glass-card rounded-xl p-6 space-y-4">
                  {[
                    ["Doctor", doctor?.name], ["Location", selectedLocation], ["Date", selectedDate],
                    ["Time Slot", selectedSlot], ["Patient", patientName], ["Phone", patientPhone],
                    ...(reason ? [["Reason", reason]] : []),
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between text-sm border-b border-white/[0.03] pb-3 last:border-0 last:pb-0">
                      <span className="text-white/30">{k}</span><span className="text-white/60 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/[0.06] rounded-xl p-3 border border-red-500/10">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && step !== 3 && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/[0.06] rounded-xl p-3 border border-red-500/10">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="border-white/[0.06] text-white/40 rounded-full px-6 h-11">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-6 h-11 font-semibold shadow-lg shadow-blue-500/20">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleBook} disabled={booking}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-8 h-11 font-semibold shadow-lg shadow-emerald-500/20">
                {booking ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Booking...</> : <>Confirm Booking <CheckCircle2 className="w-4 h-4 ml-2" /></>}
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
