"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeartPulse, ArrowRight, Sparkles } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a14] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.04] rounded-full blur-[120px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass rounded-2xl p-8 glow-blue">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Aleem EHR System</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-sm text-white/40">AI-Powered Hospital Management</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Username</Label>
              <Input
                type="text"
                placeholder="aleemehr"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl text-white placeholder:text-white/20 focus:border-blue-500/50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-white/20">
            Default: aleemehr / aleem811
          </p>
        </div>
      </motion.div>
    </div>
  );
}
