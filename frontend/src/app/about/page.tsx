"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Heart, Shield, Brain, Users, ArrowRight, Sparkles,
  Target, Award, Globe, Clock, Zap, CheckCircle2,
  Calendar, Phone, Bot, HeartPulse, Cpu, Radio,
  Star, TrendingUp,
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

const values = [
  { icon: Heart, title: "Patient-First Care", desc: "Every decision starts with the patient. AI enhances — never replaces — the human connection.", color: "from-rose-500 to-pink-500" },
  { icon: Brain, title: "AI Innovation", desc: "Pioneering voice-first healthcare with cutting-edge AI that understands and responds naturally.", color: "from-blue-500 to-cyan-500" },
  { icon: Shield, title: "Trust & Security", desc: "Enterprise-grade security with JWT auth, RBAC, encryption, and HIPAA-ready architecture.", color: "from-emerald-500 to-teal-500" },
  { icon: Globe, title: "Accessible Healthcare", desc: "No accounts, no barriers. Public access to booking, availability, and AI voice scheduling.", color: "from-violet-500 to-purple-500" },
];

const milestones = [
  { year: "2024", title: "Hospital Founded", desc: "Aleem Hospital launches in Islamabad with a vision for AI-native healthcare." },
  { year: "2024", title: "AI Voice Agent", desc: "24/7 AI receptionist deployed with LiveKit, GPT-4o, and 24-state FSM conversation engine." },
  { year: "2025", title: "Multan Branch", desc: "Second location opens in Multan with shared AI network and unified scheduling." },
  { year: "2025", title: "Full Platform", desc: "Complete EHR, real-time analytics, voice transcription, and admin dashboard launch." },
];

const statsData = [
  { value: "3", label: "Expert Doctors", icon: Users },
  { value: "2", label: "Branch Locations", icon: Globe },
  { value: "24/7", label: "AI Availability", icon: Clock },
  { value: "94%", label: "AI Resolution", icon: TrendingUp },
  { value: "<2s", label: "Response Time", icon: Zap },
  { value: "24", label: "FSM States", icon: Cpu },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.12] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">About Us</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.95]">
            Redefining Healthcare<br/><span className="gradient-text">With AI</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-white/35 max-w-2xl mx-auto leading-relaxed">
            Aleem Hospital combines the warmth of human healthcare with the precision and availability of artificial intelligence — making quality medical care accessible to everyone.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-b border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {statsData.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i} className="text-center group">
                <s.icon className="w-4 h-4 text-blue-400/40 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-[10px] text-white/20 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.12] mb-6">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Our Mission</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
              AI That <span className="gradient-text-emerald">Serves</span>,<br/>Not Replaces
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 text-lg leading-relaxed mb-8">
              We believe artificial intelligence should empower healthcare professionals, not replace them. Our AI handles the administrative burden — scheduling, call routing, record keeping — so doctors can focus on what matters most: patient care.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="space-y-4">
              {[
                "24/7 AI voice scheduling eliminates wait times",
                "Zero-friction booking — no account needed",
                "Real-time analytics drive smarter decisions",
                "Enterprise security protects patient data",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400/70 shrink-0 mt-0.5" />
                  <span className="text-white/40 text-sm">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="glass-card rounded-2xl p-8 glow-blue relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/[0.05] rounded-full blur-[80px]" />
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Bot, label: "AI Voice Agent", val: "24/7", color: "text-cyan-400" },
                  { icon: Calendar, label: "Smart Scheduling", val: "Live", color: "text-blue-400" },
                  { icon: HeartPulse, label: "EHR System", val: "Active", color: "text-emerald-400" },
                  { icon: Radio, label: "Live Monitoring", val: "Real-time", color: "text-violet-400" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                    <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                    <div className="text-lg font-bold text-white">{item.val}</div>
                    <div className="text-[10px] text-white/25">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.12] mb-6 mx-auto">
              <Star className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Our Values</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">What <span className="gradient-text">Drives Us</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br ${v.color} opacity-[0.03] rounded-full blur-[60px] group-hover:opacity-[0.06] transition-opacity`} />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      <v.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                      <p className="text-sm text-white/30 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/[0.08] border border-amber-500/[0.12] mb-6 mx-auto">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Our Journey</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Key <span className="gradient-text-warm">Milestones</span></motion.h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/20 via-violet-500/20 to-emerald-500/20" />
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <motion.div key={m.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                  className="flex gap-6 items-start">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-xl glass-card flex items-center justify-center">
                      <span className="text-sm font-bold gradient-text">{m.year}</span>
                    </div>
                  </div>
                  <div className="glass-card rounded-xl p-5 flex-1 hover:bg-white/[0.04] transition-all">
                    <h3 className="font-semibold text-white mb-1">{m.title}</h3>
                    <p className="text-sm text-white/30 leading-relaxed">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-3xl md:text-4xl font-bold mb-4">Experience the <span className="gradient-text">Future of Healthcare</span></motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-white/30 mb-8 max-w-lg mx-auto">Book an appointment or call our AI assistant to get started.</motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/appointment"><Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8 h-12 font-semibold shadow-lg shadow-blue-500/20">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/voice-call"><Button size="lg" variant="outline" className="rounded-full border-white/[0.08] text-white px-8 h-12"><Phone className="w-4 h-4 mr-2" /> Call AI</Button></Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
