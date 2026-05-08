// ── API Type Definitions ────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "doctor" | "staff";
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Patient {
  id: string;
  patient_id: string;
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  is_verified: boolean;
  created_at: string;
}

export interface PatientCreate {
  full_name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
}

export interface DaySchedule {
  start: string;
  end: string;
  slot_duration: number;
}

export interface Doctor {
  id: string;
  employee_id: string;
  full_name: string;
  specialization: string;
  phone: string;
  email?: string;
  schedule: Record<string, DaySchedule>;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient_name: string;
  doctor_name: string;
  date: string;
  time_slot: string;
  duration: number;
  reason?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "no_show";
  booked_via: "voice" | "dashboard" | "api";
  notes?: string;
  created_at: string;
}

export interface AppointmentCreate {
  patient_id: string;
  doctor_id: string;
  date: string;
  time_slot: string;
  duration?: number;
  reason?: string;
  booked_via?: string;
}

export interface AppointmentReschedule {
  new_date: string;
  new_time_slot: string;
  reason?: string;
}

export interface CallLog {
  id: string;
  call_id: string;
  caller_phone: string;
  patient_id?: string;
  patient_name?: string;
  duration_seconds: number;
  status: "in_progress" | "completed" | "failed" | "dropped";
  intent?: string;
  outcome?: string;
  summary?: string;
  created_at: string;
  ended_at?: string;
}

export interface TranscriptEntry {
  speaker: "agent" | "patient";
  text: string;
  timestamp: string;
}

export interface Transcript {
  id: string;
  call_id: string;
  entries: TranscriptEntry[];
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  link?: string;
  created_at: string;
}

export interface DoctorAvailability {
  doctor: string;
  date: string;
  available_slots: string[];
  total_slots: number;
  booked_slots: number;
}

export interface DashboardStats {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  today_appointments: number;
  total_calls: number;
  active_calls: number;
  appointment_breakdown: {
    scheduled: number;
    completed: number;
    cancelled: number;
  };
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  today: number;
}

export interface CallStats {
  total: number;
  completed: number;
  failed: number;
  in_progress: number;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}
