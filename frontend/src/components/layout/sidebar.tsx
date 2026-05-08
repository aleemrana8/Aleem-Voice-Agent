"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  Phone, Bell, LogOut, Mic, BarChart3, Brain,
  HeartPulse, Settings, Sparkles, Radio, MessageSquare,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
  { name: "Live Calls", href: "/dashboard/live-calls", icon: Radio },
  { name: "Call Center", href: "/dashboard/calls", icon: Phone },
  { name: "Transcripts", href: "/dashboard/transcripts", icon: MessageSquare },
  { name: "Voice Agent", href: "/dashboard/voice", icon: Mic },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "AI Insights", href: "/dashboard/insights", icon: Brain },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full w-[260px] flex-col bg-[#080c16] border-r border-white/[0.04]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.04]">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <HeartPulse className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#080c16]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">Aleem EHR</h1>
          <div className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-blue-400" />
            <p className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">AI EHR</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        <div className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 pt-2 pb-2">Menu</div>
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500/15 to-cyan-500/10 text-white border border-blue-500/20 shadow-lg shadow-blue-500/5"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "")} />
              {item.name}
              {item.name === "AI Insights" && (
                <span className="ml-auto text-[9px] font-bold bg-gradient-to-r from-violet-500 to-purple-500 text-white px-1.5 py-0.5 rounded-full">AI</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.04] p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/30 hover:text-red-400 hover:bg-red-500/[0.05] transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
