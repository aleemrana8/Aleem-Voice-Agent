"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Phone, Mail, MapPin, Clock, Send, Sparkles,
  MessageSquare, Building2, Calendar, Bot, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] } })
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })
};

const contactInfo = [
  { icon: Phone, label: "AI Receptionist", value: "+92 440-684-8838", href: "tel:+924406848838", color: "from-emerald-500 to-teal-500", desc: "24/7 voice scheduling" },
  { icon: Mail, label: "Email", value: "info@aleemhospital.com", href: "mailto:info@aleemhospital.com", color: "from-blue-500 to-cyan-500", desc: "General inquiries" },
  { icon: Clock, label: "Hours", value: "3:00 PM — 12:00 AM", href: null, color: "from-violet-500 to-purple-500", desc: "Break: 8–9 PM" },
];

const branches = [
  { city: "Islamabad", address: "F-8/1 Markaz, Islamabad, Pakistan", doctors: "Dr. Aleem, Dr. Mohsin", gradient: "from-blue-500 to-cyan-500" },
  { city: "Multan", address: "Bosan Road, Multan, Pakistan", doctors: "Dr. Aleem, Dr. Zain", gradient: "from-violet-500 to-purple-500" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[180px]" />
          <div className="absolute inset-0 grid-pattern opacity-30" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.12] mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-400">Get in Touch</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[0.95]">
            Contact <span className="gradient-text">Us</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-white/35 max-w-2xl mx-auto">
            Have questions? Reach out through our contact form, call our AI receptionist, or visit one of our branches.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {contactInfo.map((info, i) => (
            <motion.div key={info.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} custom={i}>
              <div className="glass-card rounded-xl p-6 text-center hover:bg-white/[0.04] transition-all h-full group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">{info.label}</p>
                {info.href ? (
                  <a href={info.href} className="text-sm text-white/60 hover:text-white transition font-medium">{info.value}</a>
                ) : (
                  <p className="text-sm text-white/60 font-medium">{info.value}</p>
                )}
                <p className="text-[10px] text-white/15 mt-1">{info.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Branches */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition" placeholder="+92 300 0000000" />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Subject</label>
                    <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition" placeholder="Appointment inquiry" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-blue-500/30 transition resize-none" placeholder="Tell us how we can help..." />
                </div>
                <Button type="submit" disabled={sending}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-12 font-semibold shadow-lg shadow-blue-500/20">
                  {sending ? "Sending..." : sent ? "Message Sent!" : <><Send className="w-4 h-4 mr-2" />Send Message</>}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Branches */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold mb-2">Our Branches</h2>
            {branches.map((b) => (
              <div key={b.city} className="glass-card rounded-xl overflow-hidden hover:bg-white/[0.03] transition-all">
                <div className={`h-2 bg-gradient-to-r ${b.gradient}`} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-lg">{b.city}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-white/35">
                    <div className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5 text-white/20" />{b.address}</div>
                    <div className="flex items-start gap-2"><Clock className="w-4 h-4 shrink-0 mt-0.5 text-white/20" />3:00 PM — 12:00 AM</div>
                    <div className="flex items-start gap-2"><Calendar className="w-4 h-4 shrink-0 mt-0.5 text-white/20" />{b.doctors}</div>
                  </div>
                  <div className="mt-4 aspect-[16/9] rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center text-white/10 text-xs">
                    <MapPin className="w-4 h-4 mr-1" /> Map — {b.city}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-white/70">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/appointment"><Button variant="outline" className="w-full justify-start border-white/[0.06] text-white/50 hover:text-white rounded-xl"><Calendar className="w-4 h-4 mr-2" />Book Appointment</Button></Link>
                <Link href="/voice-call"><Button variant="outline" className="w-full justify-start border-white/[0.06] text-white/50 hover:text-white rounded-xl"><Phone className="w-4 h-4 mr-2" />Call AI Receptionist</Button></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
