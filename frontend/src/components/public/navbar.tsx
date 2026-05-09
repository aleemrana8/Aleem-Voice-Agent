"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  HeartPulse, Menu, X, ChevronRight, Phone,
  Calendar, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Doctors", href: "/doctors" },
  { name: "Services", href: "/services" },
  { name: "Locations", href: "/locations" },
  { name: "Book Appointment", href: "/appointment" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          scrolled
            ? "bg-[#060a14]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/20"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#060a14] animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Aleem Hospital</span>
              <span className="block text-[10px] text-blue-400 font-medium tracking-widest uppercase">AI-Powered Healthcare</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/voice-call">
              <Button size="sm" className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-5 h-9 text-xs font-semibold shadow-lg shadow-emerald-500/20">
                <Phone className="w-3.5 h-3.5 mr-1.5" /> Call AI
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" variant="outline" className="rounded-full border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white px-5 h-9 text-xs font-medium">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Admin Portal
              </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[99] bg-[#060a14]/98 backdrop-blur-2xl pt-24 px-6"
          >
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-4 text-lg font-medium text-white/70 hover:text-white border-b border-white/[0.04] transition-colors"
                >
                  {link.name}
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </Link>
              ))}
            </div>
            <div className="mt-8 space-y-3">
              <Link href="/voice-call" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl h-12 font-semibold">
                  <Phone className="w-4 h-4 mr-2" /> Call AI Assistant
                </Button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full border-white/[0.1] bg-white/[0.04] text-white rounded-xl h-12 mt-3">
                  <Shield className="w-4 h-4 mr-2" /> Admin Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
