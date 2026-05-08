"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUnreadCount } from "@/lib/api";

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    }

    getUnreadCount()
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h2 className="text-lg font-semibold">Aleem EHR</h2>
        <p className="text-xs text-muted-foreground">AI Hospital Management System</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" asChild>
          <a href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {unreadCount}
              </Badge>
            )}
          </a>
        </Button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user?.full_name?.[0] || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.full_name || "Admin"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
