"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope, MapPin, Clock, Calendar, Users, Award,
  ChevronRight, Globe, Shield, Activity, Heart,
} from "lucide-react";
import { getDoctors } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

const gradients = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
];

const shadows = [
  "shadow-blue-500/20",
  "shadow-violet-500/20",
  "shadow-emerald-500/20",
  "shadow-rose-500/20",
  "shadow-amber-500/20",
];

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  useEffect(() => {
    getDoctors()
      .then((d) => setDoctors(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build schedule slots
  const scheduleSlots = [];
  for (let h = 15; h <= 23; h++) {
    const label = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
    const isBreak = h === 20;
    scheduleSlots.push({ hour: h, label, isBreak });
    if (h < 23 && h !== 20) {
      const m = `${h > 12 ? h - 12 : h}:30 ${h >= 12 ? "PM" : "AM"}`;
      scheduleSlots.push({ hour: h + 0.5, label: m, isBreak: false });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Doctors</h1>
        <p className="text-white/30 text-sm">Practicing physicians across all branches</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Doctors", value: doctors.length, icon: Stethoscope, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Islamabad Branch", value: doctors.filter(d => d.locations?.includes("Islamabad")).length, icon: MapPin, color: "from-emerald-500/10 to-emerald-500/5" },
            { label: "Multan Branch", value: doctors.filter(d => d.locations?.includes("Multan")).length, icon: MapPin, color: "from-violet-500/10 to-violet-500/5" },
            { label: "Active Hours", value: "3PM-12AM", icon: Clock, color: "from-amber-500/10 to-amber-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] p-4`}>
              <s.icon className="w-5 h-5 text-white/30 mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : (
        <div className={`grid gap-6 ${selectedDoc ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
          {/* Doctor Cards */}
          <div className={`${selectedDoc ? "lg:col-span-3" : "lg:col-span-3"} grid gap-4 ${selectedDoc ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {doctors.map((doc, i) => {
              const g = gradients[i % gradients.length];
              const s = shadows[i % shadows.length];
              return (
                <motion.div key={doc.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
                  <div
                    onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                    className={`glass rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                      selectedDoc?.id === doc.id ? "border-blue-500/30 bg-blue-500/[0.03]" : "border-white/[0.04] hover:border-white/[0.08]"
                    }`}
                  >
                    {/* Top Banner */}
                    <div className={`h-24 bg-gradient-to-br ${g} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-50" />
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0e1a] to-transparent" />
                    </div>

                    {/* Avatar */}
                    <div className="px-5 -mt-10 relative z-10">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${g} flex items-center justify-center text-white text-2xl font-bold border-4 border-[#0a0e1a] shadow-xl ${s}`}>
                        {doc.full_name?.split(" ").slice(-1)[0]?.[0] || "D"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 py-4">
                      <h3 className="text-base font-bold text-white">{doc.full_name}</h3>
                      <p className="text-[12px] text-white/40 mb-3">{doc.specialization}</p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] text-white/30">
                          <Shield className="w-3 h-3" />
                          <span>ID: {doc.employee_id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/30">
                          <Clock className="w-3 h-3" />
                          <span>3:00 PM — 12:00 AM (Break 8-9 PM)</span>
                        </div>
                      </div>

                      {/* Locations */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(doc.locations || []).map((loc: string) => (
                          <span key={loc} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40">
                            <MapPin className="w-2.5 h-2.5" />{loc}
                          </span>
                        ))}
                      </div>

                      {/* Online Indicator */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] text-emerald-400/60 font-medium">Available for Booking</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detail Panel */}
          {selectedDoc && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
              <div className="glass rounded-xl border border-white/[0.06] sticky top-6">
                <div className="p-6 border-b border-white/[0.04]">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[doctors.indexOf(selectedDoc) % gradients.length]} flex items-center justify-center text-white text-2xl font-bold shadow-xl`}>
                      {selectedDoc.full_name?.split(" ").slice(-1)[0]?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedDoc.full_name}</h3>
                      <p className="text-[12px] text-white/40">{selectedDoc.specialization}</p>
                      <p className="text-[10px] text-white/20 mt-1">{selectedDoc.employee_id}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Daily Schedule</h4>
                  <div className="space-y-1">
                    {scheduleSlots.map((slot) => (
                      <div key={slot.label} className={`flex items-center justify-between p-2.5 rounded-lg text-[11px] ${
                        slot.isBreak
                          ? "bg-red-500/[0.05] border border-red-500/10 text-red-400/50"
                          : "bg-white/[0.02] border border-white/[0.03] text-white/30"
                      }`}>
                        <span className="font-medium">{slot.label}</span>
                        {slot.isBreak
                          ? <span className="text-[9px] text-red-400/40 font-medium">BREAK</span>
                          : <span className="text-[9px] text-emerald-400/40">Available</span>
                        }
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.04]">
                    <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Locations</h4>
                    <div className="space-y-2">
                      {(selectedDoc.locations || []).map((loc: string) => (
                        <div key={loc} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-[12px] text-white/60 font-medium">{loc}</p>
                            <p className="text-[10px] text-white/20">Aleem Hospital — {loc} Branch</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
