"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Phone, Mail, MapPin, Clock, Send, ArrowRight, Sparkles,
  MessageSquare, Globe, Building2, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

const contactInfo = [
  { icon: Phone, label: "Phone (AI Receptionist)", value: "+92 440-684-8838", href: "tel:+924406848838", color: "from-emerald-500 to-teal-500" },
  { icon: Mail, label: "Email", value: "info@aleemhospital.com", href: "mailto:info@aleemhospital.com", color: "from-blue-500 to-cyan-500" },
  { icon: Clock, label: "Hours", value: "3:00 PM — 12:00 AM (Break 8–9 PM)", href: null, color: "from-violet-500 to-purple-500" },
];

const branches = [
  { city: "Islamabad", address: "F-8/1 Markaz, Islamabad, Pakistan", doctors: "Dr. Aleem, Dr. Mohsin" },
  { city: "Multan", address: "Bosan Road, Multan, Pakistan", doctors: "Dr. Aleem, Dr. Zain" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Get in Touch</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Contact <span className="gradient-text">Us</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Have questions? Reach out through our contact form, call our AI receptionist, or visit one of our branches.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {contactInfo.map((info, i) => (
            <motion.div key={info.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="glass rounded-xl p-5 text-center hover:bg-white/[0.04] transition-all h-full">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-3`}>
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">{info.label}</p>
                {info.href ? (
                  <a href={info.href} className="text-sm text-white/70 hover:text-white transition">{info.value}</a>
                ) : (
                  <p className="text-sm text-white/70">{info.value}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="lg:col-span-3">
            <div className="glass rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/30" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/30" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/30" placeholder="+92 300 0000000" />
                  </div>
                  <div>
                    <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Subject</label>
                    <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/30" placeholder="Appointment inquiry" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/30 uppercase tracking-wider mb-1.5 block">Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/30 resize-none" placeholder="Tell us how we can help..." />
                </div>
                <Button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg h-11 font-semibold">
                  {sending ? "Sending..." : sent ? "Message Sent!" : <><Send className="w-4 h-4 mr-2" />Send Message</>}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Branches */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="lg:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold mb-2">Our Branches</h2>
            {branches.map((b) => (
              <div key={b.city} className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-lg">{b.city}</h3>
                </div>
                <div className="space-y-2 text-sm text-white/40">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 shrink-0 mt-0.5" />{b.address}</div>
                  <div className="flex items-start gap-2"><Clock className="w-4 h-4 shrink-0 mt-0.5" />3:00 PM — 12:00 AM</div>
                  <div className="flex items-start gap-2"><Calendar className="w-4 h-4 shrink-0 mt-0.5" />{b.doctors}</div>
                </div>
                <div className="mt-4 aspect-[16/9] rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/15 text-xs">
                  <MapPin className="w-5 h-5 mr-1" /> Map — {b.city}
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/appointment"><Button variant="outline" className="w-full justify-start border-white/[0.06] text-white/60 hover:text-white"><Calendar className="w-4 h-4 mr-2" />Book Appointment</Button></Link>
                <Link href="/voice-call"><Button variant="outline" className="w-full justify-start border-white/[0.06] text-white/60 hover:text-white"><Phone className="w-4 h-4 mr-2" />Call AI Receptionist</Button></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
