"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Clock, Users, Calendar, Stethoscope, Star, Mail, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const doctors = [
  {
    name: "Dr. Aleem",
    role: "General Medicine",
    bio: "Experienced general physician serving patients across both Islamabad and Multan branches. Known for his patient-centered approach and dedication to quality healthcare.",
    locations: ["Islamabad", "Multan"],
    schedule: "Mon-Sat, 3:00 PM - 12:00 AM",
    color: "from-blue-500 to-cyan-500",
    specialties: ["General Medicine", "Preventive Care", "Health Screening"],
  },
  {
    name: "Dr. Mohsin",
    role: "General Medicine",
    bio: "Dedicated physician at the Islamabad branch with expertise in general medicine and patient care. Committed to providing comprehensive health solutions.",
    locations: ["Islamabad"],
    schedule: "Mon-Sat, 3:00 PM - 12:00 AM",
    color: "from-violet-500 to-purple-500",
    specialties: ["General Medicine", "Family Medicine", "Chronic Care"],
  },
  {
    name: "Dr. Zain",
    role: "General Medicine",
    bio: "Skilled physician serving the Multan branch with a focus on accessible healthcare. Brings compassionate care and modern medical practices to South Punjab.",
    locations: ["Multan"],
    schedule: "Mon-Sat, 3:00 PM - 12:00 AM",
    color: "from-emerald-500 to-teal-500",
    specialties: ["General Medicine", "Primary Care", "Wellness Checks"],
  },
];

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Our Medical Team</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Meet Our <span className="gradient-text">Doctors</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Qualified medical professionals across Islamabad and Multan, powered by AI scheduling for instant appointment booking.
          </motion.p>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          {doctors.map((doc, i) => (
            <motion.div key={doc.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass rounded-2xl overflow-hidden hover:bg-white/[0.03] transition-all">
                <div className={`h-3 bg-gradient-to-r ${doc.color}`} />
                <div className="p-8 grid lg:grid-cols-3 gap-8">
                  {/* Left - Profile */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${doc.color} flex items-center justify-center text-5xl mb-4 shadow-lg`}>
                      👨‍⚕️
                    </div>
                    <h3 className="text-xl font-bold text-white">{doc.name}</h3>
                    <p className="text-sm text-white/40 mb-3">{doc.role}</p>
                    <div className="flex items-center justify-center gap-1.5 mb-4">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[11px] text-emerald-400/70">Available Now</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {doc.locations.map((loc) => (
                        <span key={loc} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Middle - Bio */}
                  <div className="lg:col-span-1">
                    <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">About</h4>
                    <p className="text-sm text-white/35 leading-relaxed mb-6">{doc.bio}</p>
                    <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {doc.specialties.map((s) => (
                        <span key={s} className="text-[11px] px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-300">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right - Schedule & CTA */}
                  <div className="space-y-4">
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                      <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Schedule</h4>
                      <div className="space-y-2 text-sm text-white/35">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />{doc.schedule}</div>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-400" />30-minute appointments</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400" />+92 440-6848-838</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px] text-white/20">
                        Break: 8:00 PM — 9:00 PM
                      </div>
                    </div>
                    <Link href="/appointment">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-500/15">
                        Book with {doc.name} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/voice-call">
                      <Button variant="outline" className="w-full border-white/[0.08] text-white/50 rounded-xl h-11 mt-2">
                        <Phone className="w-4 h-4 mr-2" /> Call to Book
                      </Button>
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
