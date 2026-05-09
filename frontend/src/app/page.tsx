"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import {
  Calendar, Brain, Activity, Phone, Shield,
  ChevronRight, Sparkles, Stethoscope,
  Clock, Zap, HeartPulse, Users, Bot,
  ArrowRight, CheckCircle2, MapPin,
  PhoneCall, Cpu, Radio, LineChart, ArrowUpRight,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  })
};

const doctors = [
  { name: "Dr. Aleem", role: "General Medicine", locations: ["Islamabad", "Multan"], color: "from-blue-500 to-cyan-500" },
  { name: "Dr. Mohsin", role: "General Medicine", locations: ["Islamabad"], color: "from-violet-500 to-purple-500" },
  { name: "Dr. Zain", role: "General Medicine", locations: ["Multan"], color: "from-emerald-500 to-teal-500" },
];

const features = [
  { icon: Bot, title: "AI Voice Receptionist", desc: "24/7 intelligent call handling with natural conversation. No waiting, no hold music.", color: "from-blue-500 to-cyan-500" },
  { icon: Calendar, title: "Smart Scheduling", desc: "AI-powered slot management with conflict prevention & multi-location support.", color: "from-violet-500 to-purple-500" },
  { icon: Brain, title: "Intelligent NLU", desc: "GPT-4o extracts 13 intents with context awareness. Understands corrections & go-back.", color: "from-emerald-500 to-teal-500" },
  { icon: Activity, title: "Real-time Analytics", desc: "Live dashboards with appointment trends, voice call metrics, and AI insights.", color: "from-orange-500 to-amber-500" },
  { icon: HeartPulse, title: "EHR System", desc: "Complete electronic health records with AI-powered documentation.", color: "from-rose-500 to-pink-500" },
  { icon: Shield, title: "Enterprise Security", desc: "JWT auth, RBAC, bcrypt encryption, full audit trail, HIPAA-ready.", color: "from-indigo-500 to-blue-500" },
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
  { step: "01", title: "Patient Calls", desc: "AI answers instantly with a warm greeting", icon: PhoneCall, color: "from-blue-500 to-cyan-500" },
  { step: "02", title: "Intent Detection", desc: "GPT-4o understands booking, rescheduling, or inquiry", icon: Brain, color: "from-violet-500 to-purple-500" },
  { step: "03", title: "Smart Processing", desc: "FSM validates availability, prevents conflicts, locks slots", icon: Cpu, color: "from-emerald-500 to-teal-500" },
  { step: "04", title: "Confirmation", desc: "Instant confirmation. Dashboard & EHR sync in real-time", icon: CheckCircle2, color: "from-amber-500 to-orange-500" },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/[0.04] rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-violet-500/[0.025] rounded-full blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#060a14_70%)]" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 px-6 max-w-7xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-8"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-blue-300 font-medium">Pakistan&apos;s First AI-Native Hospital Platform</span>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8"
          >
            <span className="gradient-text-hero">A New Era of</span><br />
            <span className="gradient-text">AI Healthcare</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AI-powered voice scheduling, intelligent EHR, real-time analytics &
            24-state FSM receptionist — all working together for Aleem Hospital.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Link href="/voice-call">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-8 h-13 text-base font-semibold shadow-xl shadow-emerald-500/25 min-w-[200px]">
                <Phone className="w-5 h-5 mr-2" /> Call Now
              </Button>
            </Link>
            <Link href="/appointment">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-8 h-13 text-base font-semibold shadow-xl shadow-blue-500/25 min-w-[200px]">
                <Calendar className="w-5 h-5 mr-2" /> Book Appointment
              </Button>
            </Link>
            <Link href="/voice-call">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-13 text-base border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white min-w-[200px]">
                <Bot className="w-5 h-5 mr-2" /> Talk to AI
              </Button>
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto mt-16"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center group">
                <s.icon className="w-4 h-4 text-blue-400/50 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                <div className="text-[11px] text-white/25 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9 }} className="max-w-5xl mx-auto mt-20"
          >
            <div className="glass rounded-2xl p-1 glow-blue">
              <div className="rounded-xl bg-[#0a0f1a] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="text-xs text-white/15 font-mono">aleem-hospital.ai/admin</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/50">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Active Patients", val: "1,247", color: "from-blue-500/20 to-blue-500/5" },
                    { label: "Today's Schedule", val: "38", color: "from-emerald-500/20 to-emerald-500/5" },
                    { label: "AI Calls Handled", val: "156", color: "from-violet-500/20 to-violet-500/5" },
                    { label: "AI Resolution", val: "94%", color: "from-amber-500/20 to-amber-500/5" },
                  ].map((c) => (
                    <div key={c.label} className={`rounded-lg bg-gradient-to-b ${c.color} border border-white/[0.04] p-3`}>
                      <div className="text-[10px] text-white/30">{c.label}</div>
                      <div className="text-xl font-bold mt-1">{c.val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-40 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-end p-4 gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 50, 82, 68].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }} transition={{ delay: 0.8 + i * 0.04, duration: 0.5 }}
                        className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-500/10 rounded-t"
                      />
                    ))}
                  </div>
                  <div className="h-40 rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-center items-center">
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-400">94%</span>
                    </div>
                    <span className="text-[10px] text-white/25 mt-2">AI Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <span className="text-[10px] text-white/15 flex items-center gap-1"><CircleDot className="w-3 h-3 text-blue-500/40" /> Real-time Dashboard</span>
              <span className="text-[10px] text-white/15 flex items-center gap-1"><CircleDot className="w-3 h-3 text-emerald-500/40" /> AI Analytics</span>
              <span className="text-[10px] text-white/15 flex items-center gap-1"><CircleDot className="w-3 h-3 text-violet-500/40" /> Voice Monitoring</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ AI VOICE RECEPTIONIST ══ */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-4 block">AI Voice System</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Your AI Receptionist<span className="gradient-text block">Never Sleeps</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/40 text-lg leading-relaxed mb-8">
                Patients call and speak naturally. Our AI understands intent, verifies identity, checks real-time availability, and books appointments — all through voice.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="space-y-4 mb-8">
                {["Schedule, reschedule & cancel appointments by voice", "Real-time slot checking with conflict prevention", "24-state FSM for complex multi-turn conversations", "Supports natural conversation flow"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-white/50 text-sm">{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex gap-4">
                <Link href="/voice-call">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl px-6 h-11 font-semibold shadow-lg shadow-cyan-500/20">
                    <Phone className="w-4 h-4 mr-2" /> Try Voice AI
                  </Button>
                </Link>
                <Link href="/appointment">
                  <Button variant="outline" className="border-white/[0.1] bg-white/[0.03] text-white rounded-xl px-6 h-11">
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
                      className="w-[3px] bg-gradient-to-t from-cyan-500/30 to-cyan-400/70 rounded-full"
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { speaker: "AI", text: "Assalam-o-Alaikum! Welcome to Aleem Hospital. How can I help?", isAI: true },
                    { speaker: "Patient", text: "I'd like to book an appointment with Dr. Aleem", isAI: false },
                    { speaker: "AI", text: "Dr. Aleem is available tomorrow at 3:00, 3:30, 4:00 PM. What works best?", isAI: true },
                    { speaker: "Patient", text: "3:30 PM please", isAI: false },
                    { speaker: "AI", text: "Confirmed! Appointment booked for tomorrow at 3:30 PM with Dr. Aleem. ✓", isAI: true },
                  ].map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: msg.isAI ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}
                      className={`rounded-xl px-4 py-2.5 text-sm ${msg.isAI ? "bg-cyan-500/[0.08] border border-cyan-500/10 mr-8" : "bg-white/[0.03] border border-white/[0.04] ml-8"}`}
                    >
                      <span className="text-[9px] font-semibold text-white/25 uppercase tracking-wider">{msg.speaker}</span>
                      <p className="text-white/60 mt-0.5 text-[13px]">{msg.text}</p>
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
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-blue-400 tracking-widest uppercase">Dashboard Preview</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Complete Hospital<br/><span className="gradient-text">Operations Center</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 mt-4 max-w-2xl mx-auto text-lg">Real-time monitoring of appointments, AI calls, doctor schedules, and patient analytics.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Calendar, label: "Live Appointments", desc: "Real-time booking feed", color: "text-blue-400" },
              { icon: LineChart, label: "AI Analytics", desc: "Performance insights", color: "text-emerald-400" },
              { icon: Stethoscope, label: "Doctor Schedules", desc: "Availability tracking", color: "text-violet-400" },
              { icon: Radio, label: "Live Calls", desc: "Voice agent monitoring", color: "text-cyan-400" },
            ].map((item, i) => (
              <motion.div key={item.label} variants={fadeUp} custom={i}>
                <div className="glass rounded-xl p-5 text-center hover:bg-white/[0.05] transition-all group cursor-pointer">
                  <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                  <h4 className="text-sm font-semibold text-white mb-1">{item.label}</h4>
                  <p className="text-[11px] text-white/30">{item.desc}</p>
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
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-emerald-400 tracking-widest uppercase">Our Doctors</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Expert Medical Team</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 mt-4 max-w-xl mx-auto">Qualified physicians across Islamabad and Multan, powered by AI scheduling.</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {doctors.map((doc, i) => (
              <motion.div key={doc.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all group">
                  <div className={`h-28 bg-gradient-to-br ${doc.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-20 h-20 rounded-full bg-[#0a0f1a] border-4 border-white/10 flex items-center justify-center text-3xl">👨‍⚕️</div>
                  </div>
                  <div className="pt-14 pb-6 px-6 text-center">
                    <h3 className="text-lg font-bold text-white">{doc.name}</h3>
                    <p className="text-sm text-white/40 mb-4">{doc.role}</p>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {doc.locations.map((loc) => (
                        <span key={loc} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{loc}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[11px] text-emerald-400/70">Available Now</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Link href="/appointment">
                      <button className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">Book Appointment →</button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="text-center mt-10">
            <Link href="/doctors"><Button variant="outline" className="rounded-full border-white/[0.08] text-white/50 hover:text-white px-6">View All Doctors <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* ══ LOCATIONS ══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-violet-400 tracking-widest uppercase">Our Locations</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Two Branches, One <span className="gradient-text">AI Network</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { city: "Islamabad", desc: "Capital Territory branch with Dr. Aleem and Dr. Mohsin", doctors: ["Dr. Aleem", "Dr. Mohsin"], emoji: "🏛️" },
              { city: "Multan", desc: "South Punjab branch with Dr. Aleem and Dr. Zain", doctors: ["Dr. Aleem", "Dr. Zain"], emoji: "🕌" },
            ].map((loc, i) => (
              <motion.div key={loc.city} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-2xl p-8 hover:bg-white/[0.04] transition-all h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="text-4xl mb-3 block">{loc.emoji}</span>
                      <h3 className="text-2xl font-bold text-white">{loc.city}</h3>
                      <p className="text-sm text-white/35 mt-1">{loc.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-medium">Open</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-white/40"><Clock className="w-4 h-4 text-blue-400" /><span>3:00 PM — 12:00 AM (Break: 8-9 PM)</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/40"><Phone className="w-4 h-4 text-blue-400" /><span>+92 440-6848-838</span></div>
                    <div className="flex items-center gap-3 text-sm text-white/40"><Users className="w-4 h-4 text-blue-400" /><span>{loc.doctors.join(", ")}</span></div>
                  </div>
                  <Link href="/appointment"><button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-sm text-blue-400 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all">Book at {loc.city} →</button></Link>
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
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-amber-400 tracking-widest uppercase">AI Analytics</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Data-Driven <span className="gradient-text">Healthcare Insights</span></motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Patient Flow Analytics", desc: "Real-time tracking of patient volume and trends", chart: [40, 55, 45, 70, 60, 85, 75, 90, 50, 65, 55, 80], color: "from-blue-500 to-cyan-500", metric: "1,247", metricLabel: "Total Patients" },
              { title: "AI Call Performance", desc: "Voice agent resolution rates and accuracy", chart: [60, 75, 80, 85, 88, 90, 92, 94, 91, 93, 95, 94], color: "from-emerald-500 to-teal-500", metric: "94%", metricLabel: "Resolution Rate" },
              { title: "Appointment Trends", desc: "Booking patterns and scheduling efficiency", chart: [30, 45, 55, 40, 60, 50, 75, 65, 80, 70, 85, 78], color: "from-violet-500 to-purple-500", metric: "38", metricLabel: "Today's Schedule" },
            ].map((card, i) => (
              <motion.div key={card.title} variants={fadeUp} custom={i}>
                <div className="glass rounded-xl p-6 h-full hover:bg-white/[0.04] transition-all group">
                  <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-[11px] text-white/25 mb-6">{card.desc}</p>
                  <div className="flex items-end gap-[3px] h-20 mb-6">
                    {card.chart.map((h, j) => (
                      <motion.div key={j} initial={{ height: 0 }} whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }} transition={{ delay: 0.2 + j * 0.04, duration: 0.4 }}
                        className={`flex-1 bg-gradient-to-t ${card.color} opacity-30 rounded-t group-hover:opacity-50 transition-opacity`}
                      />
                    ))}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>{card.metric}</div>
                      <div className="text-[10px] text-white/25 mt-0.5">{card.metricLabel}</div>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" /> +12%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-emerald-400 tracking-widest uppercase">How It Works</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mt-4">AI-Powered <span className="gradient-text">Workflow</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 mt-4 max-w-xl mx-auto">From phone call to confirmed appointment — fully automated.</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {workflowSteps.map((step, i) => (
              <motion.div key={step.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-xl p-6 text-center h-full hover:bg-white/[0.04] transition-all group relative">
                  <div className="text-[11px] font-bold text-white/10 mb-4">{step.step}</div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-[12px] text-white/30 leading-relaxed">{step.desc}</p>
                  {i < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-white/10"><ChevronRight className="w-6 h-6" /></div>}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4} className="mt-16 max-w-3xl mx-auto">
            <div className="glass rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white/50 mb-4 text-center">Voice AI Pipeline</h4>
              <div className="flex items-center justify-center gap-2 flex-wrap text-[11px]">
                {[
                  { label: "📞 Phone Call", c: "bg-blue-500/10 border-blue-500/20 text-blue-300" },
                  { label: "→", c: "text-white/10 border-transparent" },
                  { label: "🎙️ LiveKit", c: "bg-violet-500/10 border-violet-500/20 text-violet-300" },
                  { label: "→", c: "text-white/10 border-transparent" },
                  { label: "🗣️ Whisper STT", c: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300" },
                  { label: "→", c: "text-white/10 border-transparent" },
                  { label: "🧠 GPT-4o", c: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" },
                  { label: "→", c: "text-white/10 border-transparent" },
                  { label: "⚙️ FSM Engine", c: "bg-amber-500/10 border-amber-500/20 text-amber-300" },
                  { label: "→", c: "text-white/10 border-transparent" },
                  { label: "🔊 TTS", c: "bg-rose-500/10 border-rose-500/20 text-rose-300" },
                ].map((item, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg border ${item.c}`}>{item.label}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section id="features" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-blue-400 tracking-widest uppercase">Platform Features</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Everything Your Hospital Needs</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-2xl p-6 h-full hover:bg-white/[0.05] transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
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
