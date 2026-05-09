"use client";

import { motion } from "framer-motion";
import {
  HeartPulse, Users, Brain, Target, Sparkles, Award, Shield,
  ArrowRight, CheckCircle2, Calendar, Phone, Zap, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground } from "@/components/public/animated-bg";
import { CountUp } from "@/components/public/animations";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const values = [
  { icon: HeartPulse, title: "Patient-First", desc: "Every decision optimizes patient experience — from AI voice scheduling to zero-wait appointments.", color: "from-rose-500 to-pink-500" },
  { icon: Brain, title: "AI-Native", desc: "Built from the ground up with artificial intelligence at every layer — not bolted on as an afterthought.", color: "from-blue-500 to-cyan-500" },
  { icon: Shield, title: "Enterprise Security", desc: "JWT authentication, bcrypt encryption, RBAC, audit trails, and HIPAA-ready architecture.", color: "from-violet-500 to-purple-500" },
  { icon: Zap, title: "Real-time Operations", desc: "WebSocket-powered live dashboard with instant appointment, call, and analytics updates.", color: "from-amber-500 to-orange-500" },
];

const timeline = [
  { year: "Phase 1", title: "Foundation", desc: "FastAPI backend, MongoDB schemas, doctor seeding, and authentication system." },
  { year: "Phase 2", title: "Voice AI", desc: "LiveKit SIP integration, GPT-4o intent extraction, 24-state FSM workflow engine." },
  { year: "Phase 3", title: "Smart Scheduling", desc: "Real-time slot engine, conflict prevention, multi-location support, slot locking." },
  { year: "Phase 4", title: "Enterprise Platform", desc: "Admin portal, real-time analytics, EHR sync, audit logging, public website." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">About Aleem Hospital</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Redefining Healthcare<br/><span className="gradient-text">With AI</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Aleem Hospital is Pakistan&apos;s first AI-native healthcare platform — combining voice AI, smart scheduling, and real-time analytics to deliver a world-class patient experience.
          </motion.p>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-6">Our <span className="gradient-text">Mission</span></motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-white/40 text-lg leading-relaxed mb-6">
                To eliminate friction in healthcare operations through intelligent automation. No more missed calls, double bookings, or scheduling errors.
              </motion.p>
              <motion.p variants={fadeUp} custom={2} className="text-white/35 leading-relaxed mb-8">
                Our AI voice receptionist handles patient calls 24/7, our scheduling engine prevents conflicts in real-time, and our analytics dashboard gives administrators complete operational visibility — all working together as one unified platform.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex gap-4">
                <Link href="/appointment"><Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-6 h-11 font-semibold">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
                <Link href="/voice-call"><Button variant="outline" className="border-white/[0.1] bg-white/[0.03] text-white rounded-xl px-6 h-11"><Phone className="w-4 h-4 mr-2" /> Call AI</Button></Link>
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 gap-4">
              {[
                { value: 24, suffix: "/7", label: "AI Availability", icon: Clock, color: "from-blue-500/20 to-cyan-500/20" },
                { value: 94, suffix: "%", label: "AI Resolution", icon: Brain, color: "from-emerald-500/20 to-teal-500/20" },
                { value: 3, suffix: "", label: "Expert Doctors", icon: Users, color: "from-violet-500/20 to-purple-500/20" },
                { value: 2, suffix: "", label: "Branches", icon: Target, color: "from-amber-500/20 to-orange-500/20" },
              ].map((stat, i) => (
                <motion.div key={stat.label} variants={fadeUp} custom={i}>
                  <div className="glass-card rounded-xl p-5 text-center hover:bg-white/[0.05] transition-all group">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white/70" />
                    </div>
                    <div className="text-3xl font-bold gradient-text"><CountUp end={stat.value} suffix={stat.suffix} /></div>
                    <div className="text-[11px] text-white/30 mt-1">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mx-auto mb-6">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Our Values</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">What Drives Us</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-xl p-6 hover:bg-white/[0.05] transition-all group h-full">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      <v.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{v.title}</h3>
                      <p className="text-sm text-white/35 leading-relaxed">{v.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold">Our <span className="gradient-text">Journey</span></motion.h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/20 via-cyan-500/20 to-transparent" />
            {timeline.map((item, i) => (
              <motion.div key={item.year} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="relative pl-16 pb-10 last:pb-0">
                <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 border-4 border-[#060a14]" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{item.year}</span>
                <h3 className="text-lg font-bold text-white mt-1">{item.title}</h3>
                <p className="text-sm text-white/35 mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
