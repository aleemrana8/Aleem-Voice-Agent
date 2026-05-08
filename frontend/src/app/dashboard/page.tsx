"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Users, Stethoscope, Phone, TrendingUp, Clock,
  Activity, Sparkles, ArrowUpRight, Bot, Mic, CheckCircle2, AlertCircle,
} from "lucide-react";
import {
  getDashboardStats, getRecentAppointments, getRecentCalls,
  createDashboardWebSocket,
} from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, apptData, callsData] = await Promise.all([
        getDashboardStats(),
        getRecentAppointments(5),
        getRecentCalls(5),
      ]);
      setStats(statsData);
      setRecentAppointments(apptData);
      setRecentCalls(callsData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const ws = createDashboardWebSocket();
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (["appointment_created", "appointment_rescheduled", "appointment_cancelled", "call_started", "call_ended"].includes(data.type)) {
          fetchData();
        }
      };
      ws.onerror = () => {};
      return () => ws.close();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: "Total Patients", value: stats?.total_patients || 0, icon: Users, color: "from-blue-500 to-blue-600", trend: "+12%", up: true },
    { title: "Active Doctors", value: stats?.total_doctors || 0, icon: Stethoscope, color: "from-emerald-500 to-teal-600", trend: "3", up: true },
    { title: "Today's Appointments", value: stats?.today_appointments || 0, icon: Calendar, color: "from-violet-500 to-purple-600", trend: "+8%", up: true },
    { title: "Total Calls", value: stats?.total_calls || 0, icon: Phone, color: "from-amber-500 to-orange-600", trend: "+23%", up: true },
    { title: "Active Calls", value: stats?.active_calls || 0, icon: Activity, color: "from-rose-500 to-pink-600", trend: "Live", up: true },
    { title: "All Appointments", value: stats?.total_appointments || 0, icon: Clock, color: "from-indigo-500 to-blue-600", trend: "+15%", up: true },
  ];

  const statusConfig: Record<string, { color: string; bg: string }> = {
    scheduled: { color: "text-blue-400", bg: "bg-blue-500/10" },
    confirmed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    cancelled: { color: "text-red-400", bg: "bg-red-500/10" },
    rescheduled: { color: "text-amber-400", bg: "bg-amber-500/10" },
    in_progress: { color: "text-amber-400", bg: "bg-amber-500/10" },
    failed: { color: "text-red-400", bg: "bg-red-500/10" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </span>
        </div>
        <p className="text-white/30 text-sm">Aleem EHR — AI-Powered Operations Center</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
            <div className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <span className="flex items-center gap-0.5 text-[11px] text-emerald-400 font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-white/30 mt-1">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
        <div className="glass rounded-xl p-5 border-blue-500/10 bg-gradient-to-r from-blue-500/[0.04] to-cyan-500/[0.04]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">AI Insight</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Patient volume is 23% higher than average for this time. Consider extending Dr. Aleem&apos;s hours for the next 2 days.
                AI voice agent resolved 94% of calls without human handoff today.
              </p>
            </div>
            <div className="hidden sm:block">
              <a href="/dashboard/insights" className="text-[10px] text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full font-medium hover:bg-blue-500/20 transition-colors">View AI Insights →</a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Appointment Breakdown */}
      {stats?.appointment_breakdown && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Appointment Breakdown</h3>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-400">{stats.appointment_breakdown.scheduled}</p>
                <p className="text-xs text-white/30 mt-1">Scheduled</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-400">{stats.appointment_breakdown.completed}</p>
                <p className="text-xs text-white/30 mt-1">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400">{stats.appointment_breakdown.cancelled}</p>
                <p className="text-xs text-white/30 mt-1">Cancelled</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9}>
          <div className="glass rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent Appointments</h3>
              <a href="/dashboard/appointments" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">View All →</a>
            </div>
            <div className="space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-6">No appointments yet</p>
              ) : (
                recentAppointments.map((appt: any) => {
                  const sc = statusConfig[appt.status] || statusConfig.scheduled;
                  return (
                    <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">{appt.patient_name || "Patient"}</p>
                          <p className="text-[11px] text-white/30">{appt.doctor_name} · {appt.time_slot}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        {appt.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Calls */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={10}>
          <div className="glass rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent AI Calls</h3>
              <a href="/dashboard/calls" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">View All →</a>
            </div>
            <div className="space-y-3">
              {recentCalls.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-6">No calls yet</p>
              ) : (
                recentCalls.map((call: any) => {
                  const sc = statusConfig[call.status] || statusConfig.scheduled;
                  return (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/80">{call.patient_name || call.caller_phone}</p>
                          <p className="text-[11px] text-white/30">
                            {call.intent || "General Inquiry"} · {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        {call.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Activity Feed */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={11}>
        <div className="glass rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">AI Activity Feed</h3>
          <div className="space-y-3">
            {[
              { icon: Bot, text: "AI Voice Agent handled call from +92-300-1234567", time: "2 min ago", color: "text-cyan-400 bg-cyan-500/10" },
              { icon: CheckCircle2, text: "Appointment confirmed: Dr. Aleem — Tomorrow 3:30 PM", time: "5 min ago", color: "text-emerald-400 bg-emerald-500/10" },
              { icon: Mic, text: "Call transcript generated and synced with EHR", time: "8 min ago", color: "text-blue-400 bg-blue-500/10" },
              { icon: AlertCircle, text: "AI detected scheduling conflict — auto-resolved", time: "12 min ago", color: "text-amber-400 bg-amber-500/10" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.015] border border-white/[0.03]">
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-white/50 flex-1">{item.text}</p>
                <span className="text-[10px] text-white/20 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
