"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Bot, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function VoiceAgentPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [transcript, setTranscript] = useState<{ speaker: string; text: string }[]>([]);

  const startCall = async () => {
    setCallStatus("connecting");
    setTimeout(() => {
      setCallStatus("active");
      setIsConnected(true);
      setTranscript([{ speaker: "agent", text: "Assalam-o-Alaikum! Welcome to Aleem Hospital. I'm your AI receptionist. How can I help you today?" }]);
    }, 2000);
  };

  const endCall = () => {
    setCallStatus("ended");
    setIsConnected(false);
    setTranscript((prev) => [...prev, { speaker: "agent", text: "Thank you for calling Aleem Hospital. Have a great day!" }]);
  };

  const simulatePatientSpeech = () => {
    const messages = [
      "I'd like to book an appointment with Dr. Aleem",
      "Yes, my phone number is 0300-1234567",
      "My date of birth is 1990-05-15",
      "Tomorrow at 4 PM would be great",
      "It's for a general checkup",
    ];
    const responses = [
      "I'd be happy to help you book an appointment with Dr. Aleem. Could you please provide me with your phone number for verification?",
      "Thank you. For security, could you also confirm your date of birth?",
      "You're verified. Dr. Aleem is available tomorrow. What time works best? Available: 3:00 PM, 3:30 PM, 4:00 PM, 4:30 PM.",
      "4:00 PM works. What's the reason for your visit?",
      "Your appointment with Dr. Aleem is confirmed for tomorrow at 4:00 PM for a general checkup. You'll receive an SMS confirmation shortly. Anything else?",
    ];
    const idx = transcript.filter((t) => t.speaker === "patient").length;
    if (idx < messages.length) {
      setTranscript((prev) => [...prev, { speaker: "patient", text: messages[idx] }, { speaker: "agent", text: responses[idx] }]);
    }
  };

  const statusText = { idle: "Ready", connecting: "Connecting...", active: "Call Active", ended: "Call Ended" };
  const statusColor = { idle: "text-white/30 bg-white/[0.04]", connecting: "text-amber-400 bg-amber-500/10", active: "text-emerald-400 bg-emerald-500/10", ended: "text-white/30 bg-white/[0.04]" };

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white">Voice Agent</h1>
        <p className="text-white/30 text-sm">Test the Aleem AI receptionist</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call Controls */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
          <div className="glass rounded-xl p-6 h-full">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">Call Controls</h3>

            <div className="flex flex-col items-center gap-6">
              {/* Waveform visualization */}
              {callStatus === "active" && (
                <div className="flex items-center justify-center gap-[3px] h-12 w-full">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div key={i} animate={{ height: [3, Math.random() * 30 + 3, 3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.04 }}
                      className="w-[3px] bg-gradient-to-t from-cyan-500/30 to-cyan-400/60 rounded-full"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                {callStatus === "idle" || callStatus === "ended" ? (
                  <button onClick={startCall} className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
                    <Phone className="h-6 w-6 text-white" />
                  </button>
                ) : callStatus === "connecting" ? (
                  <button disabled className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center animate-pulse">
                    <Phone className="h-6 w-6 text-white" />
                  </button>
                ) : (
                  <>
                    <button onClick={() => setIsMuted(!isMuted)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-red-500/20 text-red-400" : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"}`}>
                      {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button onClick={endCall} className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/20">
                      <PhoneOff className="h-6 w-6 text-white" />
                    </button>
                  </>
                )}
              </div>

              <span className={`text-[11px] font-medium px-3 py-1.5 rounded-full ${statusColor[callStatus]}`}>
                {statusText[callStatus]}
              </span>

              {callStatus === "active" && (
                <Button onClick={simulatePatientSpeech} className="w-full bg-white/[0.06] hover:bg-white/[0.1] text-white/60 rounded-xl border border-white/[0.06]">
                  Simulate Patient Response
                </Button>
              )}

              <div className="w-full rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <p className="text-xs font-medium text-white/40 mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3" />Voice Pipeline</p>
                <div className="space-y-1 text-[11px] text-white/20">
                  <p>1. Audio In → LiveKit → Whisper.cpp (STT)</p>
                  <p>2. Text → OpenAI GPT-4o (LLM + Function Calling)</p>
                  <p>3. Response → Coqui TTS → Audio Out</p>
                  <p>4. Pipeline orchestrated by Pipecat AI</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Transcript */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="glass rounded-xl p-6 h-full flex flex-col">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Live Transcript</h3>
            <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3">
              {transcript.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-8">Start a call to see the live transcript</p>
              ) : (
                transcript.map((entry, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div className={`rounded-xl px-4 py-3 text-sm ${
                      entry.speaker === "agent"
                        ? "bg-blue-500/[0.06] border border-blue-500/10 ml-0 mr-6"
                        : "bg-white/[0.02] border border-white/[0.04] ml-6 mr-0"
                    }`}>
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                        {entry.speaker === "agent" ? "AI Agent" : "Patient"}
                      </span>
                      <p className="mt-1 text-white/60">{entry.text}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
