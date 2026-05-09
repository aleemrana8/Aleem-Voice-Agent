"use client";

import { motion } from "framer-motion";
import {
  MapPin, Clock, Phone, Users, Building2, Calendar,
  ArrowRight, Navigation, Stethoscope, CheckCircle2, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })
};

const locations = [
  {
    city: "Islamabad", address: "F-8/1 Markaz, Islamabad, Pakistan",
    phone: "+92 440-684-8838", color: "from-blue-500 to-cyan-500", badge: "Main Branch",
    doctors: [
      { name: "Dr. Aleem Rehman", specialization: "Senior Physician", id: "DOC001" },
      { name: "Dr. Mohsin Khan", specialization: "General Physician", id: "DOC002" },
    ],
    schedule: { days: "Monday — Saturday", hours: "3:00 PM — 12:00 AM", break: "8:00 PM — 9:00 PM (Break)", slotDuration: "30 minutes" },
    features: ["AI Voice Receptionist", "Walk-in Accepted", "Online Booking", "EHR System"],
  },
  {
    city: "Multan", address: "Bosan Road, Multan, Pakistan",
    phone: "+92 440-684-8838", color: "from-violet-500 to-purple-500", badge: "Branch Office",
    doctors: [
      { name: "Dr. Aleem Rehman", specialization: "Senior Physician", id: "DOC001" },
      { name: "Dr. Zain Abbas", specialization: "General Physician", id: "DOC003" },
    ],
    schedule: { days: "Monday — Saturday", hours: "3:00 PM — 12:00 AM", break: "8:00 PM — 9:00 PM (Break)", slotDuration: "30 minutes" },
    features: ["AI Voice Receptionist", "Walk-in Accepted", "Online Booking", "EHR System"],
  },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.05, 0.03] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-teal-500 rounded-full blur-[180px]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/[0.08] border border-teal-500/[0.12] mb-6">
            <Navigation className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-medium text-teal-400">Our Locations</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.95]">
            Visit Our <span className="gradient-text">Branches</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-white/35 max-w-2xl mx-auto">
            Two convenient locations in Islamabad and Multan, both powered by AI voice scheduling and modern healthcare systems.
          </motion.p>
        </div>
      </section>

      {/* Location Cards */}
      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          {locations.map((loc, i) => (
            <motion.div key={loc.city} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
              <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.03] transition-all group">
                {/* Header */}
                <div className={`bg-gradient-to-r ${loc.color} p-6 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-7 h-7 text-white" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{loc.city}</h2>
                      <p className="text-white/60 text-sm">{loc.badge}</p>
                    </div>
                  </div>
                  <Link href="/appointment">
                    <Button size="sm" className="bg-white/20 backdrop-blur text-white border border-white/20 rounded-full hover:bg-white/30">
                      Book Here <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>

                {/* Content */}
                <div className="p-6 grid md:grid-cols-3 gap-6">
                  {/* Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Location Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-white/40">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-white/20" />{loc.address}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-white/40">
                        <Phone className="w-4 h-4 shrink-0 mt-0.5 text-white/20" />
                        <a href={`tel:${loc.phone.replace(/[^+\d]/g, "")}`} className="hover:text-white transition">{loc.phone}</a>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-white/40">
                        <Clock className="w-4 h-4 shrink-0 mt-0.5 text-white/20" />
                        <div>
                          <p>{loc.schedule.days}</p>
                          <p>{loc.schedule.hours}</p>
                          <p className="text-white/20">{loc.schedule.break}</p>
                          <p className="text-white/20">Slots: {loc.schedule.slotDuration}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctors */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Doctors</h3>
                    <div className="space-y-3">
                      {loc.doctors.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-blue-400/50" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/70">{doc.name}</p>
                            <p className="text-xs text-white/25">{doc.specialization}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features + Map */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-semibold text-white/20 uppercase tracking-wider">Features</h3>
                    <div className="space-y-2">
                      {loc.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-sm text-white/35">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/50 shrink-0" />{f}
                        </div>
                      ))}
                    </div>
                    <div className="aspect-video rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/10 text-xs mt-4">
                      <MapPin className="w-4 h-4 mr-1" /> Map — {loc.city}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-3xl md:text-4xl font-bold mb-4">Visit Us or <span className="gradient-text">Book Online</span></motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-white/30 mb-8 max-w-lg mx-auto">Schedule an appointment at any branch through our website or AI voice assistant.</motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/appointment"><Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8 h-12 font-semibold shadow-lg shadow-blue-500/20">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/contact"><Button size="lg" variant="outline" className="rounded-full border-white/[0.08] text-white px-8 h-12">Contact Us</Button></Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
