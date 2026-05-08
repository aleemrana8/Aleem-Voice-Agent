"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, RefreshCw, CheckCircle2, XCircle, Clock,
  Database, ArrowUpRight, Activity, Layers, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

// Simulated EHR sync data (replace with real API)
const syncLogs = [
  { id: 1, type: "patient_created", entity: "Muhammad Aleem", status: "synced", timestamp: "2024-05-09 18:32:15", details: "Patient record synced to EHR" },
  { id: 2, type: "appointment_booked", entity: "APT-001234", status: "synced", timestamp: "2024-05-09 18:15:42", details: "Appointment synced with scheduling module" },
  { id: 3, type: "patient_updated", entity: "Ahmad Khan", status: "synced", timestamp: "2024-05-09 17:55:10", details: "Contact information updated" },
  { id: 4, type: "appointment_cancelled", entity: "APT-001230", status: "synced", timestamp: "2024-05-09 16:20:33", details: "Cancellation synced" },
  { id: 5, type: "patient_created", entity: "Sara Malik", status: "failed", timestamp: "2024-05-09 15:45:00", details: "Duplicate phone number detected" },
  { id: 6, type: "appointment_booked", entity: "APT-001228", status: "synced", timestamp: "2024-05-09 14:10:22", details: "Dr. Mohsin consultation booked" },
  { id: 7, type: "patient_created", entity: "Zain Abbas", status: "synced", timestamp: "2024-05-08 21:30:15", details: "Voice agent registration synced" },
  { id: 8, type: "appointment_rescheduled", entity: "APT-001225", status: "synced", timestamp: "2024-05-08 19:45:33", details: "Rescheduled via AI voice agent" },
];

export default function AdminEHRRecordsPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? syncLogs : syncLogs.filter(l => l.status === filter);
  const synced = syncLogs.filter(l => l.status === "synced").length;
  const failed = syncLogs.filter(l => l.status === "failed").length;

  const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
    synced: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    failed: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10" },
    pending: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" },
  };

  const typeIcons: Record<string, string> = {
    patient_created: "🧑",
    patient_updated: "✏️",
    appointment_booked: "📅",
    appointment_cancelled: "❌",
    appointment_rescheduled: "🔄",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white tracking-tight">EHR Records</h1>
        <p className="text-white/30 text-sm">Electronic health record sync logs and data integrity</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Syncs", value: syncLogs.length, icon: Database, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Successful", value: synced, icon: CheckCircle2, color: "from-emerald-500/10 to-emerald-500/5" },
            { label: "Failed", value: failed, icon: XCircle, color: "from-red-500/10 to-red-500/5" },
            { label: "Sync Rate", value: `${Math.round((synced / syncLogs.length) * 100)}%`, icon: Activity, color: "from-violet-500/10 to-violet-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] p-4`}>
              <s.icon className="w-5 h-5 text-white/30 mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <div className="flex gap-1.5">
          {["all", "synced", "failed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize ${
                filter === f
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "bg-white/[0.03] text-white/30 border border-white/[0.04] hover:bg-white/[0.06]"
              }`}
            >{f}</button>
          ))}
        </div>
      </motion.div>

      {/* Sync Logs */}
      <div className="space-y-2">
        {filtered.map((log, i) => {
          const sc = statusColors[log.status] || statusColors.synced;
          return (
            <motion.div key={log.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
              <div className="glass rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center text-lg shrink-0">
                      {typeIcons[log.type] || "📋"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-white/80 truncate">{log.entity}</p>
                        <span className="text-[9px] text-white/15 bg-white/[0.03] px-2 py-0.5 rounded-full capitalize">
                          {log.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/25 mt-0.5">{log.details}</p>
                      <p className="text-[9px] text-white/15 mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text} shrink-0`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {log.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
