"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Settings, ChevronDown, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUnreadCount } from "@/lib/api";
import Link from "next/link";

export function AdminHeader() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch {}
    }
    getUnreadCount()
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});

    const updateTime = () => {
      setTime(new Date().toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric", 
        hour: "2-digit", minute: "2-digit",
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-white/[0.06] bg-[#0a0e1a]/90 backdrop-blur-2xl px-6 sticky top-0 z-40">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-lg w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
          <Input
            placeholder="Search patients, appointments, doctors..."
            className="pl-10 h-11 bg-white/[0.03] border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:border-blue-500/30 focus:bg-white/[0.05] w-full transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/15 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] hidden md:block">⌘K</kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <Link href="/admin/appointments">
          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl h-9 px-3 text-xs font-medium shadow-lg shadow-blue-500/10 hidden md:flex">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Appointment
          </Button>
        </Link>

        {/* AI Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
          <div className="relative">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">AI Online</span>
        </div>

        {/* Date/Time */}
        <div className="hidden md:block text-right px-3">
          <p className="text-[11px] text-white/25">{time}</p>
        </div>

        {/* Notifications */}
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/[0.04] h-10 w-10">
            <Bell className="h-[18px] w-[18px] text-white/40" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-white/[0.06]">
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/15">
              {user?.full_name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0e1a]" />
          </div>
          <div className="hidden lg:block">
            <p className="text-[13px] font-semibold text-white/80 leading-tight">{user?.full_name || "Administrator"}</p>
            <p className="text-[10px] text-white/30 capitalize leading-tight">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
