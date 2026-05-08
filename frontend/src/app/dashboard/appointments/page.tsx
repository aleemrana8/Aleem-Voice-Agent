"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Calendar, Clock, Stethoscope } from "lucide-react";
import {
  getAppointments, getDoctors, getPatients,
  createAppointment, cancelAppointment, checkDoctorAvailability,
} from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [form, setForm] = useState({ patient_id: "", doctor_id: "", date: "", time_slot: "", reason: "" });

  const fetchAppointments = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const data = await getAppointments(params);
      setAppointments(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAppointments();
    getDoctors().then(setDoctors).catch(console.error);
    getPatients().then(setPatients).catch(console.error);
  }, [filterStatus, filterDate]);

  useEffect(() => {
    if (form.doctor_id && form.date) {
      checkDoctorAvailability(form.doctor_id, form.date)
        .then((data) => setAvailableSlots(data.available_slots))
        .catch(console.error);
    }
  }, [form.doctor_id, form.date]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({ ...form, booked_via: "dashboard" });
      setShowForm(false);
      setForm({ patient_id: "", doctor_id: "", date: "", time_slot: "", reason: "" });
      fetchAppointments();
    } catch (err: any) { alert(err.message); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    try { await cancelAppointment(id); fetchAppointments(); }
    catch (err: any) { alert(err.message); }
  };

  const statusConfig: Record<string, { color: string; bg: string }> = {
    scheduled: { color: "text-blue-400", bg: "bg-blue-500/10" },
    confirmed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    cancelled: { color: "text-red-400", bg: "bg-red-500/10" },
    rescheduled: { color: "text-amber-400", bg: "bg-amber-500/10" },
  };

  const selectClass = "flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none";

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <p className="text-white/30 text-sm">Manage patient appointments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className={showForm ? "bg-white/10 hover:bg-white/15 text-white rounded-xl" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl"}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Close</> : <><Plus className="mr-2 h-4 w-4" />New Appointment</>}
        </Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Book New Appointment</h3>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Patient</Label>
                <select className={selectClass} value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
                  <option value="">Select patient</option>
                  {patients.map((p: any) => (<option key={p.patient_id} value={p.patient_id}>{p.full_name} ({p.patient_id})</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Doctor</Label>
                <select className={selectClass} value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required>
                  <option value="">Select doctor</option>
                  {doctors.map((d: any) => (<option key={d.employee_id} value={d.employee_id}>{d.full_name} - {d.specialization}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="h-10 bg-white/[0.04] border-white/[0.08] rounded-xl text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Time Slot</Label>
                <select className={selectClass} value={form.time_slot} onChange={(e) => setForm({ ...form, time_slot: e.target.value })} required>
                  <option value="">Select slot</option>
                  {availableSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                </select>
                {form.doctor_id && form.date && availableSlots.length === 0 && <p className="text-xs text-red-400">No slots available</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Reason</Label>
                <Input placeholder="Reason for visit" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="h-10 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-10">Book Appointment</Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-wrap gap-3">
        <select className={selectClass + " w-auto"} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <Input type="date" className="w-auto bg-white/[0.04] border-white/[0.08] rounded-xl text-white" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
        ) : appointments.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-white/20">No appointments found</div>
        ) : (
          appointments.map((appt, i) => {
            const sc = statusConfig[appt.status] || statusConfig.scheduled;
            return (
              <motion.div key={appt.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
                <div className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">{appt.patient_name}</p>
                      <p className="text-[11px] text-white/30">
                        {appt.doctor_name} · {appt.date} at {appt.time_slot}
                      </p>
                      {appt.reason && <p className="text-[11px] text-white/20 mt-0.5">Reason: {appt.reason}</p>}
                      <p className="text-[10px] text-white/15 mt-0.5">via {appt.booked_via}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>{appt.status}</span>
                    {appt.status !== "cancelled" && appt.status !== "completed" && (
                      <Button size="sm" variant="ghost" onClick={() => handleCancel(appt.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs h-7 px-2">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
