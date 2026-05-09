"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const sampleConversation = [
  { role: "ai", text: "Assalam-o-Alaikum! Welcome to Aleem Hospital. I'm your AI receptionist. How can I help you today?" },
  { role: "user", text: "I want to book an appointment with Dr. Aleem in Islamabad." },
  { role: "ai", text: "Sure! Let me check Dr. Aleem's availability at our Islamabad branch. When would you like to come in?" },
  { role: "user", text: "Tomorrow at 4 PM would be great." },
  { role: "ai", text: "Dr. Aleem has a slot available tomorrow at 4:00 PM. Can I have your name and phone number to confirm the booking?" },
];

export default function VoiceCallPage() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isCallActive) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      const msgInterval = setInterval(() => {
        setVisibleMessages((v) => {
          if (v >= sampleConversation.length) { clearInterval(msgInterval); return v; }
          return v + 1;
        });
      }, 2500);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); clearInterval(msgInterval); };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
      setVisibleMessages(0);
    }
  }, [isCallActive]);

  const formatElapsed = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">AI Voice Receptionist</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Talk to Our <span className="gradient-text">AI Assistant</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Call our AI receptionist to book appointments, check availability, or get hospital info — 24/7 instant response.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 pb-32">
        <div className="max-w-2xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="glass rounded-2xl overflow-hidden">
              {/* Call Header */}
              <div className="p-6 border-b border-white/[0.04] text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${isCallActive ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20" : "bg-white/[0.06]"}`}>
                  <Bot className={`w-10 h-10 ${isCallActive ? "text-white" : "text-white/30"}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">AI Receptionist</h3>
                <p className="text-sm text-white/30">Aleem Hospital · +92 440-6848-838</p>
                {isCallActive && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm text-emerald-400 font-mono">{formatElapsed(elapsed)}</span>
                  </div>
                )}
              </div>

              {/* Waveform */}
              {isCallActive && (
                <div className="px-6 py-4 flex items-center justify-center gap-[3px]">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div key={i}
                      className="w-[3px] rounded-full bg-gradient-to-t from-emerald-500 to-teal-400"
                      animate={{ height: isMuted ? 4 : [4, Math.random() * 30 + 8, 4] }}
                      transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, repeatType: "mirror", delay: i * 0.03 }}
                    />
                  ))}
                </div>
              )}

              {/* Conversation */}
              {isCallActive && visibleMessages > 0 && (
                <div className="px-6 pb-4 max-h-[300px] overflow-y-auto space-y-3">
                  {sampleConversation.slice(0, visibleMessages).map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-blue-500/10 border border-blue-500/20 text-blue-200" : "bg-white/[0.04] border border-white/[0.06] text-white/60"}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="p-6 border-t border-white/[0.04]">
                <div className="flex items-center justify-center gap-6">
                  {isCallActive && (
                    <button onClick={() => setIsMuted(!isMuted)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-red-500/20 text-red-400" : "bg-white/[0.06] text-white/40 hover:bg-white/[0.1]"}`}>
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                  <button onClick={() => setIsCallActive(!isCallActive)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${isCallActive ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20"}`}>
                    {isCallActive ? <PhoneOff className="w-6 h-6 text-white" /> : <Phone className="w-6 h-6 text-white" />}
                  </button>
                  {isCallActive && (
                    <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.06] text-white/40 hover:bg-white/[0.1] transition-all">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {!isCallActive && (
                  <p className="text-center text-sm text-white/20 mt-4">
                    Tap to start a simulated AI call demo
                  </p>
                )}
              </div>
            </div>

            {/* Call via phone */}
            <div className="mt-8 glass rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-semibold text-white/60">Call on Your Phone</h4>
              </div>
              <p className="text-sm text-white/30 mb-4">
                For real AI-powered booking, call our number directly from your phone. The AI will handle everything.
              </p>
              <a href="tel:4406848838">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-8 h-11 font-semibold">
                  <Phone className="w-4 h-4 mr-2" /> Call +92 440-6848-838
                </Button>
              </a>
            </div>

            {/* What AI Can Do */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                "Book appointments",
                "Check doctor availability",
                "Get hospital info & hours",
                "Cancel or reschedule",
              ].map((item) => (
                <div key={item} className="glass rounded-xl p-4 text-center">
                  <p className="text-sm text-white/40">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
