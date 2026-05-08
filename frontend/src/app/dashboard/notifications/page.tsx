"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";
import { Bell, Check, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    fetchNotifications();
  };

  const typeColor: Record<string, "default" | "success" | "warning" | "destructive"> = {
    info: "default",
    success: "success",
    warning: "warning",
    error: "destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">System alerts and updates</p>
        </div>
        <Button variant="outline" onClick={handleMarkAllRead}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark All Read
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8" />
            No notifications
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={notif.read ? "opacity-60" : "border-l-4 border-l-primary"}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <Badge variant={typeColor[notif.type] || "default"} className="text-xs">
                      {notif.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkRead(notif.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
