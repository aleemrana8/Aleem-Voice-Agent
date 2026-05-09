"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone, Mail, Clock, MapPin, Send, MessageSquare, User,
  Sparkles, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { HeroBackground } from "@/components/public/animated-bg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const contactInfo = [
  { icon: Phone, label: "Phone", value: "+92 440-684-8838", href: "tel:+924406848838", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: Mail, label: "Email", value: "info@aleemhospital.com", href: "mailto:info@aleemhospital.com", color: "from-violet-500/20 to-purple-500/20" },
  { icon: Clock, label: "Hours", value: "3:00 PM - 12:00 AM Daily", href: null, color: "from-emerald-500/20 to-teal-500/20" },
  { icon: MessageSquare, label: "AI Voice", value: "Available 24/7", href: "/voice-call", color: "from-amber-500/20 to-orange-500/20" },
];

const branches = [
  { city: "Islamabad", address: "F-8/3, Jinnah Avenue, Islamabad", doctors: "Dr. Aleem Rehman, Dr. Mohsin Khan", phone: "+92 440-684-8838" },
  { city: "Multan", address: "Bosan Road, Near Chowk Kumharanwala, Multan", doctors: "Dr. Aleem Rehman, Dr. Zain Abbas", phone: "+92 440-684-8838" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <HeroBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Contact Us</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Get In <span className="gradient-text">Touch</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Reach out to us through any channel — or let our AI voice assistant handle your inquiry instantly.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {contactInfo.map((item, i) => (
            <motion.div key={item.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <a href={item.href || "#"} className="block glass-card rounded-xl p-5 text-center hover:bg-white/[0.05] transition-all group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5 text-white/70" />
                </div>
                <div className="text-xs text-white/30 mb-1">{item.label}</div>
                <div className="text-sm font-medium text-white/70">{item.value}</div>
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form + Branches */}
      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-3">
            <motion.div variants={fadeUp} custom={0} className="glass-card rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6">Send a Message</h2>
              {sent && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm mb-6">
                  <CheckCircle2 className="w-4 h-4" /> Message sent! We&apos;ll get back to you soon.
                </motion.div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-white/30 font-medium block mb-1.5">Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors"
                        placeholder="Your name" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/30 font-medium block mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors"
                        placeholder="you@email.com" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-1.5">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors"
                      placeholder="+92 300 ..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/30 font-medium block mb-1.5">Message</label>
                  <textarea required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 transition-colors resize-none"
                    placeholder="How can we help?" />
                </div>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl px-6 h-11 font-semibold w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" /> Send Message
                </Button>
              </form>
            </motion.div>
          </motion.div>

          {/* Branches */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2 space-y-4">
            <motion.h3 variants={fadeUp} custom={0} className="text-lg font-bold mb-2">Our Branches</motion.h3>
            {branches.map((b, i) => (
              <motion.div key={b.city} variants={fadeUp} custom={i + 1} className="glass-card rounded-xl p-5 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white">{b.city}</h4>
                </div>
                <div className="space-y-2 text-sm text-white/35">
                  <p>{b.address}</p>
                  <p className="text-white/25"><span className="text-white/40">Doctors:</span> {b.doctors}</p>
                  <p className="text-white/25"><span className="text-white/40">Phone:</span> {b.phone}</p>
                </div>
              </motion.div>
            ))}
            <motion.div variants={fadeUp} custom={3} className="glass-card rounded-xl p-5 bg-gradient-to-br from-emerald-500/[0.06] to-teal-500/[0.06] border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">AI Assistant</span>
              </div>
              <p className="text-xs text-white/35 mb-3">Need quick help? Our AI voice agent is available 24/7 for scheduling and inquiries.</p>
              <a href="/voice-call">
                <Button size="sm" variant="outline" className="border-emerald-500/20 text-emerald-300 text-xs rounded-lg">
                  <Phone className="w-3 h-3 mr-1.5" /> Talk to AI
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
