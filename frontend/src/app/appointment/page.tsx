"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, User, Phone, FileText, CheckCircle2, ArrowRight,
  ArrowLeft, Sparkles, Stethoscope, MapPin, Loader2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground } from "@/components/public/animated-bg";
import { getPublicDoctors, checkPublicAvailability, createPublicAppointment } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
};

const steps = [
  { label: "Doctor", icon: Stethoscope },
  { label: "Date & Time", icon: Calendar },
  { label: "Details", icon: User },
  { label: "Confirm", icon: CheckCircle2 },
];

interface DoctorOption {
  doctor_id: string;
  name: string;
  specialization: string;
  locations: string[];
}

export default function AppointmentPage() {
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    doctor_id: "",
    doctorName: "",
    date: "",
    time_slot: "",
    patient_name: "",
    patient_phone: "",
    reason: "",
  });

  useEffect(() => {
    getPublicDoctors()
      .then((data) => {
        setDoctors(
          data.map((d: any) => ({
            doctor_id: d.doctor_id,
            name: d.name,
            specialization: d.specialization,
            locations: d.locations || [],
          }))
        );
      })
      .catch(() => setError("Failed to load doctors"))
      .finally(() => setLoadingDoctors(false));
  }, []);

  const loadSlots = useCallback(async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setSlots([]);
    try {
      const data = await checkPublicAvailability(doctorId, date);
      setSlots(data.available_slots || []);
    } catch {
      setError("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (form.doctor_id && form.date) {
      loadSlots(form.doctor_id, form.date);
    }
  }, [form.doctor_id, form.date, loadSlots]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await createPublicAppointment({
        doctor_id: form.doctor_id,
        date: form.date,
        time_slot: form.time_slot,
        patient_name: form.patient_name,
        patient_phone: form.patient_phone,
        reason: form.reason,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!form.doctor_id;
    if (step === 1) return !!form.date && !!form.time_slot;
    if (step === 2) return !!form.patient_name && !!form.patient_phone;
    return true;
  };

  const today = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className="min-h-screen bg-[#060a14] text-white">
        <Navbar />
        <section className="relative pt-32 pb-32 px-6 overflow-hidden">
          <HeroBackground />
          <div className="max-w-lg mx-auto text-center relative z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold mb-3">
              Appointment <span className="gradient-text">Confirmed!</span>
            </motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6 text-left space-y-3 mb-8">
              <div className="flex justify-between text-sm"><span className="text-white/30">Doctor</span><span className="text-white/70">{form.doctorName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/30">Date</span><span className="text-white/70">{form.date}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/30">Time</span><span className="text-white/70">{form.time_slot}</span></div>
              <div className="flex justify-between text-sm"><span className="text-white/30">Patient</span><span className="text-white/70">{form.patient_name}</span></div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-3 justify-center">
              <Button onClick={() => { setSuccess(false); setStep(0); setForm({ doctor_id: "", doctorName: "", date: "", time_slot: "", patient_name: "", patient_phone: "", reason: "" }); }} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-6 h-11 font-semibold">
                Book Another
              </Button>
              <a href="/"><Button variant="outline" className="border-white/[0.1] text-white/60 rounded-xl px-6 h-11">Go Home</Button></a>
            </motion.div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-10 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Book Appointment</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Schedule Your <span className="gradient-text">Visit</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-white/40 max-w-xl mx-auto">
            Book with any doctor in seconds. Real-time availability, instant confirmation.
          </motion.p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="px-6 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i <= step ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" : "bg-white/[0.05] text-white/20 border border-white/[0.08]"}`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-white/70" : "text-white/20"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`w-8 sm:w-16 h-px mx-2 ${i < step ? "bg-gradient-to-r from-blue-500 to-cyan-500" : "bg-white/[0.06]"}`} />}
            </div>
          ))}
        </div>
      </section>

      {/* Form Steps */}
      <section className="px-6 pb-32">
        <div className="max-w-2xl mx-auto">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
              <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">&times;</button>
            </motion.div>
          )}

          <div className="glass-card rounded-2xl p-8 min-h-[340px]">
            <AnimatePresence mode="wait">
              {/* Step 0: Doctor */}
              {step === 0 && (
                <motion.div key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit">
                  <h3 className="text-lg font-bold mb-1">Select a Doctor</h3>
                  <p className="text-sm text-white/30 mb-6">Choose your preferred physician.</p>
                  {loadingDoctors ? (
                    <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
                  ) : (
                    <div className="space-y-3">
                      {doctors.map(d => (
                        <button key={d.doctor_id} onClick={() => setForm(p => ({ ...p, doctor_id: d.doctor_id, doctorName: d.name }))}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${form.doctor_id === d.doctor_id ? "border-blue-500/40 bg-blue-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"}`}>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-2xl shrink-0">👨‍⚕️</div>
                          <div className="flex-1">
                            <div className="font-semibold text-white/80">{d.name}</div>
                            <div className="text-xs text-white/30">{d.specialization}</div>
                          </div>
                          <div className="flex gap-1.5">
                            {d.locations.map(l => (
                              <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" />{l}
                              </span>
                            ))}
                          </div>
                          {form.doctor_id === d.doctor_id && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 1: Date & Time */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit">
                  <h3 className="text-lg font-bold mb-1">Pick Date & Time</h3>
                  <p className="text-sm text-white/30 mb-6">Choose when you&apos;d like to visit.</p>
                  <div className="mb-6">
                    <label className="text-xs text-white/30 font-medium block mb-1.5">Date</label>
                    <input type="date" min={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value, time_slot: "" }))}
                      className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/30 transition-colors [color-scheme:dark]" />
                  </div>
                  {form.date && (
                    <div>
                      <label className="text-xs text-white/30 font-medium block mb-2">Available Slots</label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-blue-400 animate-spin" /></div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-white/25 py-6 text-center">No slots available for this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                          {slots.map(s => (
                            <button key={s} onClick={() => setForm(p => ({ ...p, time_slot: s }))}
                              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${form.time_slot === s ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" : "bg-white/[0.03] border border-white/[0.06] text-white/50 hover:bg-white/[0.06]"}`}>
                              <Clock className="w-3 h-3 inline mr-1" />{s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit">
                  <h3 className="text-lg font-bold mb-1">Your Details</h3>
                  <p className="text-sm text-white/30 mb-6">We need a few details to confirm your booking.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/30 font-medium block mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="text" required value={form.patient_name} onChange={e => setForm(p => ({ ...p, patient_name: e.target.value }))}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors"
                          placeholder="Your full name" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/30 font-medium block mb-1.5">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="tel" required value={form.patient_phone} onChange={e => setForm(p => ({ ...p, patient_phone: e.target.value }))}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors"
                          placeholder="+92 300 ..." />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/30 font-medium block mb-1.5">Reason for Visit (optional)</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                        <textarea rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                          className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors resize-none"
                          placeholder="Describe your symptoms or reason..." />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit">
                  <h3 className="text-lg font-bold mb-1">Review & Confirm</h3>
                  <p className="text-sm text-white/30 mb-6">Please verify your booking details.</p>
                  <div className="space-y-3 mb-8">
                    {[
                      { label: "Doctor", value: form.doctorName, icon: Stethoscope },
                      { label: "Date", value: form.date, icon: Calendar },
                      { label: "Time", value: form.time_slot, icon: Clock },
                      { label: "Patient", value: form.patient_name, icon: User },
                      { label: "Phone", value: form.patient_phone, icon: Phone },
                      ...(form.reason ? [{ label: "Reason", value: form.reason, icon: FileText }] : []),
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <item.icon className="w-4 h-4 text-blue-400/50 shrink-0" />
                        <span className="text-xs text-white/30 w-16 shrink-0">{item.label}</span>
                        <span className="text-sm text-white/70">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.05]">
              <Button onClick={() => setStep(s => s - 1)} disabled={step === 0} variant="outline" className="border-white/[0.08] text-white/50 rounded-xl px-5 h-10 text-sm disabled:opacity-20">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-5 h-10 text-sm font-semibold disabled:opacity-30">
                  Next <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-6 h-10 text-sm font-semibold disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Booking...</> : <><CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Booking</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
