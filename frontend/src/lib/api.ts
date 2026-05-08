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
export async function login(email: string, password: string) {
  const formData = new URLSearchParams();
  formData.append("username", email);
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
  return res.json();
}

export function getMe() {
  return request<any>("/auth/me");
}

// ── Dashboard ───────────────────────────────────────
export function getDashboardStats() {
  return request<any>("/dashboard/stats");
}

export function getRecentAppointments(limit = 10) {
  return request<any[]>(`/dashboard/recent-appointments?limit=${limit}`);
}

export function getRecentCalls(limit = 10) {
  return request<any[]>(`/dashboard/recent-calls?limit=${limit}`);
}

// ── Patients ────────────────────────────────────────
export function getPatients(params?: { skip?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.skip) query.set("skip", String(params.skip));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  return request<any[]>(`/patients/?${query}`);
}

export function getPatient(patientId: string) {
  return request<any>(`/patients/${patientId}`);
}

export function createPatient(data: any) {
  return request<any>("/patients/", { method: "POST", body: JSON.stringify(data) });
}

export function updatePatient(patientId: string, data: any) {
  return request<any>(`/patients/${patientId}`, { method: "PUT", body: JSON.stringify(data) });
}

// ── Doctors ─────────────────────────────────────────
export function getDoctors(params?: { specialization?: string }) {
  const query = new URLSearchParams();
  if (params?.specialization) query.set("specialization", params.specialization);
  return request<any[]>(`/doctors/?${query}`);
}

export function getDoctor(employeeId: string) {
  return request<any>(`/doctors/${employeeId}`);
}

export function checkDoctorAvailability(doctorId: string, date: string) {
  return request<any>("/doctors/availability", {
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
  return request<any[]>(`/appointments/?${query}`);
}

export function createAppointment(data: any) {
  return request<any>("/appointments/", { method: "POST", body: JSON.stringify(data) });
}

export function rescheduleAppointment(id: string, data: any) {
  return request<any>(`/appointments/${id}/reschedule`, { method: "PUT", body: JSON.stringify(data) });
}

export function cancelAppointment(id: string, reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  return request<any>(`/appointments/${id}/cancel${query}`, { method: "PUT" });
}

export function getAppointmentStats() {
  return request<any>("/appointments/stats/summary");
}

// ── Calls ───────────────────────────────────────────
export function getCallLogs(params?: { status?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  return request<any[]>(`/calls/?${query}`);
}

export function getCallLog(callId: string) {
  return request<any>(`/calls/${callId}`);
}

export function getCallTranscript(callId: string) {
  return request<any>(`/calls/${callId}/transcript`);
}

export function getCallStats() {
  return request<any>("/calls/stats/summary");
}

// ── Notifications ───────────────────────────────────
export function getNotifications(unreadOnly = false) {
  return request<any[]>(`/notifications/?unread_only=${unreadOnly}`);
}

export function markNotificationRead(id: string) {
  return request<any>(`/notifications/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead() {
  return request<any>("/notifications/read-all", { method: "PUT" });
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
