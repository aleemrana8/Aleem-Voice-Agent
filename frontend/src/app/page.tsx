"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect } from "react";
import {
  Calendar, Brain, Activity, Phone, Shield,
  ChevronRight, Sparkles, Stethoscope,
  Clock, Zap, HeartPulse, Users, Bot,
  ArrowRight, CheckCircle2, MapPin,
  PhoneCall, Cpu, Radio, LineChart, ArrowUpRight,
  CircleDot, Monitor, Mic, Globe, Lock,
  BarChart3, Layers, Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ParticleField } from "@/components/public/particle-field";
import { HeroBackground, FloatingElements, GradientOrbs } from "@/components/public/animated-bg";
import { CountUp, AnimatedBar } from "@/components/public/animations";

/* ── Shared animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  })
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

/* ── Data ── */
const doctors = [
  { name: "Dr. Aleem Rehman", role: "Senior Physician", locations: ["Islamabad", "Multan"], color: "from-blue-500 to-cyan-500", emoji: "👨‍⚕️" },
  { name: "Dr. Mohsin Khan", role: "General Physician", locations: ["Islamabad"], color: "from-violet-500 to-purple-500", emoji: "👨‍⚕️" },
  { name: "Dr. Zain Abbas", role: "General Physician", locations: ["Multan"], color: "from-emerald-500 to-teal-500", emoji: "👨‍⚕️" },
];

const features = [
  { icon: Bot, title: "AI Voice Receptionist", desc: "24/7 intelligent phone agent with natural voice conversation. Books, reschedules, and cancels appointments autonomously.", color: "from-blue-500 to-cyan-500" },
  { icon: Calendar, title: "Smart Scheduling", desc: "Real-time slot management with conflict prevention, slot locking, and multi-location support across branches.", color: "from-violet-500 to-purple-500" },
  { icon: Brain, title: "Intelligent NLU", desc: "GPT-4o-powered intent extraction with 13 intents, context awareness, and natural correction handling.", color: "from-emerald-500 to-teal-500" },
  { icon: Activity, title: "Real-time Analytics", desc: "Live dashboards with appointment trends, voice call metrics, doctor utilization, and AI performance.", color: "from-orange-500 to-amber-500" },
  { icon: HeartPulse, title: "EHR System", desc: "Complete electronic health records with appointment sync, transcript storage, and AI documentation.", color: "from-rose-500 to-pink-500" },
  { icon: Shield, title: "Enterprise Security", desc: "JWT authentication, role-based access, bcrypt encryption, full audit trails, HIPAA-ready architecture.", color: "from-indigo-500 to-blue-500" },
];

const stats = [
  { value: 24, suffix: "/7", label: "AI Available", icon: Clock },
  { value: 2, prefix: "<", suffix: "s", label: "Response Time", icon: Zap },
  { value: 94, suffix: "%", label: "AI Resolution", icon: Brain },
  { value: 3, label: "Expert Doctors", icon: Stethoscope },
  { value: 2, label: "Locations", icon: MapPin },
  { value: 30, suffix: "min", label: "Slot Duration", icon: Calendar },
];

const workflowSteps = [
  { step: "01", title: "Patient Calls", desc: "AI answers instantly with a warm Assalam-o-Alaikum greeting", icon: PhoneCall, color: "from-blue-500 to-cyan-500" },
  { step: "02", title: "Intent Detection", desc: "GPT-4o understands booking, rescheduling, cancellation, or inquiry", icon: Brain, color: "from-violet-500 to-purple-500" },
  { step: "03", title: "Smart Processing", desc: "24-state FSM validates availability, prevents conflicts, locks slots", icon: Cpu, color: "from-emerald-500 to-teal-500" },
  { step: "04", title: "Confirmation", desc: "Instant confirmation. Dashboard, EHR & analytics sync real-time", icon: CheckCircle2, color: "from-amber-500 to-orange-500" },
];

const voiceConversation = [
  { speaker: "AI", text: "Assalam-o-Alaikum! Welcome to Aleem Hospital. How can I help you today?", isAI: true },
  { speaker: "Patient", text: "I'd like to book an appointment with Dr. Aleem in Islamabad", isAI: false },
  { speaker: "AI", text: "Dr. Aleem is available tomorrow at 3:00, 3:30, 4:00 PM. Which slot works best?", isAI: true },
  { speaker: "Patient", text: "3:30 PM please", isAI: false },
  { speaker: "AI", text: "Your appointment is confirmed for tomorrow at 3:30 PM with Dr. Aleem at Islamabad. ✓", isAI: true },
];

const dashboardCards = [
  { label: "Active Patients", val: "1,247", change: "+12%", color: "from-blue-500/20 to-blue-500/5" },
  { label: "Today's Schedule", val: "38", change: "+5%", color: "from-emerald-500/20 to-emerald-500/5" },
  { label: "AI Calls Handled", val: "156", change: "+23%", color: "from-violet-500/20 to-violet-500/5" },
  { label: "AI Resolution", val: "94%", change: "+3%", color: "from-amber-500/20 to-amber-500/5" },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) / 50);
      mouseY.set((e.clientY - window.innerHeight / 2) / 50);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* ═══ SECTION 1 — HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20">
        <HeroBackground />
        <ParticleField />
        <FloatingElements />

        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="relative z-10 px-6 max-w-7xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-8 group hover:bg-blue-500/[0.12] transition-colors cursor-default"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-sm text-blue-300 font-medium">Pakistan&apos;s First AI-Native Hospital Platform</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-400/50" />
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8"
          >
            <motion.span style={{ x: springX, y: springY }} className="gradient-text-hero inline-block">A New Era of</motion.span>
            <br />
            <span className="gradient-text text-glow-blue inline-block">AI Healthcare</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AI-powered voice scheduling, intelligent EHR, real-time analytics &
            24-state FSM receptionist — all working together for
            <span className="text-white/60 font-medium"> Aleem Hospital</span>.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          >
            <Link href="/voice-call">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-8 h-13 text-base font-semibold shadow-xl shadow-emerald-500/25 min-w-[200px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center"><Phone className="w-5 h-5 mr-2" /> Call Now</span>
              </Button>
            </Link>
            <Link href="/appointment">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-8 h-13 text-base font-semibold shadow-xl shadow-blue-500/25 min-w-[200px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center"><Calendar className="w-5 h-5 mr-2" /> Book Appointment</span>
              </Button>
            </Link>
            <Link href="/voice-call">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-13 text-base border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white min-w-[200px] backdrop-blur-sm">
                <Bot className="w-5 h-5 mr-2" /> Talk to AI
              </Button>
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3.5} className="flex items-center justify-center gap-6 mb-16 mt-4">
            {[
              { icon: Lock, label: "HIPAA-Ready" },
              { icon: Shield, label: "Enterprise Security" },
              { icon: Globe, label: "2 Locations" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-2 text-[11px] text-white/20">
                {i > 0 && <div className="w-px h-3 bg-white/10 -ml-3 mr-3" />}
                <item.icon className="w-3 h-3" /> {item.label}
              </div>
            ))}
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-4xl mx-auto mt-8"
          >
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={scaleIn} custom={i + 4} className="text-center group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2.5 group-hover:bg-white/[0.06] group-hover:border-white/[0.1] transition-all">
                  <s.icon className="w-4 h-4 text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="text-2xl font-bold gradient-text">
                  {s.prefix || ""}<CountUp end={s.value} />{s.suffix || ""}
                </div>
                <div className="text-[10px] text-white/25 mt-0.5 font-medium tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }} className="max-w-5xl mx-auto mt-20"
          >
            <div className="glass-premium rounded-2xl p-1 glow-blue relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-violet-500/20 opacity-30 blur-sm" />
              <div className="relative rounded-xl bg-[#0a0f1a] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-8 h-7 rounded-md bg-white/[0.03] border border-white/[0.04] flex items-center justify-center">
                    <span className="text-[10px] text-white/15 font-mono flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-emerald-400/40" /> aleem-hospital.ai/admin
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/50 font-medium">Live</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {dashboardCards.map((c) => (
                    <div key={c.label} className={`rounded-lg bg-gradient-to-b ${c.color} border border-white/[0.04] p-3 hover:border-white/[0.08] transition-all group/card`}>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-white/30">{c.label}</div>
                        <span className="text-[9px] text-emerald-400/70 flex items-center"><ArrowUpRight className="w-2.5 h-2.5" />{c.change}</span>
                      </div>
                      <div className="text-xl font-bold mt-1 group-hover/card:scale-105 transition-transform origin-left">{c.val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 h-44 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-end p-4 gap-[3px] overflow-hidden relative">
                    <div className="absolute top-3 left-4 text-[10px] text-white/20 font-medium">Appointment Volume</div>
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 50, 82, 68, 92, 78, 85].map((h, i) => (
                      <AnimatedBar key={i} height={h} delay={0.8 + i * 0.03} color={i >= 14 ? "from-cyan-500/50 to-cyan-500/15" : "from-blue-500/40 to-blue-500/10"} />
                    ))}
                  </div>
                  <div className="h-44 rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-3 left-4 text-[10px] text-white/20 font-medium">AI Accuracy</div>
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                        <motion.circle cx="40" cy="40" r="32" fill="none" stroke="url(#gauge)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={`${94 * 2.01} ${(100 - 94) * 2.01}`}
                          initial={{ strokeDasharray: "0 201" }}
                          whileInView={{ strokeDasharray: `${94 * 2.01} ${(100 - 94) * 2.01}` }}
                          viewport={{ once: true }}
                          transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                        />
                        <defs><linearGradient id="gauge" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-emerald-400"><CountUp end={94} suffix="%" /></span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/25 mt-2 font-medium">AI Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-5">
              {[
                { label: "Real-time Dashboard", color: "text-blue-500/40" },
                { label: "AI Analytics", color: "text-emerald-500/40" },
                { label: "Voice Monitoring", color: "text-violet-500/40" },
              ].map((item) => (
                <span key={item.label} className="text-[10px] text-white/15 flex items-center gap-1.5">
                  <CircleDot className={`w-3 h-3 ${item.color}`} /> {item.label}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SECTION 2 — AI VOICE RECEPTIONIST ═══ */}
      <section className="relative py-32 px-6">
        <GradientOrbs />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/[0.08] border border-cyan-500/[0.15] mb-6">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">AI Voice System</span>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Your AI Receptionist<br/><span className="gradient-text">Never Sleeps</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/40 text-lg leading-relaxed mb-8">
                Patients call and speak naturally. Our AI understands intent, verifies identity, checks real-time availability, and books appointments — all through voice.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="space-y-3 mb-8">
                {[
                  "Schedule, reschedule & cancel appointments by voice",
                  "Real-time slot checking with conflict prevention",
                  "24-state FSM for complex multi-turn conversations",
                  "Natural Urdu & English conversation support",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 group">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">{item}</span>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} custom={4} className="flex gap-4">
                <Link href="/voice-call">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl px-6 h-11 font-semibold shadow-lg shadow-cyan-500/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center"><Phone className="w-4 h-4 mr-2" /> Try Voice AI</span>
                  </Button>
                </Link>
                <Link href="/appointment">
                  <Button variant="outline" className="border-white/[0.1] bg-white/[0.03] text-white rounded-xl px-6 h-11 hover:bg-white/[0.06]">
                    Book Online <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40, rotateY: 5 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="glass-premium rounded-2xl p-8 glow-cyan relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-cyan-500/[0.06] rounded-full blur-[100px]" />
                <div className="flex items-center justify-center gap-[2px] h-20 mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent rounded-xl" />
                  {Array.from({ length: 60 }).map((_, i) => (
                    <motion.div key={i} animate={{ height: [3, Math.random() * 55 + 8, 3], opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 1.5 + Math.random(), repeat: Infinity, delay: i * 0.03 }}
                      className="w-[3px] bg-gradient-to-t from-cyan-500/30 to-cyan-400/70 rounded-full"
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {voiceConversation.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: msg.isAI ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.15 }}
                      className={`rounded-xl px-4 py-3 text-sm backdrop-blur-sm ${msg.isAI ? "bg-cyan-500/[0.08] border border-cyan-500/10 mr-8" : "bg-white/[0.03] border border-white/[0.04] ml-8"}`}
                    >
                      <span className={`text-[9px] font-semibold uppercase tracking-wider ${msg.isAI ? "text-cyan-400/40" : "text-white/25"}`}>{msg.speaker}</span>
                      <p className="text-white/60 mt-0.5 text-[13px] leading-relaxed">{msg.text}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-50" />
                    </div>
                    <span className="text-[11px] text-emerald-400/70 font-medium">AI Agent Active</span>
                  </div>
                  <span className="text-[10px] text-white/15 font-mono">LiveKit + GPT-4o + OpenAI TTS</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — EHR DASHBOARD PREVIEW ═══ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/[0.03] rounded-full blur-[200px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mx-auto mb-6">
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium uppercase tracking-wider">Dashboard Preview</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Complete Hospital<br/><span className="gradient-text">Operations Center</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 mt-4 max-w-2xl mx-auto text-lg">Real-time monitoring of appointments, AI calls, doctor schedules, and patient analytics — all in one place.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Calendar, label: "Live Appointments", desc: "Real-time booking feed", color: "text-blue-400", bg: "bg-blue-500/[0.06]" },
              { icon: LineChart, label: "AI Analytics", desc: "Performance insights", color: "text-emerald-400", bg: "bg-emerald-500/[0.06]" },
              { icon: Stethoscope, label: "Doctor Schedules", desc: "Availability tracking", color: "text-violet-400", bg: "bg-violet-500/[0.06]" },
              { icon: Radio, label: "Live Calls", desc: "Voice agent monitoring", color: "text-cyan-400", bg: "bg-cyan-500/[0.06]" },
            ].map((item, i) => (
              <motion.div key={item.label} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-xl p-6 text-center hover:bg-white/[0.05] transition-all group cursor-pointer">
                  <div className={`w-14 h-14 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.label}</h4>
                  <p className="text-[11px] text-white/30">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 4 — DOCTORS ═══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mx-auto mb-6">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Our Doctors</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Expert <span className="gradient-text">Medical Team</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 mt-4 max-w-xl mx-auto">Qualified physicians across Islamabad and Multan, powered by AI scheduling.</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {doctors.map((doc, i) => (
              <motion.div key={doc.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-2xl overflow-hidden hover:bg-white/[0.05] transition-all group">
                  <div className={`h-32 bg-gradient-to-br ${doc.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                      <div className="w-20 h-20 rounded-full bg-[#0a0f1a] border-4 border-white/10 flex items-center justify-center text-3xl shadow-2xl">{doc.emoji}</div>
                    </motion.div>
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
                      <div className="relative"><div className="w-2 h-2 bg-emerald-400 rounded-full" /><div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-40" /></div>
                      <span className="text-[11px] text-emerald-400/70 font-medium">Available Now</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Link href="/appointment">
                      <button className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all flex items-center justify-center gap-1 group/btn">
                        Book Appointment <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3} className="text-center mt-10">
            <Link href="/doctors"><Button variant="outline" className="rounded-full border-white/[0.08] text-white/50 hover:text-white px-6 hover:bg-white/[0.04]">View All Doctors <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 5 — LOCATIONS ═══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] mx-auto mb-6">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium uppercase tracking-wider">Our Locations</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Two Branches, One <span className="gradient-text">AI Network</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { city: "Islamabad", desc: "Capital Territory branch with Dr. Aleem and Dr. Mohsin", doctors: ["Dr. Aleem", "Dr. Mohsin"], emoji: "🏛️", gradient: "from-blue-500/20 via-blue-500/5 to-transparent" },
              { city: "Multan", desc: "South Punjab branch with Dr. Aleem and Dr. Zain", doctors: ["Dr. Aleem", "Dr. Zain"], emoji: "🕌", gradient: "from-violet-500/20 via-violet-500/5 to-transparent" },
            ].map((loc, i) => (
              <motion.div key={loc.city} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-2xl p-8 hover:bg-white/[0.05] transition-all h-full relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${loc.gradient}`} />
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i }} className="text-4xl mb-3 block">{loc.emoji}</motion.span>
                      <h3 className="text-2xl font-bold text-white">{loc.city}</h3>
                      <p className="text-sm text-white/35 mt-1">{loc.desc}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-medium">Open</span>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-white/40"><Clock className="w-4 h-4 text-blue-400/60" /> 3:00 PM — 12:00 AM (Break: 8-9 PM)</div>
                    <div className="flex items-center gap-3 text-sm text-white/40"><Phone className="w-4 h-4 text-blue-400/60" /> +92 440-684-8838</div>
                    <div className="flex items-center gap-3 text-sm text-white/40"><Users className="w-4 h-4 text-blue-400/60" /> {loc.doctors.join(", ")}</div>
                  </div>
                  <Link href="/appointment">
                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/15 text-sm text-blue-400 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all flex items-center justify-center gap-1">Book at {loc.city} <ArrowRight className="w-3.5 h-3.5" /></button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — AI ANALYTICS ═══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/[0.08] border border-amber-500/[0.15] mx-auto mb-6">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300 font-medium uppercase tracking-wider">AI Analytics</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Data-Driven <span className="gradient-text">Healthcare Insights</span></motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Patient Flow", desc: "Real-time volume tracking", chart: [40, 55, 45, 70, 60, 85, 75, 90, 50, 65, 55, 80], color: "from-blue-500 to-cyan-500", metric: 1247, suffix: "", metricLabel: "Total Patients" },
              { title: "AI Performance", desc: "Voice agent accuracy", chart: [60, 75, 80, 85, 88, 90, 92, 94, 91, 93, 95, 94], color: "from-emerald-500 to-teal-500", metric: 94, suffix: "%", metricLabel: "Resolution Rate" },
              { title: "Appointments", desc: "Booking efficiency", chart: [30, 45, 55, 40, 60, 50, 75, 65, 80, 70, 85, 78], color: "from-violet-500 to-purple-500", metric: 38, suffix: "", metricLabel: "Today" },
            ].map((card, i) => (
              <motion.div key={card.title} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-xl p-6 h-full hover:bg-white/[0.05] transition-all group">
                  <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                  <p className="text-[11px] text-white/25 mb-6">{card.desc}</p>
                  <div className="flex items-end gap-[3px] h-20 mb-6">
                    {card.chart.map((h, j) => (
                      <AnimatedBar key={j} height={h} delay={0.2 + j * 0.04} />
                    ))}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                        <CountUp end={card.metric} suffix={card.suffix} />
                      </div>
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

      {/* ═══ SECTION 7 — HOW IT WORKS ═══ */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mx-auto mb-6">
              <Workflow className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">How It Works</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">AI-Powered <span className="gradient-text">Workflow</span></motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/35 mt-4 max-w-xl mx-auto">From phone call to confirmed appointment — fully automated in seconds.</motion.p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {workflowSteps.map((step, i) => (
              <motion.div key={step.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-xl p-6 text-center h-full hover:bg-white/[0.05] transition-all group relative">
                  <div className="text-[11px] font-bold text-white/10 mb-4 font-mono">{step.step}</div>
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={4} className="mt-16 max-w-4xl mx-auto">
            <div className="glass-card rounded-xl p-6">
              <h4 className="text-sm font-semibold text-white/50 mb-5 text-center flex items-center justify-center gap-2">
                <Layers className="w-4 h-4" /> Voice AI Pipeline
              </h4>
              <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px]">
                {[
                  { label: "📞 Phone Call", c: "bg-blue-500/10 border-blue-500/15 text-blue-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🎙️ LiveKit SIP", c: "bg-violet-500/10 border-violet-500/15 text-violet-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🗣️ Whisper STT", c: "bg-cyan-500/10 border-cyan-500/15 text-cyan-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🧠 GPT-4o", c: "bg-emerald-500/10 border-emerald-500/15 text-emerald-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "⚙️ 24-State FSM", c: "bg-amber-500/10 border-amber-500/15 text-amber-300" },
                  { label: "→", c: "text-white/10 border-transparent bg-transparent" },
                  { label: "🔊 OpenAI TTS", c: "bg-rose-500/10 border-rose-500/15 text-rose-300" },
                ].map((item, i) => (
                  <motion.span key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.06 }}
                    className={`px-3 py-2 rounded-lg border ${item.c} font-medium`}
                  >{item.label}</motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 8 — FEATURES GRID ═══ */}
      <section id="features" className="relative py-32 px-6">
        <div className="absolute inset-0"><div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[150px]" /></div>
        <div className="max-w-7xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mx-auto mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium uppercase tracking-wider">Platform Features</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">Everything Your Hospital <span className="gradient-text">Needs</span></motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-2xl p-6 h-full hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${f.color} opacity-[0.03] rounded-full blur-[40px] group-hover:opacity-[0.06] transition-opacity`} />
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
