"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, Stethoscope,
  Phone, Bell, LogOut, Mic, BarChart3, Brain,
  HeartPulse, Settings, FileText, Shield, Activity,
  Headphones, ClipboardList, Radio, ChevronDown,
  Layers, MonitorSpeaker, DatabaseZap, UserCog,
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3, badge: "AI" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { name: "Patients", href: "/admin/patients", icon: Users },
      { name: "Doctors", href: "/admin/doctors", icon: Stethoscope },
      { name: "Appointments", href: "/admin/appointments", icon: Calendar },
      { name: "EHR Records", href: "/admin/ehr-records", icon: FileText },
    ],
  },
  {
    label: "AI Voice System",
    items: [
      { name: "Voice Command Center", href: "/admin/voice-center", icon: Headphones, badge: "Live" },
    ],
  },
  {
    label: "Administration",
    items: [
      { name: "Audit Logs", href: "/admin/audit-logs", icon: Shield },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full w-[272px] flex-col bg-[#0a0e1a] border-r border-white/[0.06]">
      {/* Brand Header */}
      <div className="flex h-[72px] items-center gap-3.5 px-6 border-b border-white/[0.06]">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-[2.5px] border-[#0a0e1a] animate-pulse" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold text-white tracking-tight">Aleem Hospital</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-[10px] text-emerald-400/80 font-semibold tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">{group.label}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-500/[0.12] to-cyan-500/[0.08] text-white border border-blue-500/20 shadow-sm"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                      isActive
                        ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                        : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                    )}>
                      <item.icon className={cn("h-4 w-4", isActive ? "text-blue-400" : "text-white/40 group-hover:text-white/60")} />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded-full",
                        item.badge === "AI" 
                          ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/20" 
                          : item.badge === "Live"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/15 text-blue-400"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-white/[0.06] p-4 space-y-3">
        {/* System Status */}
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-teal-500/[0.04] border border-emerald-500/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-emerald-400/90">System Healthy</p>
              <p className="text-[9px] text-white/25">All services operational</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
