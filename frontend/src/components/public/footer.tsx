"use client";

import Link from "next/link";
import {
  HeartPulse, Phone, Mail, MapPin, Clock,
  Facebook, Twitter, Linkedin, Youtube, Instagram,
  ArrowRight, Shield,
} from "lucide-react";

const footerLinks = {
  "Quick Links": [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Doctors", href: "/doctors" },
    { name: "Services", href: "/services" },
    { name: "Book Appointment", href: "/appointment" },
  ],
  "Services": [
    { name: "AI Voice Assistant", href: "/voice-call" },
    { name: "Online Booking", href: "/appointment" },
    { name: "General Medicine", href: "/services" },
    { name: "EHR System", href: "/services" },
    { name: "Emergency Care", href: "/contact" },
  ],
  "Locations": [
    { name: "Islamabad Branch", href: "/locations" },
    { name: "Multan Branch", href: "/locations" },
    { name: "Contact Us", href: "/contact" },
    { name: "Get Directions", href: "/locations" },
  ],
};

const socials = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export function Footer() {
  return (
    <footer className="relative bg-[#040710] border-t border-white/[0.04]">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl mb-16 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-blue-600/20 border border-white/[0.06]">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] bg-cyan-500/10 rounded-full blur-[80px]" />
          </div>
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to Experience AI Healthcare?
              </h3>
              <p className="text-white/40 max-w-lg">
                Book your appointment online or call our AI assistant. Available 24/7 for scheduling.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/appointment">
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                  Book Appointment <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/voice-call">
                <button className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white font-semibold hover:bg-white/[0.1] transition-all flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Call AI
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">Aleem Hospital</span>
                <span className="block text-[10px] text-blue-400 font-medium tracking-widest uppercase">AI-Powered Healthcare</span>
              </div>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed mb-6 max-w-sm">
              Pakistan&apos;s first AI-native hospital platform with 24/7 voice scheduling, 
              intelligent EHR, and real-time analytics across Islamabad and Multan.
            </p>
            <div className="space-y-3">
              <a href="tel:4406848838" className="flex items-center gap-3 text-sm text-white/40 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-blue-400" /> +92 440-6848-838
              </a>
              <a href="mailto:info@aleemhospital.com" className="flex items-center gap-3 text-sm text-white/40 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-blue-400" /> info@aleemhospital.com
              </a>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <Clock className="w-4 h-4 text-blue-400" /> 3:00 PM — 12:00 AM (Daily)
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-white/30 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Socials + Admin + Copyright */}
        <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all"
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-xs text-white/25 hover:text-blue-400 transition-colors"
            >
              <Shield className="w-3 h-3" /> Admin Portal
            </Link>
            <p className="text-xs text-white/20">
              © {new Date().getFullYear()} Aleem Hospital. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
