"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings, Bell, Shield, Users, Globe, Clock, Zap,
  Save, Eye, EyeOff, Key, Database, Wifi, Server,
  Smartphone, Mail, Volume2, MonitorSmartphone,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Zap },
  ];

  const inputClass = "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50 transition-all";
  const toggleClass = (active: boolean) =>
    `relative w-11 h-6 rounded-full transition-colors cursor-pointer ${active ? "bg-blue-500" : "bg-white/10"}`;

  const [settings, setSettings] = useState({
    hospitalName: "Aleem Hospital",
    phone: "+92-300-XXXXXXX",
    email: "admin@aleemhospital.com",
    timezone: "Asia/Karachi",
    islamabadActive: true,
    multanActive: true,
    scheduleStart: "15:00",
    scheduleEnd: "00:00",
    breakStart: "20:00",
    breakEnd: "21:00",
    slotDuration: 30,
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    appointmentReminder: true,
    callSummary: true,
    voiceEnabled: true,
    maxRetries: 3,
    escalateAfterFailures: 3,
    showApiKey: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-white/30 text-sm">Configure system preferences and integrations</p>
        </div>
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/15">
          {saved ? "Saved ✓" : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
        </Button>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.04] w-fit">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-medium transition-all ${
                tab === t.id
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* General Tab */}
      {tab === "general" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-6">
          <div className="glass rounded-xl p-6 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1">Hospital Information</h3>
            <p className="text-[11px] text-white/25 mb-5">Basic hospital and branch settings</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Hospital Name</Label>
                <Input value={settings.hospitalName} onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Contact Phone</Label>
                <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Admin Email</Label>
                <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Timezone</Label>
                <Input value={settings.timezone} readOnly className={`${inputClass} opacity-60`} />
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1">Branches</h3>
            <p className="text-[11px] text-white/25 mb-5">Active hospital branches</p>
            <div className="space-y-3">
              {[
                { name: "Islamabad", active: settings.islamabadActive, key: "islamabadActive" as const },
                { name: "Multan", active: settings.multanActive, key: "multanActive" as const },
              ].map((branch) => (
                <div key={branch.name} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-sm text-white/70 font-medium">{branch.name} Branch</p>
                      <p className="text-[10px] text-white/20">Aleem Hospital — {branch.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSettings({ ...settings, [branch.key]: !branch.active })} className={toggleClass(branch.active)}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${branch.active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-xl p-6 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1">Schedule Configuration</h3>
            <p className="text-[11px] text-white/25 mb-5">Operating hours and slot settings</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Start Time</Label>
                <Input type="time" value={settings.scheduleStart} onChange={(e) => setSettings({ ...settings, scheduleStart: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">End Time</Label>
                <Input type="time" value={settings.scheduleEnd} onChange={(e) => setSettings({ ...settings, scheduleEnd: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Break Start</Label>
                <Input type="time" value={settings.breakStart} onChange={(e) => setSettings({ ...settings, breakStart: e.target.value })} className={inputClass} />
              </div>
              <div className="space-y-2">
                <Label className="text-white/50 text-[11px] uppercase tracking-wider font-semibold">Break End</Label>
                <Input type="time" value={settings.breakEnd} onChange={(e) => setSettings({ ...settings, breakEnd: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="glass rounded-xl p-6 border border-white/[0.04] space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Notification Channels</h3>
              <p className="text-[11px] text-white/25">Configure how notifications are sent</p>
            </div>
            {[
              { label: "SMS Notifications", desc: "Send SMS for appointments and reminders", icon: Smartphone, key: "smsEnabled" as const, active: settings.smsEnabled },
              { label: "Email Notifications", desc: "Send email confirmations and reports", icon: Mail, key: "emailEnabled" as const, active: settings.emailEnabled },
              { label: "Push Notifications", desc: "Browser push notifications for admin", icon: MonitorSmartphone, key: "pushEnabled" as const, active: settings.pushEnabled },
              { label: "Appointment Reminders", desc: "Auto-send reminders 24h before appointment", icon: Clock, key: "appointmentReminder" as const, active: settings.appointmentReminder },
              { label: "Call Summary Reports", desc: "Send AI call summary after each call", icon: Volume2, key: "callSummary" as const, active: settings.callSummary },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">{item.label}</p>
                    <p className="text-[10px] text-white/20">{item.desc}</p>
                  </div>
                </div>
                <button onClick={() => setSettings({ ...settings, [item.key]: !item.active })} className={toggleClass(item.active)}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${item.active ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="space-y-6">
          <div className="glass rounded-xl p-6 border border-white/[0.04]">
            <h3 className="text-sm font-semibold text-white mb-1">Authentication</h3>
            <p className="text-[11px] text-white/25 mb-5">Security and access control</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-sm text-white/70 font-medium">JWT Authentication</p>
                    <p className="text-[10px] text-white/20">OAuth2 password flow with JWT tokens</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-sm text-white/70 font-medium">Password Encryption</p>
                    <p className="text-[10px] text-white/20">bcrypt hashing (direct, Python 3.14 compatible)</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-sm text-white/70 font-medium">Audit Logging</p>
                    <p className="text-[10px] text-white/20">Full audit trail for all system operations</p>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold">Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Integrations Tab */}
      {tab === "integrations" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
          <div className="glass rounded-xl p-6 border border-white/[0.04] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">System Integrations</h3>
              <p className="text-[11px] text-white/25">Connected services and APIs</p>
            </div>
            {[
              { label: "LiveKit Cloud", desc: "Voice AI pipeline — STT, TTS, real-time audio", status: "Connected", icon: Wifi, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "OpenAI GPT-4o", desc: "Intent extraction and NLU processing", status: "Connected", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "MongoDB Atlas", desc: "Primary database — Beanie ODM", status: "Connected", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Redis", desc: "Caching, Celery broker, WebSocket support", status: "Connected", icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "SIP Trunk", desc: "Phone number: 4406848838", status: "Active", icon: Smartphone, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70 font-medium">{item.label}</p>
                    <p className="text-[10px] text-white/20">{item.desc}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${item.bg} ${item.color} border border-current/20`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
