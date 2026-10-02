import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  color?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "purple";
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  color = "indigo",
  onClick,
}) => {
  const colorMap = {
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      iconText: "text-indigo-400",
      glow: "hover:border-indigo-500/50 hover:shadow-indigo-500/10",
      accentGrad: "from-indigo-500/20 to-transparent",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      iconText: "text-emerald-400",
      glow: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      accentGrad: "from-emerald-500/20 to-transparent",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      iconText: "text-amber-400",
      glow: "hover:border-amber-500/50 hover:shadow-amber-500/10",
      accentGrad: "from-amber-500/20 to-transparent",
    },
    rose: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      iconText: "text-rose-400",
      glow: "hover:border-rose-500/50 hover:shadow-rose-500/10",
      accentGrad: "from-rose-500/20 to-transparent",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      iconText: "text-cyan-400",
      glow: "hover:border-cyan-500/50 hover:shadow-cyan-500/10",
      accentGrad: "from-cyan-500/20 to-transparent",
    },
    purple: {
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      iconText: "text-purple-400",
      glow: "hover:border-purple-500/50 hover:shadow-purple-500/10",
      accentGrad: "from-purple-500/20 to-transparent",
    },
  };

  const currentTheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-gradient-to-b from-[#111726]/90 to-[#0c101c]/80 border ${currentTheme.border} p-5 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl" : ""
      } ${currentTheme.glow} relative overflow-hidden backdrop-blur-md group`}
    >
      {/* Top subtle light sheen */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${currentTheme.accentGrad} opacity-80`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">{title}</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <h3 className="text-2xl font-display font-extrabold text-white tracking-tight tabular-nums">
              {value}
            </h3>
            {subValue && (
              <span className="text-[11px] text-slate-400 font-medium">
                {subValue}
              </span>
            )}
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl ${currentTheme.bg} border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className={`w-5 h-5 ${currentTheme.iconText}`} />
        </div>
      </div>
    </div>
  );
};
