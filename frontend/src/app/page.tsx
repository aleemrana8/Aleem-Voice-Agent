"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mic, Calendar, Brain, Activity, Phone, Shield,
  ChevronRight, Sparkles, BarChart3, Stethoscope,
  Clock, Zap, Globe, HeartPulse, Users, Bot,
  ArrowRight, Play, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const features = [
  { icon: Bot, title: "AI Voice Receptionist", desc: "24/7 intelligent call handling with natural conversation", color: "from-blue-500 to-cyan-500" },
  { icon: Calendar, title: "Smart Scheduling", desc: "Logic-driven appointment engine with conflict prevention", color: "from-violet-500 to-purple-500" },
  { icon: Brain, title: "AI Medical Notes", desc: "Automated clinical documentation from voice conversations", color: "from-emerald-500 to-teal-500" },
  { icon: Activity, title: "Realtime Dashboard", desc: "Live hospital operations with AI-powered analytics", color: "from-orange-500 to-amber-500" },
  { icon: HeartPulse, title: "EHR System", desc: "Complete electronic health records with AI assistance", color: "from-rose-500 to-pink-500" },
  { icon: Shield, title: "HIPAA Compliant", desc: "Enterprise-grade security and audit compliance", color: "from-indigo-500 to-blue-500" },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 2s", label: "Response Time" },
  { value: "50K+", label: "Calls Handled" },
  { value: "24/7", label: "AI Available" },
];

const workflowSteps = [
  { step: "01", title: "Patient Calls", desc: "AI answers instantly with natural greeting" },
  { step: "02", title: "Intent Detection", desc: "AI understands booking, reschedule, or inquiry" },
  { step: "03", title: "Smart Processing", desc: "Backend validates availability & business rules" },
  { step: "04", title: "Confirmation", desc: "Patient gets instant confirmation & EHR syncs" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/[0.02] rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-white/[0.04]"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060a14] animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">Aleem Hospital</span>
            <span className="block text-[10px] text-blue-400 font-medium tracking-widest uppercase">AI-Powered EHR</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#voice" className="hover:text-white transition-colors">Voice AI</a>
          <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
          <a href="#security" className="hover:text-white transition-colors">Security</a>
        </div>
        <Link href="/login">
          <Button className="bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.08] rounded-full px-6">
            Sign In <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-16 pt-20 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-8"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Next-Generation AI Healthcare Platform</span>
          </motion.div>

          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8"
          >
            <span className="gradient-text-hero">Healthcare</span>
            <br />
            <span className="text-white/40">Reimagined with</span>
            <br />
            <span className="gradient-text">Artificial Intelligence</span>
          </motion.h1>

          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AI voice receptionist, smart scheduling, real-time EHR, and predictive analytics —
            all in one platform built for modern hospitals.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/25">
                Enter Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white">
              <Play className="w-4 h-4 mr-2" /> Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{s.value}</div>
                <div className="text-sm text-white/30 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="max-w-5xl mx-auto mt-20"
        >
          <div className="glass rounded-2xl p-1 glow-blue">
            <div className="rounded-xl bg-[#0a0f1a] p-6 space-y-4">
              {/* Mock top bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="text-xs text-white/20 font-mono">aleem-hospital.ai/dashboard</div>
                <div />
              </div>
              {/* Mock dashboard content */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Active Patients", val: "1,247", color: "from-blue-500/20 to-blue-500/5" },
                  { label: "Today's Appointments", val: "38", color: "from-emerald-500/20 to-emerald-500/5" },
                  { label: "AI Calls Handled", val: "156", color: "from-violet-500/20 to-violet-500/5" },
                  { label: "Revenue Today", val: "$12.4K", color: "from-amber-500/20 to-amber-500/5" },
                ].map((c) => (
                  <div key={c.label} className={`rounded-lg bg-gradient-to-b ${c.color} border border-white/[0.04] p-4`}>
                    <div className="text-xs text-white/40">{c.label}</div>
                    <div className="text-xl font-bold mt-1">{c.val}</div>
                  </div>
                ))}
              </div>
              {/* Mock chart area */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 h-40 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-end p-4 gap-1">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-blue-500/40 to-blue-500/10 rounded-t"
                    />
                  ))}
                </div>
                <div className="h-40 rounded-lg bg-white/[0.02] border border-white/[0.04] p-4 flex flex-col justify-center items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-emerald-400">94%</span>
                  </div>
                  <span className="text-xs text-white/30 mt-2">AI Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 lg:px-16 py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0} className="text-center mb-16"
          >
            <span className="text-sm font-medium text-blue-400 tracking-widest uppercase">Platform Features</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              Everything Your Hospital Needs
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">
              A complete AI-powered operating system for modern healthcare facilities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="glass rounded-2xl p-6 h-full hover:bg-white/[0.05] transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Agent Section */}
      <section id="voice" className="relative z-10 px-6 lg:px-16 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={fadeUp} custom={0} className="text-sm font-medium text-cyan-400 tracking-widest uppercase">
                AI Voice Agent
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
                Your 24/7 AI{" "}
                <span className="gradient-text">Receptionist</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/40 mt-6 leading-relaxed">
                Handles patient calls naturally — booking appointments, answering questions,
                and managing schedules while maintaining complete EHR integration.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="mt-8 space-y-4">
                {[
                  "Natural language understanding with intent detection",
                  "Logic-driven workflow engine — not prompt-based",
                  "Real-time EHR sync for every interaction",
                  "Smart scheduling with conflict prevention",
                  "Call recording & AI-generated transcripts",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Voice Agent Demo Card */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}
            >
              <div className="glass rounded-2xl p-6 glow-cyan">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Aleem AI Agent</div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-400">Active</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { role: "ai", text: "Assalam-o-Alaikum! Welcome to Aleem Hospital. I'm your AI assistant. How may I help you?" },
                    { role: "patient", text: "I need to book an appointment with Dr. Aleem" },
                    { role: "ai", text: "I'd be happy to help! Let me check Dr. Aleem's availability. Could you share your phone number?" },
                    { role: "patient", text: "It's 0300-1234567" },
                    { role: "ai", text: "Thank you! Dr. Aleem is available tomorrow at 3:30 PM and 4:00 PM. Which slot works for you?" },
                  ].map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                      className={`rounded-xl px-4 py-3 text-sm ${
                        msg.role === "ai"
                          ? "bg-blue-500/10 border border-blue-500/20 ml-0 mr-8"
                          : "bg-white/[0.04] border border-white/[0.06] ml-8 mr-0"
                      }`}
                    >
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                        {msg.role === "ai" ? "AI Agent" : "Patient"}
                      </span>
                      <p className="mt-1 text-white/70">{msg.text}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Waveform */}
                <div className="mt-6 flex items-center justify-center gap-[3px] h-8">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div key={i}
                      animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.05 }}
                      className="w-[3px] bg-gradient-to-t from-cyan-500/30 to-cyan-400/60 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="relative z-10 px-6 lg:px-16 py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} custom={0} className="text-center mb-16"
          >
            <span className="text-sm font-medium text-violet-400 tracking-widest uppercase">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              Logic-Driven, Not Prompt-Based
            </h2>
            <p className="text-white/40 mt-4 max-w-xl mx-auto">
              Every action is governed by a state-machine workflow engine with backend business rules
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {workflowSteps.map((w, i) => (
              <motion.div key={w.step} initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="glass rounded-2xl p-6 text-center h-full relative">
                  <div className="text-4xl font-bold text-white/[0.06] mb-4">{w.step}</div>
                  <h3 className="font-semibold mb-2">{w.title}</h3>
                  <p className="text-sm text-white/40">{w.desc}</p>
                  {i < 3 && (
                    <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 hidden md:block" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="analytics" className="relative z-10 px-6 lg:px-16 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}
            >
              <div className="glass rounded-2xl p-6 glow-purple">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Patient Flow", val: "+23%", icon: Users, color: "text-blue-400" },
                    { label: "AI Efficiency", val: "94.2%", icon: Zap, color: "text-emerald-400" },
                    { label: "Avg Wait Time", val: "4 min", icon: Clock, color: "text-amber-400" },
                    { label: "Call Resolution", val: "97%", icon: Phone, color: "text-violet-400" },
                  ].map((m) => (
                    <div key={m.label} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                      <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
                      <div className="text-2xl font-bold">{m.val}</div>
                      <div className="text-xs text-white/30 mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 h-32 bg-white/[0.02] rounded-xl border border-white/[0.04] flex items-end p-4 gap-2">
                  {[30, 50, 35, 70, 45, 85, 55, 90, 65, 80, 95, 75, 88, 70, 92].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
                      className="flex-1 bg-gradient-to-t from-violet-500/40 to-violet-500/10 rounded-t"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={fadeUp} custom={0} className="text-sm font-medium text-violet-400 tracking-widest uppercase">
                AI Analytics
              </motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
                Predictive Insights,{" "}
                <span className="gradient-text">Not Just Reports</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/40 mt-6 leading-relaxed">
                AI-driven analytics that predict patient no-shows, optimize scheduling,
                and identify operational bottlenecks before they impact care.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="mt-8 grid grid-cols-2 gap-4">
                {["Real-time Metrics", "AI Predictions", "Custom Reports", "Trend Analysis"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-white/60">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="relative z-10 px-6 lg:px-16 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-8">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Enterprise Security</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight">
              HIPAA-Ready Architecture
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-white/40 mt-6 max-w-2xl mx-auto leading-relaxed">
              Built with healthcare compliance in mind — JWT authentication, role-based access control,
              complete audit trails, and encrypted data at rest and in transit.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {["JWT Auth", "RBAC", "Audit Logs", "Encryption"].map((item) => (
                <div key={item} className="glass rounded-xl p-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-16 py-32">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 text-center glow-blue relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-cyan-500/[0.05]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Hospital?</h2>
              <p className="text-white/40 mb-8 max-w-lg mx-auto">
                Experience the future of healthcare management with AI-powered operations
              </p>
              <Link href="/login">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full px-10 h-12 text-base font-semibold shadow-lg shadow-blue-500/25">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 lg:px-16 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Aleem Hospital</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <span>Islamabad</span>
            <span>•</span>
            <span>Multan</span>
            <span>•</span>
            <span>3 PM – 12 AM</span>
          </div>
          <p className="text-sm text-white/20">© 2026 Aleem Hospital. AI-Powered EHR.</p>
        </div>
      </footer>
    </div>
  );
}
