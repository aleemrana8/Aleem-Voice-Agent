"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, Calendar, Phone, Users, Activity,
  ArrowUpRight, ArrowDownRight, Layers, Globe, Clock,
  CheckCircle2, XCircle, Bot, Stethoscope, FileText,
} from "lucide-react";
import { getDashboardStats, getRecentAppointments, getRecentCalls } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

// Simulated chart data
const monthlyData = [
  { month: "Jan", appointments: 32, calls: 28, patients: 12 },
  { month: "Feb", appointments: 45, calls: 38, patients: 15 },
  { month: "Mar", appointments: 38, calls: 42, patients: 10 },
  { month: "Apr", appointments: 62, calls: 55, patients: 22 },
  { month: "May", appointments: 58, calls: 48, patients: 18 },
  { month: "Jun", appointments: 72, calls: 65, patients: 25 },
];

const weekdayDistribution = [
  { day: "Mon", value: 85 }, { day: "Tue", value: 72 }, { day: "Wed", value: 90 },
  { day: "Thu", value: 68 }, { day: "Fri", value: 78 }, { day: "Sat", value: 45 }, { day: "Sun", value: 20 },
];

const hourlyDistribution = [
  15, 22, 38, 55, 72, 85, 95, 0, 45, 60, 70, 48, 55, 62, 40, 25, 15,
];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const maxMonthly = Math.max(...monthlyData.map(d => d.appointments));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Reports</h1>
        <p className="text-white/30 text-sm">Performance insights, trends and data visualization</p>
      </motion.div>

      {/* KPI Row */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: "$24,500", icon: TrendingUp, change: "+18%", up: true, color: "from-emerald-500/10 to-emerald-500/5" },
            { label: "Avg Wait Time", value: "12 min", icon: Clock, change: "-8%", up: true, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Patient Satisfaction", value: "96%", icon: Users, change: "+3%", up: true, color: "from-violet-500/10 to-violet-500/5" },
            { label: "AI Automation", value: "94%", icon: Bot, change: "+5%", up: true, color: "from-cyan-500/10 to-cyan-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] p-5`}>
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-white/30" />
                <span className={`flex items-center gap-0.5 text-[10px] font-medium ${s.up ? "text-emerald-400" : "text-red-400"}`}>
                  {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-white/30 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Trends */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="lg:col-span-2">
          <div className="glass rounded-xl p-6 border border-white/[0.04] h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Monthly Trends</h3>
                <p className="text-[11px] text-white/25 mt-0.5">Appointments, calls, and new patients</p>
              </div>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500" />Appointments</span>
                <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-500" />AI Calls</span>
                <span className="flex items-center gap-1.5 text-violet-400"><span className="w-2 h-2 rounded-full bg-violet-500" />New Patients</span>
              </div>
            </div>

            <div className="space-y-3">
              {monthlyData.map((d, i) => (
                <div key={d.month} className="flex items-center gap-4">
                  <span className="text-[11px] text-white/30 w-8 shrink-0">{d.month}</span>
                  <div className="flex-1 space-y-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.appointments / maxMonthly) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className="h-4 rounded bg-gradient-to-r from-blue-500/40 to-blue-400/20 flex items-center px-2"
                    >
                      <span className="text-[9px] text-white/50">{d.appointments}</span>
                    </motion.div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.calls / maxMonthly) * 100}%` }}
                      transition={{ delay: 0.35 + i * 0.05, duration: 0.5 }}
                      className="h-3 rounded bg-gradient-to-r from-cyan-500/30 to-cyan-400/15 flex items-center px-2"
                    >
                      <span className="text-[8px] text-white/40">{d.calls}</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Weekday Distribution */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
          <div className="glass rounded-xl p-6 border border-white/[0.04] h-full">
            <h3 className="text-sm font-semibold text-white mb-1">Weekday Distribution</h3>
            <p className="text-[11px] text-white/25 mb-6">Appointment volume by day</p>
            <div className="flex items-end gap-2 h-44">
              {weekdayDistribution.map((d, i) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${d.value}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-violet-500/50 to-violet-400/15 rounded-t-sm hover:from-violet-500/70 hover:to-violet-400/30 transition-colors cursor-pointer"
                  />
                  <span className="text-[9px] text-white/25">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Heatmap */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <div className="glass rounded-xl p-6 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1">Hourly Activity</h3>
            <p className="text-[11px] text-white/25 mb-4">Call volume by hour (3PM - 12AM)</p>
            <div className="flex items-end gap-1 h-32">
              {hourlyDistribution.map((v, i) => {
                const hour = 15 + i;
                const isBreak = hour === 20;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${isBreak ? 0 : v}%` }}
                      transition={{ delay: 0.3 + i * 0.03, duration: 0.4 }}
                      className={`w-full rounded-t-sm ${
                        isBreak
                          ? "bg-red-500/10 border border-dashed border-red-500/20"
                          : v > 80 ? "bg-gradient-to-t from-emerald-500/60 to-emerald-400/20"
                          : v > 50 ? "bg-gradient-to-t from-blue-500/50 to-blue-400/15"
                          : "bg-gradient-to-t from-blue-500/30 to-blue-400/10"
                      }`}
                    />
                    <span className="text-[7px] text-white/15">{hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Location Comparison */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <div className="glass rounded-xl p-6 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1">Branch Comparison</h3>
            <p className="text-[11px] text-white/25 mb-6">Performance by location</p>
            <div className="space-y-6">
              {[
                { name: "Islamabad", patients: 65, appointments: 72, calls: 58, color: "from-blue-500 to-cyan-500" },
                { name: "Multan", patients: 35, appointments: 28, calls: 42, color: "from-violet-500 to-purple-500" },
              ].map((loc) => (
                <div key={loc.name}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${loc.color} flex items-center justify-center`}>
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-white">{loc.name}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Patients", pct: loc.patients },
                      { label: "Appointments", pct: loc.appointments },
                      { label: "AI Calls", pct: loc.calls },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-white/30">{m.label}</span>
                          <span className="text-white/50 font-medium">{m.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.pct}%` }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className={`h-full rounded-full bg-gradient-to-r ${loc.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Performance Section */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
        <div className="glass rounded-xl p-6 border border-white/[0.04]">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AI Voice Agent Performance</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Intent Accuracy", value: "97.2%", desc: "GPT-4o intent extraction accuracy", bar: 97 },
              { label: "Call Completion", value: "94.1%", desc: "Successfully resolved without escalation", bar: 94 },
              { label: "Avg Response Time", value: "1.8s", desc: "STT → Intent → FSM → TTS pipeline", bar: 82 },
            ].map((metric) => (
              <div key={metric.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
                <p className="text-[12px] text-white/50 font-medium">{metric.label}</p>
                <p className="text-[10px] text-white/20 mt-1 mb-3">{metric.desc}</p>
                <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.bar}%` }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500/60 to-blue-500/60"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
