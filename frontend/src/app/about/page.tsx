"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Clock, Users, CheckCircle2, ArrowRight, HeartPulse, Brain, Calendar, Shield, Stethoscope, Sparkles, Star, Globe, Zap, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const milestones = [
  { year: "2024", title: "Foundation", desc: "Aleem Hospital established with a vision for AI-native healthcare" },
  { year: "2024", title: "AI Integration", desc: "Deployed 24-state FSM voice agent with GPT-4o NLU pipeline" },
  { year: "2025", title: "Multi-Branch", desc: "Expanded to Islamabad and Multan with unified AI network" },
  { year: "2026", title: "EHR Platform", desc: "Full EHR system with admin panel, analytics, and audit compliance" },
];

const values = [
  { icon: Brain, title: "AI-First Innovation", desc: "We believe healthcare should be intelligent, automated, and accessible through cutting-edge AI." },
  { icon: HeartPulse, title: "Patient-Centered Care", desc: "Every decision is made with patient comfort and health outcomes as the top priority." },
  { icon: Shield, title: "Trust & Security", desc: "Enterprise-grade security, full audit trails, and HIPAA-ready architecture for peace of mind." },
  { icon: Globe, title: "Accessibility", desc: "24/7 AI voice access, online booking, multi-location support — healthcare without barriers." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">About Aleem Hospital</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Redefining Healthcare<br /><span className="gradient-text">With AI Intelligence</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            Aleem Hospital is Pakistan&apos;s first AI-native healthcare platform, combining world-class medical expertise with cutting-edge artificial intelligence to deliver exceptional patient experiences.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-emerald-400 tracking-widest uppercase block mb-4">Our Mission</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mb-6">Making Healthcare<br/>Accessible & Intelligent</motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-white/40 leading-relaxed mb-6">
                We believe that every patient deserves instant, intelligent healthcare access. Our AI voice receptionist answers every call, our smart scheduling prevents every conflict, and our EHR system tracks every interaction — 24/7, 365 days a year.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="space-y-3">
                {["24/7 AI voice receptionist — no hold time, no busy signals", "Real-time appointment booking with smart slot management", "Two branches unified under one AI network", "Complete EHR with audit compliance and analytics"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-white/50 text-sm">{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="glass rounded-2xl p-8 glow-blue">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { val: "3", label: "Expert Doctors", icon: Stethoscope },
                    { val: "2", label: "Locations", icon: MapPin },
                    { val: "24/7", label: "AI Availability", icon: Clock },
                    { val: "94%", label: "AI Resolution", icon: Brain },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                      <s.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold gradient-text">{s.val}</div>
                      <div className="text-[11px] text-white/30 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-violet-400 tracking-widest uppercase">Our Values</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mt-4">What Drives Us</motion.h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-xl p-6 h-full hover:bg-white/[0.04] transition-all group">
                  <v.icon className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <motion.span variants={fadeUp} custom={0} className="text-sm font-semibold text-amber-400 tracking-widest uppercase">Our Journey</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-bold mt-4">Key Milestones</motion.h2>
          </motion.div>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <div className="glass rounded-xl p-6 flex items-start gap-6 hover:bg-white/[0.04] transition-all">
                  <div className="text-sm font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg shrink-0">{m.year}</div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{m.title}</h3>
                    <p className="text-sm text-white/35">{m.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience<br /><span className="gradient-text">AI Healthcare?</span>
          </motion.h2>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/appointment"><Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-8 h-12 font-semibold">Book Appointment <ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <Link href="/voice-call"><Button size="lg" variant="outline" className="rounded-full border-white/[0.08] text-white px-8 h-12"><Phone className="w-4 h-4 mr-2" /> Call AI Assistant</Button></Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
