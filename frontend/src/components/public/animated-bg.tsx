"use client";

import { motion } from "framer-motion";

export function GradientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-blue-500/[0.07] rounded-full blur-[150px]"
      />
      <motion.div
        animate={{ x: [0, -25, 35, 0], y: [0, 30, -25, 0], scale: [1, 0.95, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-cyan-500/[0.05] rounded-full blur-[130px]"
      />
      <motion.div
        animate={{ x: [0, 20, -30, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-[10%] left-[30%] w-[700px] h-[700px] bg-violet-500/[0.04] rounded-full blur-[160px]"
      />
      <motion.div
        animate={{ x: [0, -15, 25, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-[40%] right-[30%] w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-[120px]"
      />
    </div>
  );
}

export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated mesh gradient */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%]"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(6,182,212,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.05) 0%, transparent 50%)
          `,
        }}
      />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:80px_80px]" />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#060a14_75%)]" />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating plus signs */}
      {[
        { top: "15%", left: "10%", delay: 0, size: 20 },
        { top: "25%", right: "15%", delay: 3, size: 16 },
        { top: "60%", left: "8%", delay: 6, size: 14 },
        { top: "70%", right: "12%", delay: 2, size: 18 },
        { top: "45%", left: "85%", delay: 4, size: 12 },
      ].map((item, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -15, 0], rotate: [0, 90, 0], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, delay: item.delay }}
          className="absolute text-blue-500/20"
          style={{ top: item.top, left: item.left, right: (item as any).right }}
        >
          <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>
      ))}
      {/* Floating dots */}
      {[
        { top: "20%", left: "20%", delay: 1 },
        { top: "35%", right: "25%", delay: 4 },
        { top: "55%", left: "75%", delay: 7 },
        { top: "80%", left: "15%", delay: 3 },
      ].map((item, i) => (
        <motion.div
          key={`dot-${i}`}
          animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: item.delay }}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
          style={{ top: item.top, left: item.left, right: (item as any).right }}
        />
      ))}
    </div>
  );
}
