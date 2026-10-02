import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("recruiter@talentrank.ai");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(res.error || "Invalid email or password.");
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    await loginAsDemo();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080c14] text-slate-100 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-2xl shadow-indigo-500/25 mx-auto">
            <div className="w-full h-full bg-[#0d1222] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            TalentRank<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">.ai</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            AI-Powered Resume Screening & Candidate Ranking System
          </p>
        </div>

        {/* Login Box */}
        <div className="p-8 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] shadow-2xl space-y-6 backdrop-blur-2xl">
          <div className="space-y-1">
            <h2 className="text-lg font-display font-bold text-white">Recruiter Portal Sign In</h2>
            <p className="text-xs text-slate-400">Access your candidate ranking dashboards & job pipelines</p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 font-mono text-[11px]">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 font-mono text-[11px]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 border border-white/20 active:scale-95"
            >
              <span>{isSubmitting ? "Signing In..." : "Sign In to Recruiter Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Login */}
          <div className="pt-2 border-t border-white/[0.08] space-y-3">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-cyan-300 font-bold border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex items-center justify-center space-x-2 text-xs shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>1-Click Demo Recruiter Login</span>
            </button>
            <p className="text-[10px] text-center text-slate-500 font-mono">
              Demo account pre-loaded with jobs, candidates, and AI scoring analyses.
            </p>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-violet-400 hover:underline font-semibold"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Non-bias note */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>EEOC & Title VII Assistive AI Compliant</span>
        </div>
      </div>
    </div>
  );
};
