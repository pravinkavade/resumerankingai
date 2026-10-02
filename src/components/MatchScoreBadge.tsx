import React, { useState } from "react";
import { MatchAnalysisResult } from "../types/index.js";
import { Sparkles, Info } from "lucide-react";

interface MatchScoreBadgeProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  breakdown?: MatchAnalysisResult["breakdown"];
  showBreakdownOnHover?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  size = "md",
  breakdown,
  showBreakdownOnHover = true,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/[0.05] text-slate-400 border border-white/[0.08]">
        Unscreened
      </span>
    );
  }

  let colorClasses = "bg-white/[0.05] text-slate-300 border-white/[0.1]";
  let barColor = "bg-slate-400";
  let label = "Under Review";
  let dotGlow = "bg-slate-400";

  if (score >= 90) {
    colorClasses = "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10";
    barColor = "bg-gradient-to-r from-emerald-400 to-teal-400";
    dotGlow = "bg-emerald-400";
    label = "Top Match";
  } else if (score >= 80) {
    colorClasses = "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10";
    barColor = "bg-gradient-to-r from-cyan-400 to-blue-400";
    dotGlow = "bg-cyan-400";
    label = "Strong Fit";
  } else if (score >= 70) {
    colorClasses = "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10";
    barColor = "bg-gradient-to-r from-amber-400 to-orange-400";
    dotGlow = "bg-amber-400";
    label = "Moderate";
  } else {
    colorClasses = "bg-gradient-to-r from-rose-500/20 to-red-500/10 text-rose-300 border-rose-500/30";
    barColor = "bg-rose-400";
    dotGlow = "bg-rose-400";
    label = "Low Alignment";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-bold",
    md: "px-2.5 py-1 text-xs font-bold",
    lg: "px-3.5 py-1.5 text-sm font-extrabold",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`inline-flex items-center space-x-1.5 rounded-full border transition-all ${colorClasses} ${sizeClasses[size]} backdrop-blur-sm`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotGlow} animate-pulse`} />
        <span className="font-mono tabular-nums tracking-tight font-bold">{score}%</span>
        {size !== "sm" && <span className="opacity-90 text-[11px] font-medium hidden sm:inline font-sans">· {label}</span>}
      </div>

      {/* Floating Breakdown Tooltip */}
      {showBreakdownOnHover && breakdown && showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-4 rounded-2xl bg-[#0e1424]/95 border border-white/[0.12] shadow-2xl z-40 text-xs pointer-events-none backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
            <span className="font-display font-bold text-white flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              Score Breakdown
            </span>
            <span className="font-mono font-bold text-indigo-300 tabular-nums">{score}% Total</span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Required & Preferred Skills (40%)</span>
                <span className="font-mono font-semibold tabular-nums">{breakdown.skillsMatchScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                <div className={`h-full ${barColor}`} style={{ width: `${breakdown.skillsMatchScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Experience Duration & Seniority (25%)</span>
                <span className="font-mono font-semibold tabular-nums">{breakdown.experienceMatchScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                <div className={`h-full ${barColor}`} style={{ width: `${breakdown.experienceMatchScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Education & Credentials (15%)</span>
                <span className="font-mono font-semibold tabular-nums">{breakdown.educationMatchScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                <div className={`h-full ${barColor}`} style={{ width: `${breakdown.educationMatchScore}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Semantic & Vector Relevance (20%)</span>
                <span className="font-mono font-semibold tabular-nums">{breakdown.semanticRelevanceScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                <div className={`h-full ${barColor}`} style={{ width: `${breakdown.semanticRelevanceScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
