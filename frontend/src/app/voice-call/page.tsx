"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles,
  CheckCircle2, Brain, Calendar, Clock, ArrowRight, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground, GradientOrbs } from "@/components/public/animated-bg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const capabilities = [
  { icon: Calendar, title: "Book Appointments", desc: "Schedule with any doctor at any location through natural voice conversation.", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: Clock, title: "Reschedule & Cancel", desc: "Change or cancel existing appointments by simply telling the AI.", color: "from-violet-500/20 to-purple-500/20" },
  { icon: Brain, title: "Smart Understanding", desc: "GPT-4o powered intent extraction understands complex requests naturally.", color: "from-emerald-500/20 to-teal-500/20" },
  { icon: Zap, title: "Instant Processing", desc: "Real-time slot checking, conflict prevention, and instant confirmation.", color: "from-amber-500/20 to-orange-500/20" },
];

const demoConversation = [
  { role: "ai", text: "Hello! Welcome to Aleem Hospital. How can I help you today?" },
  { role: "user", text: "I'd like to book an appointment with Dr. Aleem for tomorrow." },
  { role: "ai", text: "I'd be happy to help! Let me check Dr. Aleem's availability for tomorrow. He has slots at 3:00 PM, 3:30 PM, 4:00 PM, and 4:30 PM. Which would you prefer?" },
  { role: "user", text: "4:00 PM please." },
  { role: "ai", text: "Great choice! I've booked your appointment with Dr. Aleem Rehman for tomorrow at 4:00 PM. You'll receive a confirmation shortly. Is there anything else?" },
];

function WaveformVisualization({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px] h-16">
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-blue-500 to-cyan-400"
          animate={active ? {
            height: [8, Math.random() * 50 + 12, 8],
            opacity: [0.3, 0.9, 0.3],
          } : { height: 4, opacity: 0.15 }}
          transition={active ? {
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.03,
          } : { duration: 0.5 }}
        />
      ))}
    </div>
  );
}

export default function VoiceCallPage() {
  const [demoActive, setDemoActive] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!demoActive) { setVisibleMessages(0); return; }
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setVisibleMessages(idx);
      if (idx >= demoConversation.length) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [demoActive]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleMessages]);

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">AI Voice Agent</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Talk to Our <span className="gradient-text">AI Doctor</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto mb-8">
            Our AI voice receptionist is available 24/7. Call to book, reschedule, or cancel appointments through natural conversation.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex gap-4 justify-center">
            <a href="tel:+924406848838">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-8 h-12 font-semibold text-base shadow-lg shadow-emerald-500/20">
                <Phone className="w-5 h-5 mr-2" /> Call +92 440-684-8838
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Demo Call UI */}
      <section className="relative py-10 px-6">
        <GradientOrbs />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="glass-premium rounded-2xl overflow-hidden">
              {/* Call Header */}
              <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    {demoActive && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0a0f1e]" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/80">Aleem AI Assistant</div>
                    <div className={`text-[11px] ${demoActive ? "text-emerald-400" : "text-white/25"}`}>
                      {demoActive ? "Connected • Demo Mode" : "Ready to connect"}
                    </div>
                  </div>
                </div>
                {demoActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-300 font-medium">LIVE</span>
                  </motion.div>
                )}
              </div>

              {/* Waveform */}
              <div className="px-6 py-6 border-b border-white/[0.05]">
                <WaveformVisualization active={demoActive && visibleMessages < demoConversation.length} />
              </div>

              {/* Chat */}
              <div ref={chatRef} className="px-6 py-4 h-[250px] overflow-y-auto space-y-3">
                {!demoActive && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-white/20">Click &quot;Start Demo&quot; to see AI in action</p>
                  </div>
                )}
                {demoConversation.slice(0, visibleMessages).map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 text-white/80 rounded-br-md"
                        : "bg-white/[0.04] border border-white/[0.06] text-white/60 rounded-bl-md"
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {demoActive && visibleMessages >= demoConversation.length && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-300">Appointment booked successfully</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Controls */}
              <div className="px-6 py-4 border-t border-white/[0.05] flex items-center justify-center gap-4">
                {!demoActive ? (
                  <Button onClick={() => setDemoActive(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-8 h-12 font-semibold shadow-lg shadow-emerald-500/20">
                    <Phone className="w-5 h-5 mr-2" /> Start Demo Call
                  </Button>
                ) : (
                  <>
                    <button className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.1] transition-colors">
                      <Mic className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.1] transition-colors">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setDemoActive(false); setVisibleMessages(0); }}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 hover:scale-105 transition-transform">
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mx-auto mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium uppercase tracking-wider">Capabilities</span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold">What Our AI Can <span className="gradient-text">Do</span></motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-6">
            {capabilities.map((c, i) => (
              <motion.div key={c.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-xl p-6 hover:bg-white/[0.05] transition-all group h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <c.icon className="w-6 h-6 text-white/70" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{c.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phone CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Call?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-white/40 mb-2">Our AI voice agent is available right now.</motion.p>
            <motion.p variants={fadeUp} custom={2} className="text-3xl font-bold gradient-text mb-8">+92 440-684-8838</motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex gap-4 justify-center">
              <a href="tel:+924406848838">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl px-8 h-12 font-semibold text-base shadow-lg shadow-emerald-500/20">
                  <Phone className="w-5 h-5 mr-2" /> Call Now
                </Button>
              </a>
              <a href="/appointment">
                <Button variant="outline" className="border-white/[0.1] bg-white/[0.03] text-white rounded-xl px-6 h-12">
                  <Calendar className="w-5 h-5 mr-2" /> Book Online Instead
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
