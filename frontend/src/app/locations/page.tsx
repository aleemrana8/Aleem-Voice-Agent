"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin, Phone, Clock, Users, Calendar, CheckCircle2,
  Sparkles, ArrowRight, Building2, Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground, GradientOrbs } from "@/components/public/animated-bg";
import { CountUp } from "@/components/public/animations";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const locations = [
  {
    city: "Islamabad",
    address: "F-8/3, Jinnah Avenue, Islamabad",
    phone: "+92 440-684-8838",
    color: "from-blue-500 to-cyan-500",
    bg: "from-blue-500/10 to-cyan-500/10",
    doctors: [
      { name: "Dr. Aleem Rehman", id: "DOC001", role: "Senior Physician & Founder" },
      { name: "Dr. Mohsin Khan", id: "DOC002", role: "General Physician" },
    ],
    features: ["AI Voice Reception", "EHR System", "Real-time Scheduling", "Walk-in Support"],
    hours: { open: "3:00 PM", close: "12:00 AM", break: "8:00 - 9:00 PM" },
    stats: { doctors: 2, dailyPatients: 45, satisfaction: 97 },
  },
  {
    city: "Multan",
    address: "Bosan Road, Near Chowk Kumharanwala, Multan",
    phone: "+92 440-684-8838",
    color: "from-emerald-500 to-teal-500",
    bg: "from-emerald-500/10 to-teal-500/10",
    doctors: [
      { name: "Dr. Aleem Rehman", id: "DOC001", role: "Senior Physician & Founder" },
      { name: "Dr. Zain Abbas", id: "DOC003", role: "General Physician" },
    ],
    features: ["AI Voice Reception", "EHR System", "Real-time Scheduling", "Pharmacy Support"],
    hours: { open: "3:00 PM", close: "12:00 AM", break: "8:00 - 9:00 PM" },
    stats: { doctors: 2, dailyPatients: 38, satisfaction: 96 },
  },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Our Locations</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Visit Us in <span className="gradient-text">Two Cities</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            AI-powered healthcare available across Islamabad and Multan. Same technology, same quality, two convenient locations.
          </motion.p>
        </div>
      </section>

      {/* Location Cards */}
      <section className="relative py-10 px-6 pb-32">
        <GradientOrbs />
        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {locations.map((loc, i) => (
            <motion.div key={loc.city} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass-card rounded-2xl overflow-hidden">
                {/* Header bar */}
                <div className={`bg-gradient-to-r ${loc.color} px-8 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-white" />
                    <h2 className="text-xl font-bold text-white">{loc.city} Branch</h2>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative"><div className="w-2 h-2 bg-white rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping opacity-40" /></div>
                    <span className="text-xs text-white/80 font-medium">Open Now</span>
                  </div>
                </div>

                <div className="p-8">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { label: "Doctors", value: loc.stats.doctors, icon: Stethoscope },
                      { label: "Daily Patients", value: loc.stats.dailyPatients, suffix: "+", icon: Users },
                      { label: "Satisfaction", value: loc.stats.satisfaction, suffix: "%", icon: CheckCircle2 },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <div className="text-2xl font-bold gradient-text"><CountUp end={stat.value} suffix={stat.suffix || ""} /></div>
                        <div className="text-[11px] text-white/30 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Address</h4>
                        <p className="text-sm text-white/50">{loc.address}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Hours</h4>
                        <div className="space-y-1 text-sm text-white/50">
                          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-blue-400/50" /> {loc.hours.open} — {loc.hours.close}</div>
                          <div className="flex items-center gap-2 text-white/30"><Clock className="w-3.5 h-3.5 text-white/20" /> Break: {loc.hours.break}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Contact</h4>
                        <a href={`tel:${loc.phone}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors">
                          <Phone className="w-3.5 h-3.5 text-emerald-400/50" />{loc.phone}
                        </a>
                      </div>
                    </div>

                    {/* Doctors & Features */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Doctors</h4>
                        <div className="space-y-2">
                          {loc.doctors.map(d => (
                            <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-sm">👨‍⚕️</div>
                              <div>
                                <div className="text-sm font-medium text-white/70">{d.name}</div>
                                <div className="text-[10px] text-white/25">{d.role}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2">Features</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          {loc.features.map(f => (
                            <div key={f} className="flex items-center gap-1.5 text-xs text-white/35">
                              <Sparkles className="w-3 h-3 text-blue-400/40 shrink-0" />{f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-8 pt-6 border-t border-white/[0.05]">
                    <Link href="/appointment">
                      <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-5 h-10 text-sm font-semibold">
                        <Calendar className="w-4 h-4 mr-1.5" /> Book at {loc.city}
                      </Button>
                    </Link>
                    <Link href="/doctors">
                      <Button variant="outline" className="border-white/[0.08] text-white/60 rounded-xl px-5 h-10 text-sm">View Doctors <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Button>
                    </Link>
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
