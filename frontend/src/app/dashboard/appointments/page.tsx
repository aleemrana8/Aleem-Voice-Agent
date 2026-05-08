"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Search, X } from "lucide-react";
import {
  getAppointments,
  getDoctors,
  getPatients,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  checkDoctorAvailability,
} from "@/lib/api";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Form state
  const [form, setForm] = useState({
    patient_id: "",
    doctor_id: "",
    date: "",
    time_slot: "",
    reason: "",
  });

  const fetchAppointments = async () => {
    try {
      const params: any = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDate) params.date = filterDate;
      const data = await getAppointments(params);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    getDoctors().then(setDoctors).catch(console.error);
    getPatients().then(setPatients).catch(console.error);
  }, [filterStatus, filterDate]);

  const handleCheckAvailability = async () => {
    if (!form.doctor_id || !form.date) return;
    try {
      const data = await checkDoctorAvailability(form.doctor_id, form.date);
      setAvailableSlots(data.available_slots);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (form.doctor_id && form.date) {
      handleCheckAvailability();
    }
  }, [form.doctor_id, form.date]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({ ...form, booked_via: "dashboard" });
      setShowForm(false);
      setForm({ patient_id: "", doctor_id: "", date: "", time_slot: "", reason: "" });
      fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await cancelAppointment(id);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusColor: Record<string, "default" | "success" | "warning" | "destructive"> = {
    scheduled: "default",
    confirmed: "success",
    completed: "success",
    cancelled: "destructive",
    rescheduled: "warning",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Close" : "New Appointment"}
        </Button>
      </div>

      {/* New Appointment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Book New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Patient</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.patient_id}
                  onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map((p: any) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.full_name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Doctor</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.doctor_id}
                  onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((d: any) => (
                    <option key={d.employee_id} value={d.employee_id}>
                      {d.full_name} - {d.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time Slot</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.time_slot}
                  onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                  required
                >
                  <option value="">Select slot</option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {form.doctor_id && form.date && availableSlots.length === 0 && (
                  <p className="text-xs text-destructive">No slots available</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Reason</Label>
                <Input
                  placeholder="Reason for visit"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full">
                  Book Appointment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <Input
          type="date"
          className="w-auto"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No appointments found
            </CardContent>
          </Card>
        ) : (
          appointments.map((appt) => (
            <Card key={appt.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium">{appt.patient_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {appt.doctor_name} • {appt.date} at {appt.time_slot}
                  </p>
                  {appt.reason && (
                    <p className="text-xs text-muted-foreground">Reason: {appt.reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Booked via: {appt.booked_via}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusColor[appt.status] || "default"}>
                    {appt.status}
                  </Badge>
                  {appt.status !== "cancelled" && appt.status !== "completed" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(appt.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
