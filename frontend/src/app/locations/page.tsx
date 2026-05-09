"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Clock, Users, Calendar, Mail, ArrowRight, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const locations = [
  {
    city: "Islamabad",
    subtitle: "Capital Territory Branch",
    address: "Aleem Hospital, Blue Area, Islamabad, Pakistan",
    emoji: "🏛️",
    doctors: [
      { name: "Dr. Aleem", spec: "General Medicine" },
      { name: "Dr. Mohsin", spec: "General Medicine" },
    ],
    color: "from-blue-500 to-cyan-500",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d212645.5!2d72.9!3d33.6!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfd07891722f%3A0x6059515c3f3f5!2sIslamabad!5e0!3m2!1sen!2spk!4v1234567890",
  },
  {
    city: "Multan",
    subtitle: "South Punjab Branch",
    address: "Aleem Hospital, Bosan Road, Multan, Pakistan",
    emoji: "🕌",
    doctors: [
      { name: "Dr. Aleem", spec: "General Medicine" },
      { name: "Dr. Zain", spec: "General Medicine" },
    ],
    color: "from-violet-500 to-purple-500",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110848.5!2d71.4!3d30.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2c47c5c0e9ff1f%3A0x6059515c3f3f5!2sMultan!5e0!3m2!1sen!2spk!4v1234567890",
  },
];

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] mb-6">
            <MapPin className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Our Locations</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Two Branches, One<br /><span className="gradient-text">AI Network</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Visit us at Islamabad or Multan. Both branches connected through a unified AI system for seamless healthcare.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-12">
          {locations.map((loc, i) => (
            <motion.div key={loc.city} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass rounded-2xl overflow-hidden hover:bg-white/[0.03] transition-all">
                <div className={`h-2 bg-gradient-to-r ${loc.color}`} />
                <div className="p-8 grid lg:grid-cols-2 gap-8">
                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl">{loc.emoji}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{loc.city}</h2>
                        <p className="text-sm text-white/40">{loc.subtitle}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-medium">Open Now</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 text-sm text-white/40">
                        <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span>{loc.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/40">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span>+92 440-6848-838</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/40">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span>info@aleemhospital.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/40">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span>3:00 PM — 12:00 AM (Break: 8-9 PM)</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/40">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>30-minute appointment slots</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Doctors at {loc.city}</h4>
                    <div className="space-y-2 mb-6">
                      {loc.doctors.map((doc) => (
                        <div key={doc.name} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/70">{doc.name}</p>
                            <p className="text-[11px] text-white/30">{doc.spec}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            <span className="text-[10px] text-emerald-400/60">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <Link href="/appointment" className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-11 font-semibold">
                          Book at {loc.city} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Link href="/voice-call">
                        <Button variant="outline" className="border-white/[0.08] text-white/50 rounded-xl h-11">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden min-h-[400px] flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
                    <div className="text-center relative z-10">
                      <MapPin className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-white/30">{loc.city}</p>
                      <p className="text-sm text-white/15 mt-1">{loc.address}</p>
                      <a
                        href={`https://www.google.com/maps/search/Aleem+Hospital+${loc.city}+Pakistan`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Open in Google Maps →
                      </a>
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
