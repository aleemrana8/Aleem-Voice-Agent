"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, X, Users, Phone, Mail } from "lucide-react";
import { getPatients, createPatient } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", date_of_birth: "", gender: "", address: "", emergency_contact: "" });

  const fetchPatients = async () => {
    try { const data = await getPatients({ search: search || undefined }); setPatients(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatients(); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient(form);
      setShowForm(false);
      setForm({ full_name: "", phone: "", email: "", date_of_birth: "", gender: "", address: "", emergency_contact: "" });
      fetchPatients();
    } catch (err: any) { alert(err.message); }
  };

  const inputClass = "h-10 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50";
  const selectClass = "flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50";

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Patients</h1>
          <p className="text-white/30 text-sm">Manage patient records</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className={showForm ? "bg-white/10 hover:bg-white/15 text-white rounded-xl" : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl"}>
          {showForm ? <><X className="mr-2 h-4 w-4" />Close</> : <><Plus className="mr-2 h-4 w-4" />Add Patient</>}
        </Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Register New Patient</h3>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Gender</Label>
                <select className={selectClass} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Emergency Contact</Label>
                <Input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-white/50 text-xs uppercase tracking-wider">Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-10">Register Patient</Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
        <Input placeholder="Search patients..." className={`pl-9 ${inputClass}`} value={search} onChange={(e) => setSearch(e.target.value)} />
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
        ) : patients.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-white/20">No patients found</div>
        ) : (
          patients.map((patient, i) => (
            <motion.div key={patient.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
              <div className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{patient.full_name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-white/30">
                      <span>{patient.patient_id}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>
                      {patient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{patient.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${patient.is_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {patient.is_verified ? "Verified" : "Unverified"}
                  </span>
                  {patient.gender && <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white/[0.04] text-white/30 border border-white/[0.06]">{patient.gender}</span>}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
