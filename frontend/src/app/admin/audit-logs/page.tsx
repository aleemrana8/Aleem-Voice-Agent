"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Shield, Search, Clock, User, Calendar, FileText,
  Activity, Eye, Filter, ChevronRight, Database,
  Stethoscope, Phone, Edit2, Trash2, Plus, CheckCircle2,
} from "lucide-react";
import { getAuditLogs } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

const actionIcons: Record<string, any> = {
  patient_created: { icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  patient_updated: { icon: Edit2, color: "text-blue-400", bg: "bg-blue-500/10" },
  appointment_booked: { icon: Calendar, color: "text-violet-400", bg: "bg-violet-500/10" },
  appointment_cancelled: { icon: Trash2, color: "text-red-400", bg: "bg-red-500/10" },
  appointment_rescheduled: { icon: Calendar, color: "text-amber-400", bg: "bg-amber-500/10" },
  call_started: { icon: Phone, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  call_completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  login: { icon: User, color: "text-blue-400", bg: "bg-blue-500/10" },
};

const defaultAction = { icon: Activity, color: "text-white/40", bg: "bg-white/[0.04]" };

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getAuditLogs({ limit: 100 })
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actionTypes = ["all", ...Array.from(new Set(logs.map(l => l.action)))];

  const filtered = logs.filter(l => {
    if (filter !== "all" && l.action !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        l.action?.toLowerCase().includes(s) ||
        l.user?.toLowerCase().includes(s) ||
        l.resource_id?.toLowerCase().includes(s) ||
        JSON.stringify(l.details)?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const inputClass = "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
        <p className="text-white/30 text-sm">Complete audit trail of all system operations</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: logs.length, icon: Database, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Today", value: logs.filter(l => { const d = new Date(l.created_at); const now = new Date(); return d.toDateString() === now.toDateString(); }).length, icon: Clock, color: "from-violet-500/10 to-violet-500/5" },
            { label: "Action Types", value: new Set(logs.map(l => l.action)).size, icon: Stethoscope, color: "from-emerald-500/10 to-emerald-500/5" },
            { label: "Users", value: new Set(logs.map(l => l.user)).size, icon: User, color: "from-amber-500/10 to-amber-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] p-4`}>
              <s.icon className="w-5 h-5 text-white/30 mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="Search audit logs..." className={`pl-10 ${inputClass}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {actionTypes.slice(0, 8).map((a) => (
            <button key={a} onClick={() => setFilter(a)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all capitalize ${
                filter === a
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "bg-white/[0.03] text-white/25 border border-white/[0.04] hover:bg-white/[0.06]"
              }`}
            >{a === "all" ? "All" : a.replace(/_/g, " ")}</button>
          ))}
        </div>
      </motion.div>

      {/* Audit Log Timeline */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-white/[0.04]">
          <Shield className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/20">No audit logs found</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-white/[0.04]" />

          <div className="space-y-2">
            {filtered.map((log, i) => {
              const a = actionIcons[log.action] || defaultAction;
              const Icon = a.icon;
              const isExpanded = expanded === log.id;
              return (
                <motion.div key={log.id || i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
                  <div
                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                    className={`glass rounded-xl p-4 ml-10 border cursor-pointer transition-all ${
                      isExpanded ? "border-blue-500/20 bg-blue-500/[0.02]" : "border-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-[14px] w-[18px] h-[18px] rounded-full ${a.bg} border-2 border-[#0a0e1a] flex items-center justify-center`}>
                      <div className={`w-2 h-2 rounded-full ${a.color.replace("text-", "bg-")}`} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-4 h-4 ${a.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium text-white/80 capitalize">{log.action?.replace(/_/g, " ")}</p>
                            {log.resource_id && (
                              <span className="text-[9px] text-white/15 bg-white/[0.03] px-2 py-0.5 rounded-full">{log.resource_id}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/25">{log.user || "System"}</span>
                            <span className="text-[10px] text-white/10">·</span>
                            <span className="text-[10px] text-white/15">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-white/15 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && log.details && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-white/[0.04]">
                        <pre className="text-[10px] text-white/30 bg-white/[0.02] p-3 rounded-lg overflow-x-auto font-mono">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
