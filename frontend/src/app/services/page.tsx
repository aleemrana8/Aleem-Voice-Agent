"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bot, Calendar, Brain, Activity, HeartPulse, Shield, Phone, Stethoscope,
  Clock, Zap, FileText, Users, MonitorSpeaker, Radio, BarChart3,
  ArrowRight, CheckCircle2, Sparkles, Mic, Globe, Lock, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const services = [
  {
    icon: Bot, title: "AI Voice Receptionist", color: "from-blue-500 to-cyan-500",
    desc: "24/7 AI-powered phone agent handles appointment booking, rescheduling, and cancellation through natural voice conversation.",
    features: ["Natural language understanding", "13 intent recognition", "24-state conversation engine", "Urdu & English support"],
  },
  {
    icon: Calendar, title: "Smart Appointment Scheduling", color: "from-violet-500 to-purple-500",
    desc: "AI-powered slot management with real-time availability checking, conflict prevention, and automatic slot locking.",
    features: ["Real-time availability", "Slot locking (5-min reserve)", "Conflict prevention", "Multi-doctor support"],
  },
  {
    icon: Stethoscope, title: "General Medicine", color: "from-emerald-500 to-teal-500",
    desc: "Comprehensive general medicine services with three qualified physicians across Islamabad and Multan.",
    features: ["Health screenings", "Preventive care", "Chronic disease management", "Wellness consultations"],
  },
  {
    icon: HeartPulse, title: "Electronic Health Records", color: "from-rose-500 to-pink-500",
    desc: "Complete EHR system with patient records, appointment history, transcripts, and AI-powered documentation.",
    features: ["Patient records management", "Appointment history", "Voice transcript storage", "EHR sync automation"],
  },
  {
    icon: Activity, title: "Real-Time Analytics", color: "from-amber-500 to-orange-500",
    desc: "Live dashboards with appointment trends, voice call metrics, doctor utilization, and AI performance insights.",
    features: ["Patient flow analytics", "Call performance metrics", "Branch comparison", "Hourly heatmaps"],
  },
  {
    icon: Shield, title: "Security & Compliance", color: "from-indigo-500 to-blue-500",
    desc: "Enterprise-grade security with JWT authentication, role-based access, bcrypt encryption, and full audit trails.",
    features: ["JWT authentication", "RBAC enforcement", "Audit trail logging", "HIPAA-ready architecture"],
  },
  {
    icon: Radio, title: "Live Call Monitoring", color: "from-cyan-500 to-blue-500",
    desc: "Real-time voice call monitoring with live transcription, intent tracking, and FSM state visualization.",
    features: ["Live call tracking", "Real-time transcription", "Intent classification", "FSM state view"],
  },
  {
    icon: Globe, title: "Multi-Location Network", color: "from-teal-500 to-emerald-500",
    desc: "Unified AI network connecting Islamabad and Multan branches with shared scheduling and analytics.",
    features: ["Islamabad branch", "Multan branch", "Shared doctor availability", "Branch analytics"],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] mb-6">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Our Services</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            AI-Powered <span className="gradient-text">Healthcare Services</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            From voice scheduling to real-time analytics — comprehensive healthcare services powered by artificial intelligence.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-10 px-6 pb-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {services.map((svc, i) => (
            <motion.div key={svc.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass rounded-2xl p-6 h-full hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                    <svc.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{svc.title}</h3>
                    <p className="text-sm text-white/35 leading-relaxed">{svc.desc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {svc.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-[12px] text-white/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
            Experience Our Services
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="text-white/35 mb-8 max-w-lg mx-auto">
            Book an appointment online or call our AI voice assistant to get started.
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/appointment"><Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8 h-12 font-semibold">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/voice-call"><Button size="lg" variant="outline" className="rounded-full border-white/[0.08] text-white px-8 h-12"><Phone className="w-4 h-4 mr-2" /> Call AI</Button></Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
