"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, Search, X, Users, Phone, Mail, Calendar, Shield,
  ChevronRight, UserCheck, UserPlus, Filter, Download,
  Eye, Edit2, FileText, MapPin, Clock,
} from "lucide-react";
import { getPatients, createPatient, getAppointments } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientAppts, setPatientAppts] = useState<any[]>([]);
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", date_of_birth: "",
    gender: "", address: "", emergency_contact: "",
  });

  const fetchPatients = async () => {
    try {
      const data = await getPatients({ search: search || undefined });
      setPatients(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, [search]);

  const selectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    try {
      const appts = await getAppointments({ patient_id: patient.patient_id });
      setPatientAppts(appts);
    } catch { setPatientAppts([]); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient(form);
      setShowForm(false);
      setForm({ full_name: "", phone: "", email: "", date_of_birth: "", gender: "", address: "", emergency_contact: "" });
      fetchPatients();
    } catch (err: any) { alert(err.message); }
  };

  const inputClass = "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all";
  const selectClass = "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50";

  const sc: Record<string, { color: string; bg: string }> = {
    scheduled: { color: "text-blue-400", bg: "bg-blue-500/10" },
    confirmed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10" },
    cancelled: { color: "text-red-400", bg: "bg-red-500/10" },
    rescheduled: { color: "text-amber-400", bg: "bg-amber-500/10" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Patient Management</h1>
          <p className="text-white/30 text-sm">Complete patient registry and health records</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)} className={showForm
            ? "bg-white/10 hover:bg-white/15 text-white rounded-xl"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-blue-500/15"
          }>
            {showForm ? <><X className="mr-2 h-4 w-4" />Close</> : <><UserPlus className="mr-2 h-4 w-4" />Register Patient</>}
          </Button>
        </div>
      </motion.div>

      {/* Stats Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: patients.length, icon: Users, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Verified", value: patients.filter(p => p.is_verified).length, icon: UserCheck, color: "from-emerald-500/10 to-emerald-500/5" },
            { label: "Unverified", value: patients.filter(p => !p.is_verified).length, icon: Shield, color: "from-amber-500/10 to-amber-500/5" },
            { label: "New This Month", value: patients.filter(p => { const d = new Date(p.created_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length, icon: UserPlus, color: "from-violet-500/10 to-violet-500/5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} border border-white/[0.04] p-4`}>
              <s.icon className="w-5 h-5 text-white/30 mb-2" />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-white/30">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Registration Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-xl p-6 border border-blue-500/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Register New Patient</h3>
                <p className="text-[11px] text-white/25">Fill in patient details below</p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Muhammad Aleem" className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Phone Number *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+92-300-1234567" className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Gender</Label>
                <select className={selectClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Emergency Contact</Label>
                <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="+92-300-7654321" className={inputClass} />
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" className={inputClass} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-11 font-semibold shadow-lg shadow-blue-500/15">
                  Register Patient
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input placeholder="Search by name, phone, or ID..." className={`pl-10 ${inputClass}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </motion.div>

      {/* Patient List + Detail Panel */}
      <div className={`grid gap-6 ${selectedPatient ? "lg:grid-cols-5" : ""}`}>
        {/* Patient List */}
        <div className={selectedPatient ? "lg:col-span-3" : ""}>
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
            ) : patients.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center border border-white/[0.04]">
                <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/20">No patients found</p>
                <p className="text-[11px] text-white/10 mt-1">Try a different search or register a new patient</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[10px] text-white/25 font-bold uppercase tracking-widest">
                  <span className="col-span-4">Patient</span>
                  <span className="col-span-2">Phone</span>
                  <span className="col-span-2">Gender</span>
                  <span className="col-span-2">Status</span>
                  <span className="col-span-2">Actions</span>
                </div>

                {patients.map((patient, i) => (
                  <motion.div key={patient.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 3}>
                    <div
                      onClick={() => selectPatient(patient)}
                      className={`glass rounded-xl p-4 cursor-pointer transition-all duration-200 border ${
                        selectedPatient?.id === patient.id
                          ? "border-blue-500/30 bg-blue-500/[0.04]"
                          : "border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-2">
                        {/* Patient Info */}
                        <div className="col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 text-sm font-bold shrink-0">
                            {patient.full_name?.[0]?.toUpperCase() || "P"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-white/80 truncate">{patient.full_name}</p>
                            <p className="text-[10px] text-white/25">{patient.patient_id}</p>
                          </div>
                        </div>
                        {/* Phone */}
                        <div className="col-span-2 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-white/20" />
                          <span className="text-[12px] text-white/40">{patient.phone}</span>
                        </div>
                        {/* Gender */}
                        <div className="col-span-2">
                          <span className="text-[12px] text-white/40 capitalize">{patient.gender || "—"}</span>
                        </div>
                        {/* Status */}
                        <div className="col-span-2">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            patient.is_verified
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {patient.is_verified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        {/* Actions */}
                        <div className="col-span-2 flex gap-1">
                          <Button variant="ghost" size="sm" className="text-white/30 hover:text-white hover:bg-white/[0.04] rounded-lg h-8 w-8 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-white/30 hover:text-white hover:bg-white/[0.04] rounded-lg h-8 w-8 p-0">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedPatient && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <div className="glass rounded-xl border border-white/[0.06] sticky top-6">
              {/* Patient Header */}
              <div className="p-6 border-b border-white/[0.04]">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-blue-500/20">
                    {selectedPatient.full_name?.[0]?.toUpperCase()}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="text-white/30 hover:text-white rounded-lg h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedPatient.full_name}</h3>
                <p className="text-[12px] text-white/30">{selectedPatient.patient_id}</p>
                <div className="mt-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    selectedPatient.is_verified
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {selectedPatient.is_verified ? "Identity Verified" : "Not Verified"}
                  </span>
                </div>
              </div>

              {/* Patient Details */}
              <div className="p-6 space-y-4">
                <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Contact Information</h4>
                <div className="space-y-3">
                  {[
                    { icon: Phone, label: "Phone", value: selectedPatient.phone },
                    { icon: Mail, label: "Email", value: selectedPatient.email || "Not provided" },
                    { icon: Calendar, label: "Date of Birth", value: selectedPatient.date_of_birth || "Not provided" },
                    { icon: Users, label: "Gender", value: selectedPatient.gender || "Not specified" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
                        <item.icon className="w-3.5 h-3.5 text-white/25" />
                      </div>
                      <div>
                        <p className="text-[10px] text-white/20">{item.label}</p>
                        <p className="text-[12px] text-white/60">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Appointment History */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Recent Appointments</h4>
                  {patientAppts.length === 0 ? (
                    <p className="text-[11px] text-white/15 text-center py-4">No appointments found</p>
                  ) : (
                    <div className="space-y-2">
                      {patientAppts.slice(0, 5).map((appt: any) => {
                        const s = sc[appt.status] || sc.scheduled;
                        return (
                          <div key={appt.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[11px] text-white/60 font-medium">{appt.doctor_name}</p>
                                <p className="text-[10px] text-white/25">{appt.date} · {appt.time_slot}</p>
                              </div>
                              <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{appt.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Registered Date */}
                <div className="pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2 text-[10px] text-white/15">
                    <Clock className="w-3 h-3" />
                    Registered: {new Date(selectedPatient.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
