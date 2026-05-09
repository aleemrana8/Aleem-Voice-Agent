"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import {
  Calendar, Brain, Activity, Phone, Shield,
  ChevronRight, Sparkles, Stethoscope,
  Clock, Zap, HeartPulse, Users, Bot,
  ArrowRight, CheckCircle2, MapPin,
  PhoneCall, Cpu, Radio, LineChart, ArrowUpRight,
  CircleDot, Mic, Globe, TrendingUp, BarChart3,
  Layers, Workflow, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

/* ── Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  })
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  })
};

const doctors = [
  { name: "Dr. Aleem Rehman", role: "Senior Physician", locations: ["Islamabad", "Multan"], img: "👨‍⚕️", color: "from-blue-500 to-cyan-500", schedule: "Mon–Sat, 3PM–12AM" },
  { name: "Dr. Mohsin Khan", role: "General Physician", locations: ["Islamabad"], img: "👨‍⚕️", color: "from-violet-500 to-purple-500", schedule: "Mon–Sat, 3PM–12AM" },
  { name: "Dr. Zain Abbas", role: "General Physician", locations: ["Multan"], img: "👨‍⚕️", color: "from-emerald-500 to-teal-500", schedule: "Mon–Sat, 3PM–12AM" },
];

const features = [
  { icon: Bot, title: "AI Voice Receptionist", desc: "24/7 intelligent call handling with natural conversation, intent recognition, and real-time scheduling.", color: "from-blue-500 to-cyan-500" },
  { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered slot management with conflict prevention, slot locking, and multi-location support.", color: "from-violet-500 to-purple-500" },
  { icon: Brain, title: "Intelligent NLU", desc: "GPT-4o extracts 13 intents with context awareness. Handles corrections, go-back, and confirmations.", color: "from-emerald-500 to-teal-500" },
  { icon: Activity, title: "Real-time Analytics", desc: "Live dashboards with appointment trends, voice call metrics, doctor utilization, and AI insights.", color: "from-orange-500 to-amber-500" },
  { icon: HeartPulse, title: "EHR Integration", desc: "Complete electronic health records with AI-powered documentation and automated sync.", color: "from-rose-500 to-pink-500" },
  { icon: Shield, title: "Enterprise Security", desc: "JWT auth, RBAC, bcrypt encryption, full audit trail, and HIPAA-ready architecture.", color: "from-indigo-500 to-blue-500" },
];

const stats = [
  { value: "24/7", label: "AI Available", icon: Clock },
  { value: "<2s", label: "Response Time", icon: Zap },
  { value: "94%", label: "AI Resolution", icon: Brain },
  { value: "3", label: "Expert Doctors", icon: Stethoscope },
  { value: "2", label: "Locations", icon: MapPin },
  { value: "30min", label: "Slot Duration", icon: Calendar },
];

const workflowSteps = [
  { step: "01", title: "Patient Calls", desc: "AI answers instantly with a warm greeting in Urdu or English", icon: PhoneCall, color: "from-blue-500 to-cyan-500" },
  { step: "02", title: "Intent Detection", desc: "GPT-4o understands booking, rescheduling, cancellation, or inquiry", icon: Brain, color: "from-violet-500 to-purple-500" },
  { step: "03", title: "Smart Processing", desc: "24-state FSM validates availability, prevents conflicts, locks slots", icon: Cpu, color: "from-emerald-500 to-teal-500" },
  { step: "04", title: "Confirmation", desc: "Instant confirmation with dashboard & EHR sync in real-time", icon: CheckCircle2, color: "from-amber-500 to-orange-500" },
];

const achievements = [
  { name: "Healthcare Innovation", text: "Pakistan's first AI-native hospital scheduling platform with voice-first design and 24-state FSM engine.", rating: 5 },
  { name: "Enterprise Architecture", text: "Production-ready infrastructure: Docker, Redis, MongoDB, FastAPI, WebSockets — built to scale.", rating: 5 },
  { name: "AI-First Approach", text: "94% automated resolution rate with zero human intervention. Natural voice booking in seconds.", rating: 5 },
];

/* ── Particle field ── */
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-400/20"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 5 }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative min-h-[110vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.07, 0.04] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-40 left-1/4 w-[900px] h-[900px] bg-blue-500 rounded-full blur-[200px]" />
          <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute -bottom-20 right-1/4 w-[700px] h-[700px] bg-cyan-500 rounded-full blur-[180px]" />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.04, 0.02] }} transition={{ duration: 12, repeat: Infinity, delay: 4 }}
            className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-violet-500 rounded-full blur-[150px]" />
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#060a14_70%)]" />
          {mounted && <ParticleField />}
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="relative z-10 px-6 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">Pakistan&apos;s First AI-Native Hospital Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-blue-400/50" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] mb-8">
            <span className="gradient-text-hero">A New Era of</span><br />
            <span className="gradient-text">AI Healthcare</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-white/35 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-powered voice scheduling, intelligent EHR, real-time analytics &amp;
            24-state FSM receptionist — all working together for Aleem Hospital.
          </motion.p>

          {/* CTA */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/voice-call">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-emerald-500/25 min-w-[220px] group">
                <Phone className="w-5 h-5 mr-2 group-hover:animate-pulse" /> Call AI Receptionist
              </Button>
            </Link>
            <Link href="/appointment">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-8 h-14 text-base font-semibold shadow-xl shadow-blue-500/25 min-w-[220px]">
                <Calendar className="w-5 h-5 mr-2" /> Book Appointment
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white min-w-[220px]">
                <Sparkles className="w-5 h-5 mr-2" /> Explore Services
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto mt-16">
            {stats.map((s) => (
              <motion.div key={s.label} whileHover={{ y: -4 }} className="text-center group cursor-default">
                <s.icon className="w-4 h-4 text-blue-400/40 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                <div className="text-2xl md:text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-[11px] text-white/20 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl mx-auto mt-24">
            <div className="glass rounded-2xl p-1 animate-glow-pulse relative">
              {/* Floating notification badges */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -left-4 z-20 glass-card rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400 font-medium">Appointment Confirmed</p>
                  <p className="text-[9px] text-white/25">Dr. Aleem • 3:30 PM</p>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -top-4 -right-4 z-20 glass-card rounded-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-400 font-medium">AI Call Active</p>
                  <p className="text-[9px] text-white/25">Booking in progress...</p>
                </div>
              </motion.div>

              <div className="rounded-xl bg-[#0a0f1a] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="text-xs text-white/10 font-mono">aleem-hospital.ai/admin/dashboard</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/50">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Active Patients", val: "1,247", delta: "+12%", color: "from-blue-500/20 to-blue-500/5" },
                    { label: "Today's Appointments", val: "38", delta: "+8%", color: "from-emerald-500/20 to-emerald-500/5" },
                    { label: "AI Calls Handled", val: "156", delta: "+23%", color: "from-violet-500/20 to-violet-500/5" },
                    { label: "AI Resolution Rate", val: "94%", delta: "+2%", color: "from-amber-500/20 to-amber-500/5" },
                  ].map((c) => (
                    <div key={c.label} className={`rounded-lg bg-gradient-to-b ${c.color} border border-white/[0.04] p-3`}>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-white/30">{c.label}</div>
                        <span className="text-[9px] text-emerald-400 flex items-center gap-0.5"><ArrowUpRight className="w-2.5 h-2.5" />{c.delta}</span>
                      </div>
                      <div className="text-xl font-bold mt-1">{c.val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-40 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-end p-4 gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 50, 82, 68].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }} transition={{ delay: 0.8 + i * 0.04, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-500/10 rounded-t hover:from-blue-500/60 hover:to-blue-500/20 transition-colors" />
                    ))}
                  </div>
                  <div className="h-40 rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-center items-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                        <motion.circle cx="40" cy="40" r="34" fill="none" stroke="url(#heroGrad)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${0.94 * 2 * Math.PI * 34} ${2 * Math.PI * 34}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                          whileInView={{ strokeDashoffset: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5, duration: 1.5 }} />
                        <defs><linearGradient id="heroGrad"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-emerald-400">94%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/25 mt-2">AI Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <span className="text-[10px] text-white/15 flex items-center gap-1"><CircleDot className="w-3 h-3 text-blue-500/40" /> Real-time Dashboard</span>
              <span className="text-[10px] text-white/15 flex items-center gap-1"><CircleDot className="w-3 h-3 text-emerald-500/40" /> AI Analytics</span>
              <span className="text-[10px] text-white/15 flex items-center gap-1"><CircleDot className="w-3 h-3 text-violet-500/40" /> Voice Monitoring</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ TECH LOGOS ══ */}
      <section className="relative py-20 px-6 border-t border-white/[0.03]">
        <div className="max-w-5xl mx-auto">
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-center text-xs text-white/15 uppercase tracking-[0.2em] mb-8">
            Powered By Enterprise Technology
          </motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            {[
              { name: "LiveKit", icon: Radio },
              { name: "GPT-4o", icon: Brain },
              { name: "MongoDB", icon: Layers },
              { name: "FastAPI", icon: Zap },
              { name: "Next.js", icon: Globe },
              { name: "Docker", icon: Cpu },
            ].map((tech, i) => (
              <motion.div key={tech.name} variants={fadeUp} custom={i}
                className="flex items-center gap-2 text-white/15 hover:text-white/40 transition-colors group">
                <tech.icon className="w-5 h-5 group-hover:text-blue-400/50 transition-colors" />
                <span className="text-sm font-medium">{tech.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ AI VOICE RECEPTIONIST ══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[180px]" />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/[0.08] border border-cyan-500/[0.12] mb-6">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">AI Voice System</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
                Your AI Receptionist<br/><span className="gradient-text">Never Sleeps</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/35 text-lg leading-relaxed mb-8">
                Patients call and speak naturally. Our AI understands intent, verifies identity, checks real-time availability, and books appointments — all through voice.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="space-y-4 mb-8">
                {["Schedule, reschedule & cancel appointments by voice", "Real-time slot checking with conflict prevention", "24-state FSM for complex multi-turn conversations", "Urdu and English language support", "Live call monitoring & transcription"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400/70 shrink-0 mt-0.5" />
                    <span className="text-white/45 text-sm">{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex gap-4">
                <Link href="/voice-call">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl px-6 h-12 font-semibold shadow-lg shadow-cyan-500/20 group">
                    <Phone className="w-4 h-4 mr-2 group-hover:animate-pulse" /> Try Voice AI
                  </Button>
                </Link>
                <Link href="/appointment">
                  <Button variant="outline" className="border-white/[0.08] bg-white/[0.03] text-white rounded-xl px-6 h-12">
                    Book Online <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="glass rounded-2xl p-8 glow-cyan relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyan-500/[0.05] rounded-full blur-[80px]" />
                <div className="flex items-center justify-center gap-[2px] h-20 mb-8">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <motion.div key={i} animate={{ height: [3, Math.random() * 50 + 8, 3], opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.03 }}
                      className="w-[3px] bg-gradient-to-t from-cyan-500/30 to-cyan-400/70 rounded-full" />
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { speaker: "AI", text: "Assalam-o-Alaikum! Welcome to Aleem Hospital. How can I help you today?", isAI: true },
                    { speaker: "Patient", text: "I'd like to book an appointment with Dr. Aleem", isAI: false },
                    { speaker: "AI", text: "Sure! Dr. Aleem is available tomorrow at 3:00, 3:30, and 4:00 PM in Islamabad. Which works best?", isAI: true },
                    { speaker: "Patient", text: "3:30 PM please", isAI: false },
                    { speaker: "AI", text: "Your appointment is confirmed for tomorrow at 3:30 PM with Dr. Aleem at Islamabad. ✓", isAI: true },
                  ].map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: msg.isAI ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}
                      className={`rounded-xl px-4 py-2.5 text-sm ${msg.isAI ? "bg-cyan-500/[0.08] border border-cyan-500/10 mr-8" : "bg-white/[0.03] border border-white/[0.04] ml-8"}`}>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider ${msg.isAI ? "text-cyan-400/50" : "text-white/25"}`}>{msg.speaker}</span>
                      <p className="text-white/55 mt-0.5 text-[13px]">{msg.text}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[11px] text-emerald-400/70">AI Agent Active</span>
                  </div>
                  <span className="text-[10px] text-white/15">LiveKit + GPT-4o + OpenAI TTS</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ DASHBOARD PREVIEW ══ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.03] rounded-full blur-[200px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.12] mb-6 mx-auto">
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Admin Dashboard</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Complete Hospital<br/><span className="gradient-text">Operations Center</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/30 mt-4 max-w-2xl mx-auto text-lg">Real-time monitoring of appointments, AI calls, doctor schedules, and patient analytics.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Calendar, label: "Live Appointments", desc: "Real-time booking feed", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: LineChart, label: "AI Analytics", desc: "Performance insights", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { icon: Stethoscope, label: "Doctor Schedules", desc: "Availability tracking", color: "text-violet-400", bg: "bg-violet-500/10" },
              { icon: Radio, label: "Live Calls", desc: "Voice agent monitoring", color: "text-cyan-400", bg: "bg-cyan-500/10" },
            ].map((item, i) => (
              <motion.div key={item.label} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-xl p-6 text-center hover:bg-white/[0.05] transition-all group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.label}</h4>
                  <p className="text-[11px] text-white/25">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ DOCTORS ══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.12] mb-6 mx-auto">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Medical Team</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Expert <span className="gradient-text-emerald">Physicians</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/30 mt-4 max-w-xl mx-auto">Qualified physicians across Islamabad and Multan, powered by AI scheduling.</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {doctors.map((doc, i) => (
              <motion.div key={doc.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all group h-full">
                  <div className={`h-32 bg-gradient-to-br ${doc.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-[#0a0f1a] border-4 border-white/10 flex items-center justify-center text-3xl shadow-2xl">{doc.img}</div>
                  </div>
                  <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-lg font-bold text-white">{doc.name}</h3>
                    <p className="text-sm text-white/35 mb-1">{doc.role}</p>
                    <p className="text-[10px] text-white/20 mb-4">{doc.schedule}</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {doc.locations.map((loc) => (
                        <span key={loc} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/35 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{loc}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[11px] text-emerald-400/60">Available</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Link href="/appointment">
                      <button className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/40 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2 group-hover:border-blue-500/20">
                        Book Appointment <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="text-center mt-10">
            <Link href="/doctors"><Button variant="outline" className="rounded-full border-white/[0.08] text-white/40 hover:text-white px-6 h-11">View All Doctors <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* ══ LOCATIONS ══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.12] mb-6 mx-auto">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Our Locations</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Two Branches, One <span className="gradient-text">AI Network</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { city: "Islamabad", desc: "Capital Territory — Dr. Aleem & Dr. Mohsin", docs: ["Dr. Aleem", "Dr. Mohsin"], emoji: "🏛️", gradient: "from-blue-500 to-cyan-500" },
              { city: "Multan", desc: "South Punjab — Dr. Aleem & Dr. Zain", docs: ["Dr. Aleem", "Dr. Zain"], emoji: "🕌", gradient: "from-violet-500 to-purple-500" },
            ].map((loc, i) => (
              <motion.div key={loc.city} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all h-full group">
                  <div className={`h-3 bg-gradient-to-r ${loc.gradient}`} />
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-4xl mb-3 block">{loc.emoji}</span>
                        <h3 className="text-2xl font-bold text-white">{loc.city}</h3>
                        <p className="text-sm text-white/30 mt-1">{loc.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-medium">Open</span>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-white/35"><Clock className="w-4 h-4 text-white/20" />3:00 PM — 12:00 AM (Break: 8–9 PM)</div>
                      <div className="flex items-center gap-3 text-sm text-white/35"><Phone className="w-4 h-4 text-white/20" />+92 440-684-8838</div>
                      <div className="flex items-center gap-3 text-sm text-white/35"><Users className="w-4 h-4 text-white/20" />{loc.docs.join(", ")}</div>
                    </div>
                    <Link href="/appointment">
                      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/15 text-sm text-blue-400/80 hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-blue-300 transition-all">Book at {loc.city} →</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ AI ANALYTICS ══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/[0.08] border border-amber-500/[0.12] mb-6 mx-auto">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">AI Analytics</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Data-Driven <span className="gradient-text-warm">Healthcare Insights</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/30 mt-4 max-w-xl mx-auto">Live analytics dashboards tracking patient flow, AI performance, and appointment trends.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Patient Flow", desc: "Real-time patient volume, booking patterns, and visit trends", chart: [40, 55, 45, 70, 60, 85, 75, 90, 50, 65, 55, 80], color: "from-blue-500 to-cyan-500", metric: "1,247", metricLabel: "Total Patients" },
              { title: "AI Performance", desc: "Voice agent resolution rates, intent accuracy, and call metrics", chart: [60, 75, 80, 85, 88, 90, 92, 94, 91, 93, 95, 94], color: "from-emerald-500 to-teal-500", metric: "94%", metricLabel: "Resolution Rate" },
              { title: "Appointments", desc: "Booking patterns, cancellation rates, and scheduling efficiency", chart: [30, 45, 55, 40, 60, 50, 75, 65, 80, 70, 85, 78], color: "from-violet-500 to-purple-500", metric: "38", metricLabel: "Today's Schedule" },
            ].map((card, i) => (
              <motion.div key={card.title} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-xl p-6 h-full hover:bg-white/[0.04] transition-all group">
                  <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-[11px] text-white/20 mb-6">{card.desc}</p>
                  <div className="flex items-end gap-[3px] h-24 mb-6">
                    {card.chart.map((h, j) => (
                      <motion.div key={j} initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }} transition={{ delay: 0.2 + j * 0.04, duration: 0.4 }}
                        className={`flex-1 bg-gradient-to-t ${card.color} opacity-25 rounded-t group-hover:opacity-45 transition-opacity`} />
                    ))}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.metric}</div>
                      <div className="text-[10px] text-white/20 mt-0.5">{card.metricLabel}</div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" /> +12%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ WORKFLOW ══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.12] mb-6 mx-auto">
              <Workflow className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">AI Automation</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">AI-Powered <span className="gradient-text">Workflow</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/30 mt-4 max-w-xl mx-auto">From phone call to confirmed appointment — fully automated.</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {workflowSteps.map((s, i) => (
              <motion.div key={s.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-xl p-6 text-center h-full hover:bg-white/[0.04] transition-all group relative">
                  <div className="text-[11px] font-bold text-white/10 mb-4">{s.step}</div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <s.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-[12px] text-white/25 leading-relaxed">{s.desc}</p>
                  {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-white/10"><ChevronRight className="w-6 h-6" /></div>}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4} className="mt-16 max-w-3xl mx-auto">
            <div className="glass-card rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white/40 mb-4 text-center">Voice AI Pipeline</h4>
              <div className="flex items-center justify-center gap-2 flex-wrap text-[11px]">
                {[
                  { label: "📞 Phone", c: "bg-blue-500/10 border-blue-500/15 text-blue-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🎙️ LiveKit", c: "bg-violet-500/10 border-violet-500/15 text-violet-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🗣️ STT", c: "bg-cyan-500/10 border-cyan-500/15 text-cyan-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🧠 GPT-4o", c: "bg-emerald-500/10 border-emerald-500/15 text-emerald-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "⚙️ FSM", c: "bg-amber-500/10 border-amber-500/15 text-amber-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🔊 TTS", c: "bg-rose-500/10 border-rose-500/15 text-rose-300" },
                ].map((item, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg border ${item.c}`}>{item.label}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/[0.02] rounded-full blur-[200px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.12] mb-6 mx-auto">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Platform Features</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Everything Your Hospital <span className="gradient-text">Needs</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-br ${f.color} opacity-[0.03] rounded-full blur-[60px] group-hover:opacity-[0.06] transition-opacity`} />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{f.title}</h3>
                  <p className="text-sm text-white/30 leading-relaxed relative z-10">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-bold tracking-tight">Why Choose <span className="gradient-text">Aleem Hospital</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((t, i) => (
              <motion.div key={t.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-xl p-6 h-full hover:bg-white/[0.04] transition-all">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed mb-4">{t.text}</p>
                  <p className="text-xs font-semibold text-white/60">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
