"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Clock, Phone, Mail } from "lucide-react";
import { getDoctors } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const dayLabels: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors().then(setDoctors).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-bold text-white">Doctors</h1>
        <p className="text-white/30 text-sm">View doctor schedules and availability</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor, i) => (
            <motion.div key={doctor.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <div className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {doctor.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{doctor.full_name}</h3>
                      <p className="text-[11px] text-white/40">{doctor.specialization}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${doctor.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {doctor.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Phone className="w-3 h-3" /> {doctor.phone}
                  </div>
                  {doctor.email && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Mail className="w-3 h-3" /> {doctor.email}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-white/20 uppercase tracking-wider mb-2">Schedule</p>
                  <div className="space-y-1">
                    {Object.entries(doctor.schedule || {}).map(([day, sched]: [string, any]) => (
                      <div key={day} className="flex justify-between text-[11px]">
                        <span className="text-white/50 font-medium">{dayLabels[day] || day}</span>
                        <span className="text-white/30">{sched.start} - {sched.end} ({sched.slot_duration}m)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <p className="text-[10px] text-white/15">ID: {doctor.employee_id}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
