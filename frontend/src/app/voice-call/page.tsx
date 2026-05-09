"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, Bot,
  Sparkles, ArrowRight, MessageSquare, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const sampleConversation = [
  { role: "ai", text: "Aleem Hospital, AI Receptionist speaking. How can I help you today?" },
  { role: "user", text: "I'd like to book an appointment with Dr. Aleem." },
  { role: "ai", text: "Sure! Dr. Aleem is available at both Islamabad and Multan. Which location do you prefer?" },
  { role: "user", text: "Islamabad please." },
  { role: "ai", text: "Dr. Aleem is available tomorrow at 3:30 PM, 4:00 PM, and 5:30 PM. Which slot works for you?" },
  { role: "user", text: "4 PM would be great." },
  { role: "ai", text: "I've booked your appointment with Dr. Aleem at Islamabad for tomorrow at 4:00 PM. Is there anything else?" },
];

const capabilities = [
  "Book new appointments",
  "Check doctor availability",
  "Reschedule existing appointments",
  "Cancel appointments",
  "Get location & hours info",
  "Answer common health queries",
];

export default function VoiceCallPage() {
  const [calling, setCalling] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (calling) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      // Simulate messages appearing
      const msgInterval = setInterval(() => {
        setVisibleMessages(v => {
          if (v >= sampleConversation.length) {
            clearInterval(msgInterval);
            return v;
          }
          return v + 1;
        });
      }, 2500);
      return () => { clearInterval(timerRef.current!); clearInterval(msgInterval); };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
      setVisibleMessages(0);
    }
  }, [calling]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-10 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-emerald-500/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">AI Voice Assistant</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Call Our <span className="gradient-text">AI Receptionist</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-white/40 max-w-lg mx-auto">
            Book appointments, check availability, and more — all through natural voice conversation with our AI.
          </motion.p>
        </div>
      </section>

      {/* Call Interface */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Phone UI */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="glass rounded-2xl p-8 text-center">
              {/* Waveform */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className={`absolute inset-0 rounded-full ${calling ? "bg-emerald-500/10" : "bg-blue-500/10"} transition-colors`} />
                {calling && (
                  <>
                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-emerald-500/20" />
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 rounded-full bg-emerald-500/15" />
                  </>
                )}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Bot className={`w-12 h-12 ${calling ? "text-emerald-400" : "text-blue-400/60"}`} />
                </div>
              </div>

              {/* Status */}
              <h3 className="text-lg font-semibold mb-1">
                {calling ? "Connected to AI Receptionist" : "AI Receptionist"}
              </h3>
              <p className="text-sm text-white/30 mb-1">+92 440-684-8838</p>
              {calling && (
                <p className="text-xs text-emerald-400/60 mb-4 font-mono">{formatTime(elapsed)}</p>
              )}

              {/* Waveform bars */}
              {calling && (
                <div className="flex items-center justify-center gap-1 h-8 mb-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 20 + Math.random() * 16, 8] }}
                      transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1 rounded-full bg-emerald-400/40"
                    />
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mt-6">
                {calling && (
                  <button
                    onClick={() => setMuted(!muted)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      muted ? "bg-red-500/20 text-red-400" : "bg-white/[0.06] text-white/40 hover:bg-white/[0.1]"
                    }`}
                  >
                    {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}

                <button
                  onClick={() => setCalling(!calling)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    calling
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
                  }`}
                >
                  {calling ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                </button>

                {calling && (
                  <button className="w-12 h-12 rounded-full bg-white/[0.06] text-white/40 flex items-center justify-center hover:bg-white/[0.1]">
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!calling && (
                <p className="text-xs text-white/20 mt-4">Click the green button to start a demo call</p>
              )}
            </div>
          </motion.div>

          {/* Conversation Preview */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <div className="glass rounded-2xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-white/30" />
                <span className="text-sm text-white/40 font-medium">Conversation {calling ? "— Live" : "Preview"}</span>
                {calling && <Activity className="w-3 h-3 text-emerald-400 animate-pulse ml-auto" />}
              </div>

              <div className="space-y-3 min-h-[300px]">
                {(calling ? sampleConversation.slice(0, visibleMessages) : sampleConversation).map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={calling ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500/10 text-blue-200/70 rounded-br-sm"
                        : "bg-white/[0.04] text-white/50 rounded-bl-sm"
                    }`}>
                      {msg.role === "ai" && <Bot className="w-3.5 h-3.5 text-emerald-400/50 inline mr-1.5" />}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-2xl font-bold text-center mb-8">
            What Our AI Can Do
          </motion.h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {capabilities.map((cap, i) => (
              <motion.div key={cap} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-emerald-400/60" />
                  </div>
                  <span className="text-sm text-white/50">{cap}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Phone CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="glass rounded-2xl p-8">
            <Phone className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Call Now</h2>
            <p className="text-white/35 mb-6 text-sm">Dial our AI receptionist directly on your phone:</p>
            <a href="tel:+924406848838" className="text-3xl font-bold gradient-text tracking-wider mb-6 block">
              +92 440-684-8838
            </a>
            <p className="text-xs text-white/20 mb-6">Available 3:00 PM — 12:00 AM (Break 8–9 PM)</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="tel:+924406848838">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-8 h-12 font-semibold">
                  <Phone className="w-4 h-4 mr-2" /> Call AI Receptionist
                </Button>
              </a>
              <Link href="/appointment">
                <Button size="lg" variant="outline" className="rounded-full border-white/[0.08] text-white px-8 h-12">
                  Book Online Instead <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
