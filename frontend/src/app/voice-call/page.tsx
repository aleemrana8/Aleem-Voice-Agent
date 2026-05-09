"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Bot, User, Clock,
  Sparkles, Radio, Activity, CheckCircle2, ArrowRight, Globe, Brain,
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

const capabilities = [
  { icon: Phone, title: "Book Appointments", desc: "Schedule, reschedule, or cancel appointments through natural voice", color: "from-blue-500 to-cyan-500" },
  { icon: Globe, title: "Bilingual Support", desc: "Speaks fluent Urdu and English for all patients", color: "from-violet-500 to-purple-500" },
  { icon: Clock, title: "24/7 Available", desc: "Always on, no wait times, instant responses", color: "from-emerald-500 to-teal-500" },
  { icon: Brain, title: "13 AI Intents", desc: "Understands booking, rescheduling, cancellation, doctor info, and more", color: "from-amber-500 to-orange-500" },
];

const sampleConversation = [
  { role: "ai", text: "Assalam o Alaikum! Aleem Hospital mein khush amdeed. Main aapki kya madad kar sakti hoon?" },
  { role: "user", text: "Mujhe Dr. Aleem se appointment chahiye kal ke liye." },
  { role: "ai", text: "Bilkul! Dr. Aleem kal available hain. Kya aap sham 4:00 baje ka waqt pasand karenge?" },
  { role: "user", text: "Haan 4 baje theek hai." },
  { role: "ai", text: "Perfect! Aapki appointment Dr. Aleem ke saath kal 4:00 PM ko confirm ho gayi hai. Kya koi aur madad chahiye?" },
];

export default function VoiceCallPage() {
  const [demoActive, setDemoActive] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (demoActive) {
      setVisibleMessages(0);
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
      const timers = sampleConversation.map((_, i) => setTimeout(() => setVisibleMessages(i + 1), (i + 1) * 2200));
      return () => { timers.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [demoActive]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[180px]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/[0.08] border border-cyan-500/[0.12] mb-6">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">AI Voice Agent</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.95]">
            Talk to Our <span className="gradient-text">AI Receptionist</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-white/35 max-w-2xl mx-auto mb-8">
            Call our AI-powered voice agent to book, reschedule, or cancel appointments. Natural conversation in Urdu and English.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+924406848838">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-8 h-14 text-lg font-semibold shadow-lg shadow-emerald-500/20">
                <Phone className="w-5 h-5 mr-2" /> Call +92 440-684-8838
              </Button>
            </a>
            <Button size="lg" variant="outline" onClick={() => setDemoActive(!demoActive)}
              className="rounded-full border-white/[0.08] text-white px-8 h-14 text-lg">
              {demoActive ? <><PhoneOff className="w-5 h-5 mr-2" />End Demo</> : <><Sparkles className="w-5 h-5 mr-2" />Try Demo</>}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Demo Call */}
      {demoActive && (
        <section className="px-6 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden">
              {/* Call Header */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/[0.04] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060a14]">
                      <div className="w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">Aleem Hospital AI</p>
                    <p className="text-[10px] text-emerald-400">Active Call</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  {formatTime(elapsed)}
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-[250px] max-h-[400px] overflow-y-auto">
                {sampleConversation.slice(0, visibleMessages).map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === "user" ? "bg-blue-500/10 text-blue-200 border border-blue-500/10" : "bg-white/[0.03] text-white/50 border border-white/[0.04]"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {visibleMessages < sampleConversation.length && (
                  <div className="flex items-center gap-2 text-white/15 text-xs">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    Listening...
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="border-t border-white/[0.04] p-4 flex items-center justify-center gap-4">
                <button className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30 hover:bg-white/[0.08] transition">
                  <Mic className="w-5 h-5" />
                </button>
                <button onClick={() => setDemoActive(false)}
                  className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition">
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* Capabilities */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.12] mb-4">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">What Our AI <span className="gradient-text">Can Do</span></h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5">
            {capabilities.map((cap, i) => (
              <motion.div key={cap.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
                <div className="glass-card rounded-xl p-6 h-full hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-br ${cap.color} opacity-[0.03] rounded-full blur-[50px] group-hover:opacity-[0.06] transition-opacity`} />
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                      <cap.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/70 mb-1">{cap.title}</h3>
                      <p className="text-sm text-white/30">{cap.desc}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-3xl md:text-4xl font-bold text-center mb-12">How It <span className="gradient-text-emerald">Works</span></motion.h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Call the Number", desc: "Dial +92 440-684-8838 from any phone." },
              { step: "2", title: "Speak Naturally", desc: "Tell the AI what you need — in Urdu or English." },
              { step: "3", title: "Get Confirmed", desc: "Receive instant confirmation for your appointment." },
            ].map((s, i) => (
              <motion.div key={s.step} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg shadow-blue-500/20">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-white/70 mb-1">{s.title}</h3>
                  <p className="text-sm text-white/30">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="text-3xl md:text-4xl font-bold mb-4">Ready to <span className="gradient-text">Call?</span></motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
            className="text-white/30 mb-8 max-w-lg mx-auto">Our AI receptionist is available 24/7. Or book online if you prefer.</motion.p>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+924406848838"><Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-8 h-12 font-semibold shadow-lg shadow-emerald-500/20"><Phone className="w-4 h-4 mr-2" /> Call Now</Button></a>
            <Link href="/appointment"><Button size="lg" variant="outline" className="rounded-full border-white/[0.08] text-white px-8 h-12">Book Online <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
