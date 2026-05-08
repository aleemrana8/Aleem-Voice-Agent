"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api";
import { Bell, Check, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.4 } }),
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try { const data = await getNotifications(); setNotifications(data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => { await markNotificationRead(id); fetchNotifications(); };
  const handleMarkAllRead = async () => { await markAllNotificationsRead(); fetchNotifications(); };

  const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10" },
    success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
    error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  };

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-white/30 text-sm">System alerts and updates</p>
        </div>
        <Button onClick={handleMarkAllRead} className="bg-white/[0.06] hover:bg-white/[0.1] text-white/60 rounded-xl border border-white/[0.06]">
          <CheckCheck className="mr-2 h-4 w-4" />Mark All Read
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
      ) : notifications.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <Bell className="mx-auto mb-3 h-8 w-8 text-white/10" />
          <p className="text-white/20">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const tc = typeConfig[notif.type] || typeConfig.info;
            const Icon = tc.icon;
            return (
              <motion.div key={notif.id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <div className={`glass rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors ${!notif.read ? "border-l-2 border-l-blue-500/50" : "opacity-50"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-lg ${tc.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${tc.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white/80">{notif.title}</p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tc.bg} ${tc.color}`}>{notif.type}</span>
                      </div>
                      <p className="text-[12px] text-white/40 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-white/15 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notif.id)} className="text-white/30 hover:text-white hover:bg-white/[0.04] rounded-lg h-7 w-7 p-0">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
