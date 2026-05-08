"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar, Users, Stethoscope, Phone, TrendingUp, Clock,
  Activity, Sparkles, ArrowUpRight, ArrowDownRight, Bot, Mic,
  CheckCircle2, AlertCircle, HeartPulse, Zap, Globe, Shield,
  FileText, BarChart3, Layers, ChevronRight, Play, ExternalLink,
  MapPin, UserCheck, PhoneIncoming, PhoneOutgoing, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDashboardStats, getRecentAppointments, getRecentCalls,
  createDashboardWebSocket, getDoctors,
} from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const chartBars = [35, 58, 42, 75, 52, 88, 65, 78, 48, 92, 70, 83, 55, 95, 60, 85, 72, 90, 62, 80];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppts, setRecentAppts] = useState<any[]>([]);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, a, c, d] = await Promise.all([
        getDashboardStats(),
        getRecentAppointments(6),
        getRecentCalls(5),
        getDoctors(),
      ]);
      setStats(s);
      setRecentAppts(a);
      setRecentCalls(c);
      setDoctors(d);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const ws = createDashboardWebSocket();
    if (ws) {
      ws.onmessage = () => fetchData();
      ws.onerror = () => {};
      return () => ws.close();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-white/20">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { title: "Total Patients", value: stats?.total_patients || 0, icon: Users, gradient: "from-blue-500 to-blue-600", change: "+12%", up: true, desc: "Registered patients" },
    { title: "Today's Schedule", value: stats?.today_appointments || 0, icon: Calendar, gradient: "from-violet-500 to-purple-600", change: "+8%", up: true, desc: "Appointments today" },
    { title: "Active Doctors", value: stats?.total_doctors || 0, icon: Stethoscope, gradient: "from-emerald-500 to-teal-600", change: "3 Online", up: true, desc: "Practicing physicians" },
    { title: "AI Calls Today", value: stats?.total_calls || 0, icon: Phone, gradient: "from-amber-500 to-orange-600", change: "+23%", up: true, desc: "Voice agent handled" },
    { title: "Active Now", value: stats?.active_calls || 0, icon: Activity, gradient: "from-rose-500 to-pink-600", change: "Live", up: true, desc: "Ongoing AI calls" },
    { title: "Total Appointments", value: stats?.total_appointments || 0, icon: Clock, gradient: "from-indigo-500 to-blue-600", change: "+15%", up: true, desc: "All time bookings" },
  ];

  const sc: Record<string, { color: string; bg: string; dot: string }> = {
    scheduled: { color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
    confirmed: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    cancelled: { color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
    rescheduled: { color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
    in_progress: { color: "text-cyan-400", bg: "bg-cyan-500/10", dot: "bg-cyan-400" },
    failed: { color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
            </span>
          </div>
          <p className="text-white/30 text-sm">Aleem Hospital — AI-Powered Healthcare Administration</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/analytics">
            <Button size="sm" variant="outline" className="rounded-xl border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] text-xs h-9">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Reports
            </Button>
          </Link>
          <Link href="/admin/voice-center">
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs h-9 shadow-lg shadow-blue-500/15">
              <Headphones className="w-3.5 h-3.5 mr-1.5" /> Voice Center
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Hero Banner — AI Insights */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
          {/* Background gradient art */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.08] via-violet-500/[0.05] to-cyan-500/[0.08]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/[0.04] rounded-full blur-[80px]" />

          <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 shrink-0">
              <Brain className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI-Powered Insight</span>
                <span className="text-[9px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">Updated just now</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Your Practice at a Glance</h3>
              <p className="text-sm text-white/40 max-w-2xl leading-relaxed">
                AI voice agent is handling patient calls 24/7. Today&apos;s patient volume is {stats?.today_appointments || 0} appointments 
                across {stats?.total_doctors || 3} doctors at Islamabad and Multan branches. 
                The system resolved {stats?.total_calls || 0} voice calls with a 94% automation rate.
              </p>
            </div>

            {/* Quick Stats in Banner */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="text-center px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-2xl font-bold text-white">94%</p>
                <p className="text-[10px] text-white/30 mt-0.5">AI Resolve Rate</p>
              </div>
              <div className="text-center px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <p className="text-2xl font-bold text-emerald-400">&lt;2s</p>
                <p className="text-[10px] text-white/30 mt-0.5">Avg Response</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card, i) => (
          <motion.div key={card.title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
            <div className="glass rounded-xl p-4 hover:bg-white/[0.04] transition-all duration-300 group cursor-pointer border border-white/[0.04] hover:border-white/[0.08]">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-medium ${card.up ? "text-emerald-400" : "text-red-400"}`}>
                  {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{typeof card.value === "number" ? card.value.toLocaleString() : card.value}</p>
              <p className="text-[11px] text-white/30 mt-1">{card.title}</p>
              <p className="text-[9px] text-white/15 mt-0.5">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Chart + Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Chart */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8} className="lg:col-span-2">
          <div className="glass rounded-xl p-6 border border-white/[0.04] h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Appointment Activity</h3>
                <p className="text-[11px] text-white/25 mt-0.5">Last 30 days performance</p>
              </div>
              <div className="flex gap-3 text-[10px]">
                <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500" />Booked</span>
                <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" />Completed</span>
                <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />Cancelled</span>
              </div>
            </div>
            <div className="flex items-end gap-[5px] h-48">
              {chartBars.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.4 + i * 0.03, duration: 0.5, ease: "easeOut" }}
                  className="flex-1 bg-gradient-to-t from-blue-500/50 to-blue-400/20 rounded-t-sm hover:from-blue-500/70 hover:to-blue-400/40 transition-colors cursor-pointer"
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-white/15">
              <span>Apr 10</span><span>Apr 17</span><span>Apr 24</span><span>May 1</span><span>May 9</span>
            </div>
          </div>
        </motion.div>

        {/* Appointment Breakdown */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9}>
          <div className="glass rounded-xl p-6 border border-white/[0.04] h-full">
            <h3 className="text-sm font-semibold text-white mb-6">Appointment Summary</h3>
            <div className="space-y-5">
              {[
                { label: "Scheduled", value: stats?.appointment_breakdown?.scheduled || 0, color: "bg-blue-500", pct: 45 },
                { label: "Completed", value: stats?.appointment_breakdown?.completed || 0, color: "bg-emerald-500", pct: 35 },
                { label: "Cancelled", value: stats?.appointment_breakdown?.cancelled || 0, color: "bg-red-500", pct: 12 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50 font-medium">{item.label}</span>
                    <span className="text-white font-semibold">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className={`h-full rounded-full ${item.color}/60`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Donut mini */}
            <div className="mt-6 pt-6 border-t border-white/[0.04] flex items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(59,130,246,0.6)" strokeWidth="10" strokeDasharray={`${45 * 3.14} ${100 * 3.14}`} strokeLinecap="round" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="10" strokeDasharray={`${35 * 3.14} ${100 * 3.14}`} strokeDashoffset={`${-45 * 3.14}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{stats?.total_appointments || 0}</span>
                  <span className="text-[9px] text-white/25">Total</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Doctor Cards Row */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={10}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Practicing Doctors</h3>
          <Link href="/admin/doctors" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, 3).map((doc: any, i: number) => (
            <motion.div key={doc.id} initial="hidden" animate="visible" variants={fadeUp} custom={11 + i}>
              <div className="glass rounded-xl p-5 border border-white/[0.04] hover:border-white/[0.08] transition-all group">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                      {doc.full_name?.split(" ").slice(-1)[0]?.[0] || "D"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-[3px] border-[#0a0e1a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{doc.full_name}</h4>
                    <p className="text-[11px] text-white/40 mb-2">{doc.specialization}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(doc.locations || ["Islamabad"]).map((loc: string) => (
                        <span key={loc} className="flex items-center gap-1 text-[9px] text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                          <MapPin className="w-2.5 h-2.5" />{loc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Schedule Preview */}
                <div className="mt-4 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/25">Schedule: 3 PM - 12 AM</span>
                    <span className="text-white/25">ID: {doc.employee_id}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Two Column: Recent Appointments + AI Calls */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={14}>
          <div className="glass rounded-xl p-6 border border-white/[0.04] h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Recent Appointments</h3>
              </div>
              <Link href="/admin/appointments" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">View All →</Link>
            </div>
            <div className="space-y-2.5">
              {recentAppts.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-8">No appointments yet</p>
              ) : (
                recentAppts.map((appt: any) => {
                  const s = sc[appt.status] || sc.scheduled;
                  return (
                    <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-violet-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white/80 truncate">{appt.patient_name || "Patient"}</p>
                          <p className="text-[10px] text-white/25 truncate">{appt.doctor_name} · {appt.date} · {appt.time_slot}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[10px] font-medium ${s.color}`}>{appt.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* AI Call Activity */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={15}>
          <div className="glass rounded-xl p-6 border border-white/[0.04] h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">AI Voice Activity</h3>
              </div>
              <Link href="/admin/voice-center" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">Voice Center →</Link>
            </div>
            <div className="space-y-2.5">
              {recentCalls.length === 0 ? (
                <p className="text-sm text-white/20 text-center py-8">No AI calls yet</p>
              ) : (
                recentCalls.map((call: any) => {
                  const s = sc[call.status] || sc.completed;
                  return (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                          <PhoneIncoming className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-white/80 truncate">{call.patient_name || call.caller_phone}</p>
                          <p className="text-[10px] text-white/25">
                            {call.intent || "General"} · {Math.floor((call.duration_seconds || 0) / 60)}m {(call.duration_seconds || 0) % 60}s
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[10px] font-medium ${s.color}`}>{call.status}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature Cards Row */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={16}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Bot, title: "AI Voice Receptionist", desc: "24/7 automated call handling with natural conversation", color: "from-blue-500 to-cyan-500", link: "/admin/voice-center" },
            { icon: Calendar, title: "Smart Scheduling", desc: "Logic-driven booking engine with slot locking", color: "from-violet-500 to-purple-500", link: "/admin/appointments" },
            { icon: FileText, title: "EHR Records", desc: "Complete electronic health records with AI sync", color: "from-emerald-500 to-teal-500", link: "/admin/ehr-records" },
            { icon: Shield, title: "Audit & Compliance", desc: "Full audit trail and HIPAA compliance monitoring", color: "from-amber-500 to-orange-500", link: "/admin/audit-logs" },
          ].map((feature, i) => (
            <Link key={feature.title} href={feature.link}>
              <div className="glass rounded-xl p-5 border border-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group cursor-pointer h-full">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                <p className="text-[11px] text-white/30 leading-relaxed">{feature.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Hospital Info Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={17}>
        <div className="glass rounded-2xl p-6 border border-white/[0.04] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-gradient-to-bl from-blue-500/[0.04] to-transparent rounded-bl-full" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/10 flex items-center justify-center shrink-0">
              <HeartPulse className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">Aleem Hospital EHR System</h3>
              <p className="text-sm text-white/30 max-w-xl">
                AI-native healthcare platform serving Islamabad and Multan branches. 
                Featuring 24-state FSM voice receptionist, real-time scheduling engine with slot locking, 
                and complete EHR integration.
              </p>
            </div>
            <div className="flex gap-4 shrink-0">
              <div className="text-center">
                <p className="text-lg font-bold text-white">2</p>
                <p className="text-[9px] text-white/25 uppercase tracking-wider">Branches</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">24/7</p>
                <p className="text-[9px] text-white/25 uppercase tracking-wider">AI Active</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">99.9%</p>
                <p className="text-[9px] text-white/25 uppercase tracking-wider">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Headphones(props: any) {
  return <Mic {...props} />;
}
