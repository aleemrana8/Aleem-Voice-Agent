"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Stethoscope, MapPin, Clock, Calendar, Phone, ArrowRight,
  CheckCircle2, Star, Award, Globe, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })
};

const doctors = [
  {
    id: "DOC001", name: "Dr. Aleem Rehman", role: "Senior Physician & Founder",
    img: "👨‍⚕️", color: "from-blue-500 to-cyan-500",
    locations: ["Islamabad", "Multan"],
    schedule: "Monday – Saturday, 3:00 PM – 12:00 AM",
    bio: "Founder of Aleem Hospital and pioneer of AI-integrated healthcare in Pakistan. Dr. Aleem brings years of clinical experience combined with a vision for technology-driven patient care. Available across both branches.",
    specialties: ["General Medicine", "Preventive Care", "AI-Integrated Diagnostics"],
    education: "MBBS, FCPS — Board Certified",
  },
  {
    id: "DOC002", name: "Dr. Mohsin Khan", role: "General Physician",
    img: "👨‍⚕️", color: "from-violet-500 to-purple-500",
    locations: ["Islamabad"],
    schedule: "Monday – Saturday, 3:00 PM – 12:00 AM",
    bio: "Dedicated general physician at the Islamabad branch specializing in comprehensive patient care and chronic disease management. Works with the AI scheduling system for efficient appointment handling.",
    specialties: ["General Medicine", "Chronic Disease Management", "Patient Wellness"],
    education: "MBBS — General Practice",
  },
  {
    id: "DOC003", name: "Dr. Zain Abbas", role: "General Physician",
    img: "👨‍⚕️", color: "from-emerald-500 to-teal-500",
    locations: ["Multan"],
    schedule: "Monday – Saturday, 3:00 PM – 12:00 AM",
    bio: "General physician leading patient care at the Multan branch. Dr. Zain focuses on preventive care and health screenings, supported by Aleem Hospital's AI-powered scheduling and EHR systems.",
    specialties: ["General Medicine", "Health Screenings", "Preventive Care"],
    education: "MBBS — General Practice",
  },
];

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[180px]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.12] mb-6">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Medical Team</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.95]">
            Our Expert <span className="gradient-text-emerald">Physicians</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-white/35 max-w-2xl mx-auto">
            Three qualified physicians across Islamabad and Multan — supported by AI scheduling, real-time availability, and an intelligent EHR system.
          </motion.p>
        </div>
      </section>

      {/* Doctor Cards */}
      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          {doctors.map((doc, i) => (
            <motion.div key={doc.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
              <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.03] transition-all group">
                {/* Gradient header */}
                <div className={`h-3 bg-gradient-to-r ${doc.color}`} />

                <div className="p-8 grid md:grid-cols-[200px_1fr] gap-8">
                  {/* Profile */}
                  <div className="text-center md:text-left">
                    <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center mx-auto md:mx-0 text-5xl shadow-2xl mb-4`}>
                      {doc.img}
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-1.5 mb-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[11px] text-emerald-400/60">Available</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                      {doc.locations.map((loc) => (
                        <span key={loc} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{doc.name}</h2>
                    <p className="text-sm text-white/40 mb-1">{doc.role}</p>
                    <p className="text-xs text-white/20 mb-4">{doc.education}</p>
                    <p className="text-sm text-white/35 leading-relaxed mb-6">{doc.bio}</p>

                    {/* Specialties */}
                    <div className="mb-6">
                      <p className="text-[10px] text-white/20 uppercase tracking-wider mb-2">Specialties</p>
                      <div className="flex flex-wrap gap-2">
                        {doc.specialties.map((s) => (
                          <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/40">{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
                      <Clock className="w-4 h-4 text-white/20" />
                      <span>{doc.schedule}</span>
                      <span className="text-white/15">• Break 8–9 PM</span>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3">
                      <Link href="/appointment">
                        <Button className={`bg-gradient-to-r ${doc.color} text-white rounded-xl px-6 h-11 font-semibold shadow-lg`}>
                          <Calendar className="w-4 h-4 mr-2" /> Book Appointment
                        </Button>
                      </Link>
                      <Link href="/voice-call">
                        <Button variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white rounded-xl px-6 h-11">
                          <Phone className="w-4 h-4 mr-2" /> Call AI
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

      {/* Quick Info */}
      <section className="py-20 px-6 border-t border-white/[0.03]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Operating Hours", desc: "3:00 PM — 12:00 AM daily. Break 8–9 PM. 30-minute appointment slots.", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: Globe, title: "Two Locations", desc: "Islamabad and Multan branches connected by our unified AI scheduling network.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: Phone, title: "AI Scheduling", desc: "Call our AI voice agent at +92 440-684-8838 or book online — no account needed.", color: "text-violet-400", bg: "bg-violet-500/10" },
            ].map((item, i) => (
              <motion.div key={item.title} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-xl p-6 text-center hover:bg-white/[0.04] transition-all h-full">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-white/25 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
