"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDoctors } from "@/lib/api";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const dayLabels: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doctors</h1>
        <p className="text-muted-foreground">View doctor schedules and availability</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{doctor.full_name}</CardTitle>
                  <Badge variant={doctor.is_active ? "success" : "destructive"}>
                    {doctor.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Contact</p>
                  <p className="text-sm">{doctor.phone}</p>
                  {doctor.email && <p className="text-xs text-muted-foreground">{doctor.email}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Schedule</p>
                  <div className="space-y-1">
                    {Object.entries(doctor.schedule || {}).map(([day, sched]: [string, any]) => (
                      <div key={day} className="flex justify-between text-xs">
                        <span className="font-medium">{dayLabels[day] || day}</span>
                        <span className="text-muted-foreground">
                          {sched.start} - {sched.end} ({sched.slot_duration}min)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">ID: {doctor.employee_id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
