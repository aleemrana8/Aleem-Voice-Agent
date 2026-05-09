"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageSquare, Sparkles, Send, HeartPulse, Bot } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6 } })
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white">
      <Navbar />

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/[0.08] border border-blue-500/[0.15] mb-6">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">Contact Us</span>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Get In <span className="gradient-text">Touch</span>
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg text-white/40 max-w-2xl mx-auto">
            Have a question? Call our AI assistant instantly, book online, or send us a message.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-6 pb-32">
        <div className="max-w-5xl mx-auto">
          {/* Quick Actions */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Bot, title: "Call AI Assistant", desc: "Instant AI scheduling — available 24/7", href: "/voice-call", color: "from-emerald-500 to-teal-500", cta: "Call Now" },
              { icon: Phone, title: "Phone", desc: "+92 440-6848-838", href: "tel:4406848838", color: "from-blue-500 to-cyan-500", cta: "Call" },
              { icon: Mail, title: "Email", desc: "info@aleemhospital.com", href: "mailto:info@aleemhospital.com", color: "from-violet-500 to-purple-500", cta: "Email" },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i}>
                <Link href={item.href}>
                  <div className="glass rounded-xl p-6 text-center hover:bg-white/[0.05] transition-all group cursor-pointer h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-[12px] text-white/30 mb-3">{item.desc}</p>
                    <span className="text-[11px] text-blue-400 font-medium">{item.cta} →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <div className="glass rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6">Send a Message</h3>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Message Sent!</h4>
                    <p className="text-sm text-white/40">We&apos;ll get back to you shortly. Meanwhile, you can call our AI assistant for instant help.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20" placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/50 text-xs uppercase tracking-wider">Phone</Label>
                        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20" placeholder="+92..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/50 text-xs uppercase tracking-wider">Email</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/50 text-xs uppercase tracking-wider">Message</Label>
                      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 text-sm text-white placeholder:text-white/20 focus:border-blue-500/50 outline-none resize-none" placeholder="How can we help?" />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-11 font-semibold">
                      <Send className="w-4 h-4 mr-2" /> Send Message
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6">
                  <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Hospital Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 text-sm text-white/40">
                      <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div><p className="text-white/60 font-medium">Operating Hours</p><p>3:00 PM — 12:00 AM (Daily)</p><p className="text-[11px] text-white/25 mt-0.5">Break: 8:00 PM — 9:00 PM</p></div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-white/40">
                      <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div><p className="text-white/60 font-medium">Phone (AI)</p><p>+92 440-6848-838</p><p className="text-[11px] text-white/25 mt-0.5">24/7 AI voice assistant available</p></div>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-white/40">
                      <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div><p className="text-white/60 font-medium">Email</p><p>info@aleemhospital.com</p></div>
                    </div>
                  </div>
                </div>
                <div className="glass rounded-2xl p-6">
                  <h4 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Branches</h4>
                  <div className="space-y-3">
                    {[
                      { city: "Islamabad", address: "Blue Area, Islamabad" },
                      { city: "Multan", address: "Bosan Road, Multan" },
                    ].map((b) => (
                      <div key={b.city} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-white/60">{b.city}</p>
                          <p className="text-[11px] text-white/25">{b.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
