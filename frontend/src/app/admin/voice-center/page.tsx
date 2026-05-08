"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneIncoming, PhoneOutgoing, Mic, Bot, Activity,
  Clock, TrendingUp, Users, Zap, Pause, Play, Volume2,
  ChevronRight, BarChart3, Layers, ArrowUpRight, Brain,
  CheckCircle2, AlertCircle, XCircle, MessageSquare,
} from "lucide-react";
import { getCallLogs, getCallTranscript, createCallsWebSocket } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

// FSM state labels for display
const stateLabels: Record<string, { label: string; color: string }> = {
  greeting: { label: "Greeting", color: "text-blue-400" },
  identify_intent: { label: "Identify Intent", color: "text-violet-400" },
  ask_patient_type: { label: "Patient Type", color: "text-cyan-400" },
  collect_name: { label: "Collect Name", color: "text-blue-400" },
  spell_name: { label: "Spelling Name", color: "text-indigo-400" },
  confirm_spelling: { label: "Confirm Spelling", color: "text-amber-400" },
  lookup_patient: { label: "Looking Up Patient", color: "text-teal-400" },
  collect_dob: { label: "Collect DOB", color: "text-blue-400" },
  collect_phone: { label: "Collect Phone", color: "text-blue-400" },
  register_patient: { label: "Registering", color: "text-emerald-400" },
  choose_location: { label: "Choose Location", color: "text-violet-400" },
  choose_provider: { label: "Choose Provider", color: "text-purple-400" },
  choose_date: { label: "Choose Date", color: "text-blue-400" },
  offer_slots: { label: "Offer Slots", color: "text-cyan-400" },
  confirm_booking: { label: "Confirm Booking", color: "text-amber-400" },
  booking_complete: { label: "Booking Complete", color: "text-emerald-400" },
  find_appointment: { label: "Finding Appointment", color: "text-teal-400" },
  confirm_reschedule: { label: "Reschedule", color: "text-amber-400" },
  confirm_cancel: { label: "Cancel Confirm", color: "text-red-400" },
  general_info: { label: "General Info", color: "text-blue-400" },
  escalate: { label: "Escalated", color: "text-red-400" },
  farewell: { label: "Farewell", color: "text-emerald-400" },
  error_recovery: { label: "Error Recovery", color: "text-amber-400" },
  fallback: { label: "Fallback", color: "text-red-400" },
};

export default function AdminVoiceCenterPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const fetchCalls = async () => {
    try {
      const data = await getCallLogs({});
      setCalls(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCalls();
    const ws = createCallsWebSocket();
    if (ws) {
      ws.onmessage = () => fetchCalls();
      return () => ws.close();
    }
  }, []);

  const selectCall = async (call: any) => {
    setSelectedCall(call);
    setTranscript([]);
    setLoadingTranscript(true);
    try {
      const t = await getCallTranscript(call.id);
      setTranscript(t || []);
    } catch { setTranscript([]); }
    finally { setLoadingTranscript(false); }
  };

  // Compute stats
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === "completed").length;
  const avgDuration = totalCalls > 0
    ? Math.round(calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / totalCalls)
    : 0;
  const activeCalls = calls.filter(c => c.status === "in_progress").length;

  const intentBreakdown: Record<string, number> = {};
  calls.forEach(c => { if (c.intent) intentBreakdown[c.intent] = (intentBreakdown[c.intent] || 0) + 1; });

  const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
    completed: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    in_progress: { dot: "bg-cyan-400", text: "text-cyan-400", bg: "bg-cyan-500/10" },
    failed: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10" },
    escalated: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Voice Command Center</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/[0.08] border border-cyan-500/[0.15]">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-cyan-400 font-semibold">AI Active</span>
            </span>
          </div>
          <p className="text-white/30 text-sm">Monitor AI voice receptionist — 24-state FSM pipeline</p>
        </div>
      </motion.div>

      {/* AI System Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/[0.06] via-blue-500/[0.04] to-violet-500/[0.06]" />
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-cyan-500/[0.04] rounded-full blur-[100px]" />
          <div className="relative p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 shrink-0">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">24-State FSM Voice Receptionist</h3>
              <p className="text-sm text-white/35 max-w-xl">
                Real-time voice AI handling patient calls with natural conversation. 
                Pipeline: STT (Whisper) → Intent Extraction (GPT-4o) → FSM Engine → TTS (Alloy).
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 shrink-0">
              <div className="text-center px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xl font-bold text-white">{totalCalls}</p>
                <p className="text-[9px] text-white/25">Total Calls</p>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xl font-bold text-emerald-400">{activeCalls}</p>
                <p className="text-[9px] text-white/25">Active Now</p>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-xl font-bold text-white">{avgDuration}s</p>
                <p className="text-[9px] text-white/25">Avg Duration</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Calls Completed", value: completedCalls, icon: CheckCircle2, color: "from-emerald-500/10 to-emerald-500/5" },
            { label: "Success Rate", value: totalCalls > 0 ? `${Math.round((completedCalls / totalCalls) * 100)}%` : "—", icon: TrendingUp, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Avg Duration", value: `${Math.floor(avgDuration / 60)}m ${avgDuration % 60}s`, icon: Clock, color: "from-violet-500/10 to-violet-500/5" },
            { label: "Escalated", value: calls.filter(c => c.status === "escalated").length, icon: AlertCircle, color: "from-amber-500/10 to-amber-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] p-4`}>
              <s.icon className="w-5 h-5 text-white/30 mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Intent Breakdown */}
      {Object.keys(intentBreakdown).length > 0 && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <div className="glass rounded-xl p-5 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-4">Intent Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(intentBreakdown).sort((a, b) => b[1] - a[1]).map(([intent, count]) => (
                <div key={intent} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[11px] text-white/50 font-medium capitalize">{intent.replace(/_/g, " ")}</span>
                  <span className="text-[11px] text-blue-400 font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Call List + Transcript */}
      <div className={`grid gap-6 ${selectedCall ? "lg:grid-cols-5" : ""}`}>
        {/* Call List */}
        <div className={selectedCall ? "lg:col-span-3" : ""}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Call History</h3>
            <span className="text-[11px] text-white/20">{calls.length} calls</span>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
          ) : calls.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center border border-white/[0.04]">
              <Phone className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/20">No calls recorded yet</p>
              <p className="text-[11px] text-white/10 mt-1">AI voice calls will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {calls.map((call, i) => {
                const sc = statusColors[call.status] || statusColors.completed;
                return (
                  <motion.div key={call.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 4}>
                    <div
                      onClick={() => selectCall(call)}
                      className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 border ${
                        selectedCall?.id === call.id
                          ? "border-cyan-500/30 bg-cyan-500/[0.04]"
                          : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center shrink-0`}>
                            {call.status === "in_progress" ? (
                              <div className="relative">
                                <Phone className={`w-4 h-4 ${sc.text}`} />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                              </div>
                            ) : (
                              <PhoneIncoming className={`w-4 h-4 ${sc.text}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-medium text-white/80 truncate">
                                {call.patient_name || call.caller_phone || "Unknown Caller"}
                              </p>
                              {call.status === "in_progress" && (
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 text-[8px] font-bold uppercase">Live</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-white/25">
                              <span>{call.intent ? call.intent.replace(/_/g, " ") : "—"}</span>
                              <span>·</span>
                              <span>{Math.floor((call.duration_seconds || 0) / 60)}m {(call.duration_seconds || 0) % 60}s</span>
                              {call.created_at && <><span>·</span><span>{new Date(call.created_at).toLocaleString()}</span></>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {call.status}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-white/15" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Transcript Panel */}
        {selectedCall && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="glass rounded-xl border border-white/[0.06] sticky top-6">
              {/* Call Header */}
              <div className="p-5 border-b border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {selectedCall.patient_name || selectedCall.caller_phone || "Unknown"}
                      </h3>
                      <p className="text-[10px] text-white/25">{selectedCall.call_id}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCall(null)} className="text-white/30 hover:text-white rounded-lg h-8 w-8 p-0">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="px-2 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-[12px] font-bold text-white">{Math.floor((selectedCall.duration_seconds || 0) / 60)}:{String((selectedCall.duration_seconds || 0) % 60).padStart(2, "0")}</p>
                    <p className="text-[9px] text-white/20">Duration</p>
                  </div>
                  <div className="px-2 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-[12px] font-bold text-white capitalize">{selectedCall.intent?.replace(/_/g, " ") || "—"}</p>
                    <p className="text-[9px] text-white/20">Intent</p>
                  </div>
                  <div className="px-2 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                    <p className={`text-[12px] font-bold capitalize ${(statusColors[selectedCall.status] || statusColors.completed).text}`}>
                      {selectedCall.status}
                    </p>
                    <p className="text-[9px] text-white/20">Status</p>
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="p-5">
                <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Conversation Transcript</h4>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2" ref={transcriptRef}>
                  {loadingTranscript ? (
                    <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
                  ) : transcript.length === 0 ? (
                    <p className="text-[11px] text-white/15 text-center py-6">No transcript available</p>
                  ) : (
                    transcript.map((msg: any, i: number) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          msg.role === "assistant"
                            ? "bg-cyan-500/10"
                            : "bg-violet-500/10"
                        }`}>
                          {msg.role === "assistant" ? (
                            <Bot className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-violet-400" />
                          )}
                        </div>
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                          msg.role === "assistant"
                            ? "bg-cyan-500/[0.06] text-white/60 border border-cyan-500/10 rounded-tl-sm"
                            : "bg-violet-500/[0.06] text-white/60 border border-violet-500/10 rounded-tr-sm"
                        }`}>
                          {msg.content || msg.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
