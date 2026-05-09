"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Bot, Calendar, Brain, Activity, HeartPulse, Shield, Phone, ArrowRight, Sparkles, Stethoscope, FileText, Users, Clock, Zap, Lock, MonitorSpeaker, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const services = [
  { icon: Bot, title: "AI Voice Receptionist", desc: "24/7 intelligent phone answering system that handles appointment booking, rescheduling, and cancellation through natural conversation. No wait times, no hold music — just instant AI assistance.", features: ["24-state FSM conversation engine", "13 intent recognition", "Spelling confirmation & go-back support", "Concurrent call handling"], color: "from-blue-500 to-cyan-500" },
  { icon: Calendar, title: "Smart Appointment Scheduling", desc: "AI-powered scheduling engine with real-time availability checking, slot locking, conflict prevention, and multi-location support across Islamabad and Multan.", features: ["Real-time slot availability", "5-minute slot locking", "Break time awareness", "Multi-doctor scheduling"], color: "from-violet-500 to-purple-500" },
  { icon: Stethoscope, title: "General Medical Consultation", desc: "Comprehensive general medicine services with three qualified physicians providing patient-centered care across two locations.", features: ["Complete health checkups", "Preventive care programs", "Chronic disease management", "Family medicine"], color: "from-emerald-500 to-teal-500" },
  { icon: HeartPulse, title: "Electronic Health Records", desc: "Complete EHR system with patient records, appointment history, medical notes, and AI-powered documentation with full audit trail compliance.", features: ["Digital patient records", "Appointment history tracking", "AI-generated clinical notes", "HIPAA-ready architecture"], color: "from-rose-500 to-pink-500" },
  { icon: Activity, title: "Real-time Analytics Dashboard", desc: "Live hospital analytics with appointment trends, AI call performance metrics, patient flow analysis, and branch comparison insights.", features: ["Live performance dashboards", "AI call resolution metrics", "Patient flow analytics", "Branch comparison reports"], color: "from-amber-500 to-orange-500" },
  { icon: Shield, title: "Security & Compliance", desc: "Enterprise-grade security with JWT authentication, role-based access control, bcrypt encryption, and comprehensive audit logging for every system operation.", features: ["JWT token authentication", "Role-based access control", "Full audit trail logging", "Rate limiting protection"], color: "from-indigo-500 to-blue-500" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/[0.08] border border-violet-500/[0.15] mb-6">
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Our Services</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            AI-Powered <span className="gradient-text">Healthcare Services</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            From AI voice scheduling to real-time EHR — everything your healthcare experience needs, powered by intelligence.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          {services.map((svc, i) => (
            <motion.div key={svc.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass rounded-2xl p-8 hover:bg-white/[0.03] transition-all">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <svc.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{svc.title}</h3>
                    <p className="text-white/35 leading-relaxed mb-6">{svc.desc}</p>
                    <div className="flex gap-4">
                      <Link href="/appointment">
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl">
                          Book Now <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                      <Link href="/voice-call">
                        <Button size="sm" variant="outline" className="border-white/[0.08] text-white/50 rounded-xl">
                          <Phone className="w-3.5 h-3.5 mr-1.5" /> Call AI
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                    <h4 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Key Features</h4>
                    <div className="space-y-2.5">
                      {svc.features.map((feat) => (
                        <div key={feat} className="flex items-center gap-2.5 text-sm text-white/40">
                          <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
