"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope, MapPin, Calendar, Phone, Clock, ArrowRight,
  CheckCircle2, Sparkles, Award, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground } from "@/components/public/animated-bg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const doctors = [
  {
    id: "DOC001", name: "Dr. Aleem Rehman", role: "Senior Physician & Founder",
    specialization: "General Medicine", locations: ["Islamabad", "Multan"],
    color: "from-blue-500 to-cyan-500",
    bio: "Founding physician of Aleem Hospital with extensive experience in general medicine. Available at both Islamabad and Multan branches.",
    specialties: ["General Medicine", "Internal Medicine", "Preventive Care", "Chronic Disease Management"],
    schedule: "Mon-Sat • 3:00 PM - 12:00 AM",
  },
  {
    id: "DOC002", name: "Dr. Mohsin Khan", role: "General Physician",
    specialization: "General Medicine", locations: ["Islamabad"],
    color: "from-violet-500 to-purple-500",
    bio: "Skilled general physician based at the Islamabad branch, specializing in patient care and health screenings.",
    specialties: ["General Medicine", "Health Screenings", "Family Medicine", "Wellness Consultations"],
    schedule: "Mon-Sat • 3:00 PM - 12:00 AM",
  },
  {
    id: "DOC003", name: "Dr. Zain Abbas", role: "General Physician",
    specialization: "General Medicine", locations: ["Multan"],
    color: "from-emerald-500 to-teal-500",
    bio: "Dedicated physician at the Multan branch, focused on providing quality healthcare and patient education.",
    specialties: ["General Medicine", "Patient Education", "Primary Care", "Preventive Medicine"],
    schedule: "Mon-Sat • 3:00 PM - 12:00 AM",
  },
];

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Our Medical Team</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Meet Our <span className="gradient-text">Doctors</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Qualified physicians across Islamabad and Multan, supported by AI-powered scheduling and voice assistance.
          </motion.p>
        </div>
      </section>

      {/* Doctor Cards */}
      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          {doctors.map((doc, i) => (
            <motion.div key={doc.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all group">
                <div className="grid md:grid-cols-3 gap-0">
                  {/* Profile side */}
                  <div className={`bg-gradient-to-br ${doc.color} p-8 flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                    <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }} className="relative">
                      <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-5xl mb-4 border-2 border-white/20">👨‍⚕️</div>
                    </motion.div>
                    <h3 className="text-xl font-bold text-white">{doc.name}</h3>
                    <p className="text-white/70 text-sm mt-1">{doc.role}</p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="relative"><div className="w-2 h-2 bg-emerald-300 rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-emerald-300 rounded-full animate-ping opacity-50" /></div>
                      <span className="text-[11px] text-emerald-200 font-medium">Available Now</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {doc.locations.map(l => (
                        <span key={l} className="text-[10px] px-2.5 py-1 rounded-full bg-white/15 text-white/80 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3" />{l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 p-8">
                    <p className="text-white/40 leading-relaxed mb-6">{doc.bio}</p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Specialties</h4>
                        <div className="space-y-1.5">
                          {doc.specialties.map(s => (
                            <div key={s} className="flex items-center gap-2 text-sm text-white/50">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />{s}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Schedule</h4>
                        <div className="space-y-2 text-sm text-white/50">
                          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-blue-400/60" />{doc.schedule}</div>
                          <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-400/60" />30-minute slots</div>
                          <div className="flex items-center gap-2 text-white/30"><Clock className="w-3.5 h-3.5" />Break: 8 - 9 PM</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/appointment">
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-5 h-10 text-sm font-semibold">
                          <Calendar className="w-4 h-4 mr-1.5" /> Book Appointment
                        </Button>
                      </Link>
                      <Link href="/voice-call">
                        <Button variant="outline" className="border-white/[0.08] text-white/60 rounded-xl px-5 h-10 text-sm">
                          <Phone className="w-4 h-4 mr-1.5" /> Call AI
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
