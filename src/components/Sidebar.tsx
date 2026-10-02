import React from "react";
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  UploadCloud,
  BarChart3,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeJobsCount?: number;
  totalCandidatesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  activeJobsCount = 4,
  totalCandidatesCount = 5,
}) => {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "jobs",
      label: "Jobs Management",
      icon: Briefcase,
      badge: activeJobsCount ? `${activeJobsCount} Active` : null,
    },
    {
      id: "candidates",
      label: "Candidates & Ranking",
      icon: UserCheck,
      badge: totalCandidatesCount ? `${totalCandidatesCount}` : null,
    },
    {
      id: "create-job",
      label: "Create New Job",
      icon: PlusCircle,
      badge: "AI Powered",
      highlight: true,
    },
    {
      id: "upload",
      label: "Upload Resumes",
      icon: UploadCloud,
      badge: "PDF / DOCX",
    },
    {
      id: "analytics",
      label: "Recruitment Analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "ethics",
      label: "Fairness & Compliance",
      icon: ShieldCheck,
      badge: "Non-Bias",
    },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#090d18]/70 backdrop-blur-xl flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <p className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
          Recruitment Workflow
        </p>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent text-white border border-violet-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-violet-400" : "text-slate-400"
                    }`}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold font-mono ${
                      item.highlight
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                        : isActive
                        ? "bg-violet-500/25 text-violet-200 border border-violet-500/30"
                        : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Assistive AI Compliance Card */}
      <div className="p-4">
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-4 text-xs space-y-2 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-display">Assistive Decision Engine</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            TalentRank assists human recruiters through objective merit scores. All hiring decisions remain strictly human-driven.
          </p>
          <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/[0.06]">
            <span>EEOC / Title VII</span>
            <span className="text-emerald-400 font-medium">● Verified</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
