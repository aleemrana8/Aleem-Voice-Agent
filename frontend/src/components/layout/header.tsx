"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUnreadCount } from "@/lib/api";

export function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    getUnreadCount()
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.04] bg-[#080c16]/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            placeholder="Search patients, doctors, appointments..."
            className="pl-10 h-10 bg-white/[0.03] border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:border-blue-500/30 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">AI Active</span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/[0.04]" asChild>
          <a href="/dashboard/notifications">
            <Bell className="h-4.5 w-4.5 text-white/40" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </a>
        </Button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-white/[0.06]">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.full_name?.[0] || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white/80">{user?.full_name || "Admin"}</p>
            <p className="text-[10px] text-white/30 capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
