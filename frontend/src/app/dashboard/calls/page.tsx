"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getCallLogs, getCallTranscript } from "@/lib/api";
import { Phone, Clock, MessageSquare, Bot } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState<any>(null);
  const [transcriptCallId, setTranscriptCallId] = useState<string | null>(null);

  useEffect(() => {
    getCallLogs().then(setCalls).catch(console.error).finally(() => setLoading(false));
  }, []);

  const viewTranscript = async (callId: string) => {
    if (transcriptCallId === callId) { setSelectedTranscript(null); setTranscriptCallId(null); return; }
    try {
      const data = await getCallTranscript(callId);
      setSelectedTranscript(data);
      setTranscriptCallId(callId);
    } catch { alert("Transcript not found"); }
  };

  const statusConfig: Record<string, { color: string; bg: string }> = {
    in_progress: { color: "text-amber-400", bg: "bg-amber-500/10" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    failed: { color: "text-red-400", bg: "bg-red-500/10" },
    dropped: { color: "text-red-400", bg: "bg-red-500/10" },
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white">Call Center</h1>
        <p className="text-white/30 text-sm">AI voice agent call history and transcripts</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : calls.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-white/20">No call logs yet. Calls will appear when patients call the AI receptionist.</div>
      ) : (
        <div className="space-y-3">
          {calls.map((call, i) => {
            const sc = statusConfig[call.status] || statusConfig.completed;
            return (
              <div key={call.id}>
                <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                  <div className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">{call.patient_name || call.caller_phone}</p>
                          <div className="flex items-center gap-3 text-[11px] text-white/30">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(call.duration_seconds)}</span>
                            {call.intent && <span className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px]">{call.intent}</span>}
                          </div>
                          {call.summary && <p className="mt-1 text-[11px] text-white/20">{call.summary}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${sc.bg} ${sc.color}`}>{call.status}</span>
                        <Button variant="ghost" size="sm" onClick={() => viewTranscript(call.call_id)} className="text-white/40 hover:text-white hover:bg-white/[0.04] rounded-lg text-xs h-7 px-2">
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />Transcript
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {transcriptCallId === call.call_id && selectedTranscript && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="ml-6 mt-2">
                    <div className="glass rounded-xl p-4 border-l-2 border-l-blue-500/30">
                      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Conversation Transcript</h4>
                      <div className="space-y-2">
                        {selectedTranscript.entries?.length === 0 ? (
                          <p className="text-sm text-white/20">No transcript entries</p>
                        ) : (
                          selectedTranscript.entries?.map((entry: any, idx: number) => (
                            <div key={idx} className={`rounded-lg p-3 text-sm ${entry.speaker === "agent" ? "bg-blue-500/[0.06] border border-blue-500/10 ml-4" : "bg-white/[0.02] border border-white/[0.04] mr-4"}`}>
                              <p className="text-[10px] font-medium text-white/30 uppercase mb-1">{entry.speaker === "agent" ? "AI Agent" : "Patient"}</p>
                              <p className="text-white/60">{entry.text}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
