import React from "react";
import { Sparkles, UploadCloud, PlusCircle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openUploadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setCurrentTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/[0.08] bg-[#090d18]/85 backdrop-blur-xl px-6 flex items-center justify-between">
      {/* Brand & AI Status */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={() => setCurrentTab("dashboard")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/35 transition-all">
            <div className="w-full h-full bg-[#0d121f] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                TalentRank<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">.ai</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">Explainable Screening & Candidate Ranking</p>
          </div>
        </div>

        {/* Live AI Engine Indicator */}
        <div className="hidden lg:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-200 font-medium">Gemini 3.8 Flash</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 flex items-center text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mr-1 inline" />
            Bias-Free Screening
          </span>
        </div>
      </div>

      {/* Action Buttons & Recruiter Profile */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setCurrentTab("upload")}
          className="hidden md:inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition-all shadow-sm"
        >
          <UploadCloud className="w-4 h-4 text-cyan-400" />
          <span>Parse Resumes</span>
        </button>

        <button
          onClick={() => setCurrentTab("create-job")}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-indigo-600/25 border border-white/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Job</span>
        </button>

        <div className="h-6 w-px bg-white/[0.1] hidden sm:block"></div>

        {/* Recruiter User Menu */}
        {user ? (
          <div className="flex items-center space-x-3 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-full bg-[#0d121f] flex items-center justify-center font-bold text-xs text-white">
                {user.fullName.charAt(0)}
              </div>
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <p className="font-semibold text-slate-200">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
