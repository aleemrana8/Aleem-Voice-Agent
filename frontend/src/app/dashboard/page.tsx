"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Stethoscope,
  Phone,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentAppointments,
  getRecentCalls,
  createDashboardWebSocket,
} from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, apptData, callsData] = await Promise.all([
        getDashboardStats(),
        getRecentAppointments(5),
        getRecentCalls(5),
      ]);
      setStats(statsData);
      setRecentAppointments(apptData);
      setRecentCalls(callsData);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSocket for realtime updates
    const ws = createDashboardWebSocket();
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (
          data.type === "appointment_created" ||
          data.type === "appointment_rescheduled" ||
          data.type === "appointment_cancelled" ||
          data.type === "call_started" ||
          data.type === "call_ended"
        ) {
          fetchData();
        }
      };
      ws.onerror = () => {};
      return () => ws.close();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats?.total_patients || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Active Doctors",
      value: stats?.total_doctors || 0,
      icon: Stethoscope,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Today's Appointments",
      value: stats?.today_appointments || 0,
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Total Calls",
      value: stats?.total_calls || 0,
      icon: Phone,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Active Calls",
      value: stats?.active_calls || 0,
      icon: TrendingUp,
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      title: "Total Appointments",
      value: stats?.total_appointments || 0,
      icon: Clock,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  const statusColor: Record<string, "default" | "success" | "warning" | "destructive"> = {
    scheduled: "default",
    confirmed: "success",
    completed: "success",
    cancelled: "destructive",
    rescheduled: "warning",
    in_progress: "warning",
    failed: "destructive",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Aleem EHR Management System</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment Breakdown */}
      {stats?.appointment_breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appointment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.appointment_breakdown.scheduled}
                </p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {stats.appointment_breakdown.completed}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">
                  {stats.appointment_breakdown.cancelled}
                </p>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments yet</p>
              ) : (
                recentAppointments.map((appt: any) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{appt.patient_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.doctor_name} • {appt.date} at {appt.time_slot}
                      </p>
                    </div>
                    <Badge variant={statusColor[appt.status] || "default"}>
                      {appt.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCalls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No calls yet</p>
              ) : (
                recentCalls.map((call: any) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {call.patient_name || call.caller_phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {call.intent || "Unknown"} • {call.duration_seconds}s
                      </p>
                    </div>
                    <Badge variant={statusColor[call.status] || "default"}>
                      {call.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
