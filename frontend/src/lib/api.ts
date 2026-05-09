import type {
  Appointment,
  AppointmentCreate,
  AppointmentReschedule,
  AppointmentStats,
  CallLog,
  CallStats,
  DashboardStats,
  Doctor,
  DoctorAvailability,
  Notification,
  Patient,
  PatientCreate,
  TokenResponse,
  Transcript,
  User,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_V1 = `${API_BASE}/api/v1`;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_V1}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────
export async function login(username: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_V1}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(error.detail);
  }
  return res.json() as Promise<TokenResponse>;
}

export function getMe() {
  return request<User>("/auth/me");
}

// ── Dashboard ───────────────────────────────────────
export function getDashboardStats() {
  return request<DashboardStats>("/dashboard/stats");
}

export function getRecentAppointments(limit = 10) {
  return request<Appointment[]>(`/dashboard/recent-appointments?limit=${limit}`);
}

export function getRecentCalls(limit = 10) {
  return request<CallLog[]>(`/dashboard/recent-calls?limit=${limit}`);
}

// ── Patients ────────────────────────────────────────
export function getPatients(params?: { skip?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.skip) query.set("skip", String(params.skip));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  return request<Patient[]>(`/patients/?${query}`);
}

export function getPatient(patientId: string) {
  return request<Patient>(`/patients/${patientId}`);
}

export function createPatient(data: PatientCreate) {
  return request<Patient>("/patients/", { method: "POST", body: JSON.stringify(data) });
}

export function updatePatient(patientId: string, data: Partial<PatientCreate>) {
  return request<Patient>(`/patients/${patientId}`, { method: "PUT", body: JSON.stringify(data) });
}

// ── Doctors ─────────────────────────────────────────
export function getDoctors(params?: { specialization?: string }) {
  const query = new URLSearchParams();
  if (params?.specialization) query.set("specialization", params.specialization);
  return request<Doctor[]>(`/doctors/?${query}`);
}

export function getDoctor(employeeId: string) {
  return request<Doctor>(`/doctors/${employeeId}`);
}

export function checkDoctorAvailability(doctorId: string, date: string) {
  return request<DoctorAvailability>("/doctors/availability", {
    method: "POST",
    body: JSON.stringify({ doctor_id: doctorId, date }),
  });
}

// ── Appointments ────────────────────────────────────
export function getAppointments(params?: {
  status?: string; date?: string; doctor_id?: string; patient_id?: string;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.date) query.set("date", params.date);
  if (params?.doctor_id) query.set("doctor_id", params.doctor_id);
  if (params?.patient_id) query.set("patient_id", params.patient_id);
  return request<Appointment[]>(`/appointments/?${query}`);
}

export function createAppointment(data: AppointmentCreate) {
  return request<Appointment>("/appointments/", { method: "POST", body: JSON.stringify(data) });
}

export function rescheduleAppointment(id: string, data: AppointmentReschedule) {
  return request<Appointment>(`/appointments/${id}/reschedule`, { method: "PUT", body: JSON.stringify(data) });
}

export function cancelAppointment(id: string, reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return request<Appointment>(`/appointments/${id}/cancel${query}`, { method: "PUT" });
}

export function getAppointmentStats() {
  return request<AppointmentStats>("/appointments/stats/summary");
}

// ── Calls ───────────────────────────────────────────
export function getCallLogs(params?: { status?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  return request<CallLog[]>(`/calls/?${query}`);
}

export function getCallLog(callId: string) {
  return request<CallLog>(`/calls/${callId}`);
}

export function getCallTranscript(callId: string) {
  return request<Transcript>(`/calls/${callId}/transcript`);
}

export function getCallStats() {
  return request<CallStats>("/calls/stats/summary");
}

// ── Notifications ───────────────────────────────────
export function getNotifications(unreadOnly = false) {
  return request<Notification[]>(`/notifications/?unread_only=${unreadOnly}`);
}

export function markNotificationRead(id: string) {
  return request<{ status: string }>(`/notifications/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead() {
  return request<{ status: string }>("/notifications/read-all", { method: "PUT" });
}

export function getUnreadCount() {
  return request<{ count: number }>("/notifications/unread-count");
}

// ── WebSocket ───────────────────────────────────────
export function createDashboardWebSocket(): WebSocket | null {
  if (typeof window === "undefined") return null;
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
  return new WebSocket(`${wsUrl}/dashboard`);
}

export function createCallsWebSocket(): WebSocket | null {
  if (typeof window === "undefined") return null;
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
  return new WebSocket(`${wsUrl}/calls`);
}

// ── Public API (no auth required) ───────────────────
export async function publicRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_V1}${path}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getPublicDoctors() {
  return publicRequest<any[]>("/public/doctors");
}

export function checkPublicAvailability(doctorId: string, date: string) {
  return fetch(`${API_V1}/public/availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctor_id: doctorId, date }),
  }).then(async (r) => {
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: "Failed to check availability" }));
      throw new Error(err.detail);
    }
    return r.json();
  });
}

export function createPublicAppointment(data: {
  doctor_id: string;
  date: string;
  time_slot: string;
  reason?: string;
  patient_name: string;
  patient_phone: string;
}) {
  return fetch(`${API_V1}/public/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(async (r) => {
    if (!r.ok) {
      const err = await r.json().catch(() => ({ detail: "Booking failed" }));
      throw new Error(err.detail);
    }
    return r.json();
  });
}

// ── Audit Logs ──────────────────────────────────────
export function getAuditLogs(params?: { resource_type?: string; action?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.resource_type) query.set("resource_type", params.resource_type);
  if (params?.action) query.set("action", params.action);
  if (params?.limit) query.set("limit", String(params.limit));
  return request<any>(`/audit/logs?${query}`);
}

export function getResourceAuditTrail(resourceType: string, resourceId: string) {
  return request<any>(`/audit/logs/resource/${resourceType}/${resourceId}`);
}

// ── Workflow Engine ─────────────────────────────────
export function getWorkflowSessions() {
  return request<any>("/workflow/sessions");
}

export function getWorkflowSession(callId: string) {
  return request<any>(`/workflow/sessions/${callId}`);
}

// ── EHR Sync ────────────────────────────────────────
export function getEHRSyncStats() {
  return request<any>("/ehr/sync/stats");
}

export function getEHRSyncLogs(params?: { status?: string; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  return request<any>(`/ehr/sync/logs?${query}`);
}
