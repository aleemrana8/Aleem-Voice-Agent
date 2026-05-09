"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, Sparkles,
  Brain, Calendar, Clock, Zap, Loader2, Signal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground, GradientOrbs } from "@/components/public/animated-bg";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  useTrackTranscription,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const capabilities = [
  { icon: Calendar, title: "Book Appointments", desc: "Schedule with any doctor at any location through natural voice conversation.", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: Clock, title: "Reschedule & Cancel", desc: "Change or cancel existing appointments by simply telling the AI.", color: "from-violet-500/20 to-purple-500/20" },
  { icon: Brain, title: "Smart Understanding", desc: "GPT-4o powered AI understands complex requests naturally.", color: "from-emerald-500/20 to-teal-500/20" },
  { icon: Zap, title: "Instant Processing", desc: "Real-time slot checking, conflict prevention, and instant confirmation.", color: "from-amber-500/20 to-orange-500/20" },
];

/* ─── Idle Waveform ──────────────────────────────────────────────── */
function WaveformIdle() {
  return (
    <div className="flex items-center justify-center gap-[3px] h-20">
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-blue-500/30 to-cyan-400/30"
          animate={{ height: [4, 8, 4], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

/* ─── Transcript message type ────────────────────────────────────── */
interface TranscriptMsg { id: string; role: "agent" | "user"; text: string; final: boolean; }

/* ─── Active Call (renders inside LiveKitRoom) ───────────────────── */
function ActiveCall({ onDisconnect }: { onDisconnect: () => void }) {
  const voiceAssistant = useVoiceAssistant();
  const [transcript, setTranscript] = useState<TranscriptMsg[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Find agent audio track for transcription
  const allTracks = useTracks([Track.Source.Microphone]);
  const agentTrack = allTracks.find(
    (t) => !t.participant.isLocal
  );
  const localTrack = allTracks.find(
    (t) => t.participant.isLocal
  );

  const agentTranscription = useTrackTranscription(agentTrack);
  const userTranscription = useTrackTranscription(localTrack);

  useEffect(() => {
    if (agentTranscription.segments.length > 0) {
      setTranscript((prev) => {
        const next = [...prev];
        for (const seg of agentTranscription.segments) {
          const idx = next.findIndex((m) => m.id === seg.id);
          if (idx >= 0) next[idx] = { id: seg.id, role: "agent", text: seg.text, final: seg.final };
          else next.push({ id: seg.id, role: "agent", text: seg.text, final: seg.final });
        }
        return next;
      });
    }
  }, [agentTranscription.segments]);

  useEffect(() => {
    if (userTranscription.segments.length > 0) {
      setTranscript((prev) => {
        const next = [...prev];
        for (const seg of userTranscription.segments) {
          const idx = next.findIndex((m) => m.id === seg.id);
          if (idx >= 0) next[idx] = { id: seg.id, role: "user", text: seg.text, final: seg.final };
          else next.push({ id: seg.id, role: "user", text: seg.text, final: seg.final });
        }
        return next;
      });
    }
  }, [userTranscription.segments]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  const agentState = voiceAssistant.state;

  return (
    <div className="glass-premium rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a0f1e]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white/90">Aleem AI Receptionist</div>
            <div className="text-[11px] text-emerald-400">
              {agentState === "listening" && "Listening..."}
              {agentState === "thinking" && "Thinking..."}
              {agentState === "speaking" && "Speaking..."}
              {agentState === "connecting" && "Connecting..."}
              {agentState === "initializing" && "Starting up..."}
              {(!agentState || agentState === "idle") && "Connected"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-300 font-medium">LIVE</span>
          </div>
          <span className="text-xs text-white/30 font-mono">{formatTime(callDuration)}</span>
        </div>
      </div>

      {/* Visualizer */}
      <div className="px-6 py-8 border-b border-white/[0.05] flex items-center justify-center">
        {voiceAssistant.audioTrack ? (
          <BarVisualizer state={agentState} barCount={32} trackRef={voiceAssistant.audioTrack} className="h-20" options={{ minHeight: 4 }} />
        ) : (
          <WaveformIdle />
        )}
      </div>

      {/* Transcript */}
      <div ref={chatRef} className="px-6 py-4 h-[280px] overflow-y-auto space-y-3">
        {transcript.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-white/20 animate-spin mx-auto mb-2" />
              <p className="text-sm text-white/20">Waiting for AI to respond...</p>
            </div>
          </div>
        )}
        {transcript.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 text-white/80 rounded-br-md"
                : "bg-white/[0.04] border border-white/[0.06] text-white/60 rounded-bl-md"
            } ${!msg.final ? "opacity-60" : ""}`}>
              <span className="text-[10px] uppercase tracking-wider text-white/25 block mb-1">
                {msg.role === "user" ? "You" : "AI Assistant"}
              </span>
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="px-6 py-5 border-t border-white/[0.05] flex items-center justify-center gap-5">
        <button className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.1] transition-colors">
          <Mic className="w-5 h-5" />
        </button>
        <button onClick={onDisconnect}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 hover:scale-105 transition-transform">
          <PhoneOff className="w-7 h-7" />
        </button>
        <button className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:bg-white/[0.1] transition-colors">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function VoiceCallPage() {
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(async () => {
    setConnectionState("connecting");
    setError(null);
    try {
      const resp = await fetch(`${API_URL}/api/v1/public/livekit/connect`, { method: "POST" });
      if (!resp.ok) throw new Error("Failed to connect");
      const data = await resp.json();
      setLivekitToken(data.caller_token);
      setLivekitUrl(data.livekit_url);
      setConnectionState("connected");
    } catch (e: any) {
      setError(e.message || "Connection failed");
      setConnectionState("error");
    }
  }, []);

  const endCall = useCallback(() => {
    setConnectionState("idle");
    setLivekitToken(null);
    setLivekitUrl(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15] mb-6">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">AI Voice Agent — Live</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Talk to Our <span className="gradient-text">AI Receptionist</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-white/40 max-w-2xl mx-auto mb-8">
            Start a live voice call with our AI. Book, reschedule, or cancel appointments instantly through natural conversation.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="flex gap-4 justify-center flex-wrap">
            <a href="tel:+924406848838">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-8 h-12 font-semibold text-base shadow-lg shadow-blue-500/20">
                <Phone className="w-5 h-5 mr-2" /> Call +92 440-684-8838
              </Button>
            </a>
            <Button onClick={() => document.getElementById("live-call")?.scrollIntoView({ behavior: "smooth" })}
              variant="outline" className="border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300 rounded-xl px-8 h-12 font-semibold text-base hover:bg-emerald-500/[0.12]">
              <Signal className="w-5 h-5 mr-2" /> Start Web Call
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Live Call UI */}
      <section id="live-call" className="relative py-10 px-6">
        <GradientOrbs />
        <div className="max-w-2xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <AnimatePresence mode="wait">
              {connectionState === "connected" && livekitToken && livekitUrl ? (
                <motion.div key="connected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <LiveKitRoom token={livekitToken} serverUrl={livekitUrl} connect={true} audio={true} video={false} onDisconnected={endCall}>
                    <ActiveCall onDisconnect={endCall} />
                  </LiveKitRoom>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <div className="glass-premium rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/80">Aleem AI Receptionist</div>
                        <div className="text-[11px] text-white/25">{connectionState === "connecting" ? "Connecting..." : "Ready to connect"}</div>
                      </div>
                    </div>
                    <div className="px-6 py-8 border-b border-white/[0.05]"><WaveformIdle /></div>
                    <div className="px-6 py-4 h-[280px] flex items-center justify-center">
                      <div className="text-center">
                        {connectionState === "error" ? (
                          <>
                            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                              <PhoneOff className="w-7 h-7 text-red-400" />
                            </div>
                            <p className="text-sm text-red-400 mb-1">Connection failed</p>
                            <p className="text-xs text-white/20">{error}</p>
                          </>
                        ) : connectionState === "connecting" ? (
                          <>
                            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-3" />
                            <p className="text-sm text-white/40">Connecting to AI assistant...</p>
                          </>
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                              <Mic className="w-7 h-7 text-emerald-400" />
                            </div>
                            <p className="text-sm text-white/30 mb-1">Click below to start a live voice call</p>
                            <p className="text-xs text-white/15">Your browser will ask for microphone access</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="px-6 py-5 border-t border-white/[0.05] flex items-center justify-center">
                      <Button onClick={startCall} disabled={connectionState === "connecting"}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full px-10 h-14 font-semibold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all disabled:opacity-50">
                        {connectionState === "connecting" ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Connecting...</>
                        ) : connectionState === "error" ? (
                          <><Phone className="w-5 h-5 mr-2" />Try Again</>
                        ) : (
                          <><Phone className="w-5 h-5 mr-2" />Start Live Call</>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              Prefer to <span className="gradient-text">Call?</span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-white/40 mb-2">Our AI voice agent is also available by phone, 24/7.</motion.p>
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
