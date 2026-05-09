"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Phone, Calendar, Activity, ShieldCheck, BarChart3, Brain,
  Mic, MapPin, FileText, ArrowRight, Sparkles, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground, GradientOrbs } from "@/components/public/animated-bg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const services = [
  {
    icon: Mic, title: "AI Voice Receptionist",
    desc: "24/7 intelligent voice agent powered by GPT-4o. Handles scheduling, rescheduling, and cancellations via natural conversation.",
    features: ["Natural language understanding", "24-state FSM workflow", "SIP trunk integration", "Real-time transcription"],
    color: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: Calendar, title: "Smart Scheduling",
    desc: "AI-powered appointment engine with real-time slot calculation, conflict prevention, and multi-doctor support.",
    features: ["Real-time availability", "Break time handling", "Slot locking", "Multi-location support"],
    color: "from-emerald-500 to-teal-500", bg: "from-emerald-500/10 to-teal-500/10",
  },
  {
    icon: Activity, title: "General Medicine",
    desc: "Comprehensive healthcare services across Islamabad and Multan. 3PM-12AM daily with experienced physicians.",
    features: ["Preventive care", "Chronic disease management", "Health screenings", "Family medicine"],
    color: "from-rose-500 to-pink-500", bg: "from-rose-500/10 to-pink-500/10",
  },
  {
    icon: FileText, title: "Electronic Health Records",
    desc: "Fully digital medical records with AI-assisted data entry from voice calls. Secure, searchable, and always up to date.",
    features: ["Auto-populated from calls", "Searchable records", "Export capabilities", "HIPAA-ready"],
    color: "from-violet-500 to-purple-500", bg: "from-violet-500/10 to-purple-500/10",
  },
  {
    icon: BarChart3, title: "Real-time Analytics",
    desc: "Live dashboard with WebSocket updates for call volumes, appointment trends, revenue metrics, and operational KPIs.",
    features: ["WebSocket live updates", "Revenue tracking", "Call analytics", "Trend forecasting"],
    color: "from-amber-500 to-orange-500", bg: "from-amber-500/10 to-orange-500/10",
  },
  {
    icon: ShieldCheck, title: "Enterprise Security",
    desc: "JWT authentication, role-based access control, bcrypt encryption, complete audit trails, and session management.",
    features: ["JWT + OAuth2", "RBAC policies", "Audit logging", "Encrypted storage"],
    color: "from-cyan-500 to-blue-500", bg: "from-cyan-500/10 to-blue-500/10",
  },
  {
    icon: Phone, title: "Call Monitoring",
    desc: "Real-time call tracking with live transcription, intent classification, sentiment analysis, and call recordings.",
    features: ["Live transcription", "Intent extraction", "Call recordings", "Sentiment scoring"],
    color: "from-teal-500 to-emerald-500", bg: "from-teal-500/10 to-emerald-500/10",
  },
  {
    icon: MapPin, title: "Multi-Location Network",
    desc: "Unified platform managing Islamabad and Multan branches with location-aware scheduling and shared analytics.",
    features: ["Shared doctor pools", "Location-aware booking", "Unified analytics", "Cross-branch transfers"],
    color: "from-purple-500 to-violet-500", bg: "from-purple-500/10 to-violet-500/10",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] mb-6">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Our Services</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            AI-Powered <span className="gradient-text">Healthcare</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            From voice AI to smart scheduling — a comprehensive suite of services designed for the modern healthcare experience.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-10 px-6 pb-32">
        <GradientOrbs />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass-card rounded-2xl p-6 hover:bg-white/[0.05] transition-all group h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <s.icon className={`w-6 h-6 bg-gradient-to-r ${s.color} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(135deg, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' } as React.CSSProperties} />
                    <s.icon className={`w-6 h-6 text-white/70 absolute`} style={{ display: 'none' }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed mb-4">{s.desc}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {s.features.map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-white/30">
                        <Sparkles className="w-3 h-3 text-blue-400/40 shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">Ready to <span className="gradient-text">Experience</span> the Future?</motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-white/40 mb-8">Book an appointment online or let our AI voice assistant handle it for you.</motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex gap-4 justify-center">
              <Link href="/appointment"><Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-6 h-11 font-semibold">Book Now <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
              <Link href="/voice-call"><Button variant="outline" className="border-white/[0.1] bg-white/[0.03] text-white rounded-xl px-6 h-11"><Phone className="w-4 h-4 mr-2" /> Call AI</Button></Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
