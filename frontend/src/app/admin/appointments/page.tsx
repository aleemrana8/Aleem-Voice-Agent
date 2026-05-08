"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar, Plus, Search, X, Clock, MapPin, User, Stethoscope,
  ChevronRight, Filter, RefreshCw, CheckCircle2, XCircle, ArrowRight,
} from "lucide-react";
import {
  getAppointments, createAppointment, getDoctors, checkDoctorAvailability,
  rescheduleAppointment, cancelAppointment,
} from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({
    patient_id: "", doctor_id: "", date: "", time_slot: "", location: "Islamabad", reason: "",
  });

  // Reschedule state
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ new_date: "", new_time_slot: "" });
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const [a, d] = await Promise.all([
        getAppointments({ status: statusFilter !== "all" ? statusFilter : undefined }),
        getDoctors(),
      ]);
      const filtered = search
        ? a.filter((x: any) => x.patient_name?.toLowerCase().includes(search.toLowerCase()) || x.doctor_name?.toLowerCase().includes(search.toLowerCase()) || x.appointment_id?.includes(search))
        : a;
      setAppointments(filtered);
      setDoctors(d);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter, search]);

  const checkSlots = async () => {
    if (!form.doctor_id || !form.date) return;
    setChecking(true);
    try {
      const data = await checkDoctorAvailability(form.doctor_id, form.date, form.location);
      setAvailableSlots(data.available_slots || []);
    } catch { setAvailableSlots([]); }
    finally { setChecking(false); }
  };

  useEffect(() => { if (form.doctor_id && form.date) checkSlots(); }, [form.doctor_id, form.date, form.location]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment(form);
      setShowForm(false);
      setForm({ patient_id: "", doctor_id: "", date: "", time_slot: "", location: "Islamabad", reason: "" });
      setAvailableSlots([]);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    try { await cancelAppointment(id); fetchData(); } catch (err: any) { alert(err.message); }
  };

  const openReschedule = async (appt: any) => {
    setRescheduleId(appt.id);
    setRescheduleData({ new_date: "", new_time_slot: "" });
    setRescheduleSlots([]);
  };

  const checkRescheduleSlots = async (doctorId: string, date: string, location: string) => {
    try {
      const data = await checkDoctorAvailability(doctorId, date, location);
      setRescheduleSlots(data.available_slots || []);
    } catch { setRescheduleSlots([]); }
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !rescheduleData.new_date || !rescheduleData.new_time_slot) return;
    try {
      await rescheduleAppointment(rescheduleId, rescheduleData);
      setRescheduleId(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const inputClass = "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all";
  const selectClass = "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50";

  const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
    scheduled: { dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-500/10" },
    confirmed: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    completed: { dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    cancelled: { dot: "bg-red-400", text: "text-red-400", bg: "bg-red-500/10" },
    rescheduled: { dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-500/10" },
    in_progress: { dot: "bg-cyan-400", text: "text-cyan-400", bg: "bg-cyan-500/10" },
  };

  const statuses = ["all", "scheduled", "confirmed", "completed", "cancelled", "rescheduled"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Appointments</h1>
          <p className="text-white/30 text-sm">Schedule, manage and track all patient appointments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className={showForm
          ? "bg-white/10 hover:bg-white/15 text-white rounded-xl"
          : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl shadow-lg shadow-violet-500/15"
        }>
          {showForm ? <><X className="mr-2 h-4 w-4" />Close</> : <><Plus className="mr-2 h-4 w-4" />New Appointment</>}
        </Button>
      </motion.div>

      {/* Booking Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-xl p-6 border border-violet-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Book Appointment</h3>
                <p className="text-[11px] text-white/25">Select doctor, date and available slot</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Patient ID *</Label>
                  <Input value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required placeholder="PAT-XXXXXX" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Doctor *</Label>
                  <select className={selectClass} value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })} required>
                    <option value="">Select Doctor</option>
                    {doctors.map((d: any) => (
                      <option key={d.employee_id} value={d.employee_id}>{d.full_name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Location *</Label>
                  <select className={selectClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Multan">Multan</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Date *</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className={inputClass} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Reason</Label>
                  <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Consultation, follow-up, etc." className={inputClass} />
                </div>
              </div>

              {/* Slot Grid */}
              {form.doctor_id && form.date && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Available Slots</Label>
                    {checking && <div className="w-3.5 h-3.5 border border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />}
                  </div>
                  {availableSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot} type="button"
                          onClick={() => setForm({ ...form, time_slot: slot })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            form.time_slot === slot
                              ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/20"
                              : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/60"
                          }`}
                        >{slot}</button>
                      ))}
                    </div>
                  ) : !checking ? (
                    <p className="text-[11px] text-white/15">No available slots for this date</p>
                  ) : null}
                </div>
              )}

              <Button type="submit" disabled={!form.time_slot} className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl h-11 font-semibold shadow-lg shadow-violet-500/15 disabled:opacity-40">
                Book Appointment
              </Button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="Search appointments..." className={`pl-10 ${inputClass}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize ${
                statusFilter === s
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "bg-white/[0.03] text-white/30 border border-white/[0.04] hover:bg-white/[0.06]"
              }`}
            >{s}</button>
          ))}
        </div>
      </motion.div>

      {/* Appointment List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : appointments.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center border border-white/[0.04]">
          <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/20">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">
            <span className="col-span-3">Patient</span>
            <span className="col-span-2">Doctor</span>
            <span className="col-span-2">Schedule</span>
            <span className="col-span-1">Location</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-3">Actions</span>
          </div>

          {appointments.map((appt, i) => {
            const sc = statusColors[appt.status] || statusColors.scheduled;
            return (
              <motion.div key={appt.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
                <div className="glass rounded-xl p-4 border border-white/[0.04] hover:border-white/[0.08] transition-all">
                  <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center flex flex-col gap-3">
                    {/* Patient */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold shrink-0">
                        {appt.patient_name?.[0]?.toUpperCase() || "P"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white/80 truncate">{appt.patient_name || "Patient"}</p>
                        <p className="text-[10px] text-white/25">{appt.appointment_id}</p>
                      </div>
                    </div>
                    {/* Doctor */}
                    <div className="col-span-2 flex items-center gap-1.5">
                      <Stethoscope className="w-3 h-3 text-white/20 shrink-0" />
                      <span className="text-[12px] text-white/40 truncate">{appt.doctor_name}</span>
                    </div>
                    {/* Schedule */}
                    <div className="col-span-2">
                      <p className="text-[12px] text-white/50 font-medium">{appt.date}</p>
                      <p className="text-[10px] text-white/25">{appt.time_slot}</p>
                    </div>
                    {/* Location */}
                    <div className="col-span-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-white/20" />
                      <span className="text-[11px] text-white/30">{appt.location || "—"}</span>
                    </div>
                    {/* Status */}
                    <div className="col-span-1">
                      <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full w-fit ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {appt.status}
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="col-span-3 flex gap-2">
                      {appt.status !== "cancelled" && appt.status !== "completed" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => openReschedule(appt)}
                            className="text-white/30 hover:text-amber-400 hover:bg-amber-500/[0.06] rounded-lg text-[11px] h-8 px-3">
                            <RefreshCw className="w-3 h-3 mr-1" />Reschedule
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleCancel(appt.id)}
                            className="text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] rounded-lg text-[11px] h-8 px-3">
                            <XCircle className="w-3 h-3 mr-1" />Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Reschedule Inline Panel */}
                  {rescheduleId === appt.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-white/[0.04]">
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-white/30">New Date</Label>
                          <Input type="date" value={rescheduleData.new_date}
                            onChange={(e) => {
                              setRescheduleData({ ...rescheduleData, new_date: e.target.value, new_time_slot: "" });
                              checkRescheduleSlots(appt.doctor_id, e.target.value, appt.location);
                            }}
                            className="h-9 w-44 bg-white/[0.04] border-white/[0.08] rounded-lg text-white text-xs" />
                        </div>
                        {rescheduleSlots.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {rescheduleSlots.map((slot) => (
                              <button key={slot} type="button" onClick={() => setRescheduleData({ ...rescheduleData, new_time_slot: slot })}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                  rescheduleData.new_time_slot === slot
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]"
                                }`}
                              >{slot}</button>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 ml-auto">
                          <Button size="sm" variant="ghost" onClick={() => setRescheduleId(null)}
                            className="text-white/30 rounded-lg text-xs h-9">Cancel</Button>
                          <Button size="sm" onClick={handleReschedule} disabled={!rescheduleData.new_time_slot}
                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs h-9 disabled:opacity-30">
                            Confirm Reschedule
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
