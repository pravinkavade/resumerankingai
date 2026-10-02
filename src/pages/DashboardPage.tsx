import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  UserCheck,
  CheckCircle,
  CalendarCheck,
  XCircle,
  ArrowUpRight,
  Search,
  Filter,
  Eye,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { MetricCard } from "../components/MetricCard.js";
import { MatchScoreBadge } from "../components/MatchScoreBadge.js";
import { StatusBadge } from "../components/StatusBadge.js";
import { AnalyticsData, CandidateCardItem, ApplicationStatus } from "../types/index.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardPageProps {
  onSelectCandidate: (candidateId: string, applicationId?: string) => void;
  onNavigateToJob: (jobId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectCandidate,
  onNavigateToJob,
  onNavigateTab,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentCandidates, setRecentCandidates] = useState<CandidateCardItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, candidatesRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/candidates"),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }

      if (candidatesRes.ok) {
        const cData = await candidatesRes.json();
        setRecentCandidates(cData.candidates || []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRecentCandidates((prev) =>
          prev.map((c) =>
            c.applicationId === applicationId ? { ...c, status: newStatus } : c
          )
        );
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredCandidates = recentCandidates.filter((cand) => {
    const matchesSearch =
      cand.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cand.topSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" || cand.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const m = analytics?.metrics;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-r from-[#11172a] via-[#0d1222] to-[#13192c] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Subtle ambient light orb */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono text-[11px]">AI Recruiter Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Intelligent Talent Screening Dashboard
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Assistive candidate ranking powered by Gemini 3.8 Flash. Automated skill extraction, semantic matching, and explainable score breakdowns with full bias guardrails.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 z-10">
          <button
            onClick={() => onNavigateTab("upload")}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center space-x-2 border border-white/20 active:scale-95"
          >
            <span>Batch Upload Resumes</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab("create-job")}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition-all"
          >
            Post Job Opening
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
        <MetricCard
          title="Total Jobs"
          value={m?.totalJobs ?? 4}
          subValue="Positions"
          icon={Briefcase}
          color="indigo"
          onClick={() => onNavigateTab("jobs")}
        />
        <MetricCard
          title="Active Jobs"
          value={m?.activeJobs ?? 4}
          subValue="Hiring"
          icon={TrendingUp}
          color="cyan"
          onClick={() => onNavigateTab("jobs")}
        />
        <MetricCard
          title="Candidates"
          value={m?.totalCandidates ?? 5}
          subValue="Resumes"
          icon={Users}
          color="purple"
          onClick={() => onNavigateTab("candidates")}
        />
        <MetricCard
          title="Screened"
          value={m?.screenedCandidates ?? 5}
          subValue="AI Evaluated"
          icon={UserCheck}
          color="indigo"
          onClick={() => onNavigateTab("candidates")}
        />
        <MetricCard
          title="Shortlisted"
          value={m?.shortlistedCandidates ?? 2}
          subValue="High Match"
          icon={CheckCircle}
          color="emerald"
          onClick={() => onNavigateTab("candidates")}
        />
        <MetricCard
          title="Interviews"
          value={m?.interviews ?? 2}
          subValue="Scheduled"
          icon={CalendarCheck}
          color="amber"
          onClick={() => onNavigateTab("candidates")}
        />
        <MetricCard
          title="Rejected"
          value={m?.rejectedCandidates ?? 0}
          subValue="Declined"
          icon={XCircle}
          color="rose"
          onClick={() => onNavigateTab("candidates")}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Candidates per Job */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Candidates per Job</h3>
              <p className="text-xs text-slate-400">Application volume & shortlists across open roles</p>
            </div>
            <span className="text-xs font-mono text-violet-400 font-semibold">Active Openings</span>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics?.candidatesPerJob && analytics.candidatesPerJob.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.candidatesPerJob} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="jobTitle"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#0e1424", borderColor: "rgba(255,255,255,0.12)", borderRadius: "14px", fontSize: "12px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" }}
                    labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
                  />
                  <Bar dataKey="candidatesCount" name="Total Candidates" fill="#818cf8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="shortlistedCount" name="Shortlisted" fill="#34d399" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Chart 2: Application Status Distribution */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Application Pipeline Funnel</h3>
              <p className="text-xs text-slate-400">Current candidate status progression</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Pipeline Stages</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {analytics?.statusDistribution ? (
              <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: "#0e1424", borderColor: "rgba(255,255,255,0.12)", borderRadius: "14px", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {analytics.statusDistribution.map((st) => (
                    <div key={st.name} className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                      <span className="text-slate-300 font-medium">{st.name}:</span>
                      <span className="font-mono font-bold text-white tabular-nums">{st.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Loading distribution...</div>
            )}
          </div>
        </div>

        {/* Chart 3: Candidate Matching Score Distribution */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Match Score Distribution</h3>
              <p className="text-xs text-slate-400">Candidate ranking score density breakdown</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">Quality Index</span>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics?.scoreDistribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#0e1424", borderColor: "rgba(255,255,255,0.12)", borderRadius: "14px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" name="Candidates" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Loading score metrics...</div>
            )}
          </div>
        </div>

        {/* Chart 4: Top Skills */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Top Talent Skills Supply</h3>
              <p className="text-xs text-slate-400">Frequently extracted proficiencies across candidate resumes</p>
            </div>
            <span className="text-xs font-mono text-purple-400 font-semibold">Skill Inventory</span>
          </div>

          <div className="h-64 w-full pt-2">
            {analytics?.topSkills && analytics.topSkills.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topSkills.slice(0, 7)}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis
                    dataKey="skill"
                    type="category"
                    tick={{ fill: "#cbd5e1", fontSize: 11 }}
                    width={80}
                  />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#0e1424", borderColor: "rgba(255,255,255,0.12)", borderRadius: "14px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" name="Candidate Count" fill="#a855f7" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">Extracting skill frequency...</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Candidates Table */}
      <div className="rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-display font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Recent Screened Candidates</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300">
                {filteredCandidates.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">Review AI evaluations, skills alignment, and application status</p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate, job, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-slate-200 cursor-pointer"
              >
                <option value="All" className="bg-[#0c111e]">All Statuses</option>
                <option value="Applied" className="bg-[#0c111e]">Applied</option>
                <option value="Screened" className="bg-[#0c111e]">Screened</option>
                <option value="Shortlisted" className="bg-[#0c111e]">Shortlisted</option>
                <option value="Interview" className="bg-[#0c111e]">Interview</option>
                <option value="Offer" className="bg-[#0c111e]">Offer</option>
                <option value="Rejected" className="bg-[#0c111e]">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 border-b border-white/[0.06] text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">Applied Job</th>
                <th className="py-3.5 px-4">Match Score</th>
                <th className="py-3.5 px-4">Top Extracted Skills</th>
                <th className="py-3.5 px-4">Experience</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No candidates match the specified filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr
                    key={cand.id}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    onClick={() => onSelectCandidate(cand.id, cand.applicationId)}
                  >
                    {/* Candidate */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600/30 via-indigo-600/20 to-cyan-500/20 border border-white/[0.1] flex items-center justify-center font-display font-bold text-violet-300 text-xs shadow-sm">
                          {cand.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm group-hover:text-violet-300 transition-colors">
                            {cand.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400">{cand.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Job */}
                    <td className="py-4 px-4 font-medium text-slate-300">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (cand.jobId) onNavigateToJob(cand.jobId);
                        }}
                        className="hover:text-violet-400 hover:underline cursor-pointer"
                      >
                        {cand.jobTitle}
                      </span>
                    </td>

                    {/* Match Score */}
                    <td className="py-4 px-4">
                      <MatchScoreBadge
                        score={cand.matchScore}
                        breakdown={cand.matchResult?.breakdown}
                      />
                    </td>

                    {/* Top Skills */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cand.topSkills.slice(0, 3).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] bg-white/[0.05] text-slate-300 border border-white/[0.08]"
                          >
                            {sk}
                          </span>
                        ))}
                        {cand.topSkills.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            +{cand.topSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-4 px-4 font-mono text-slate-300 tabular-nums">
                      {cand.totalYearsExperience} yrs
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge
                        status={cand.status}
                        editable={!!cand.applicationId}
                        onStatusChange={(newSt) => {
                          if (cand.applicationId) {
                            handleStatusChange(cand.applicationId, newSt);
                          }
                        }}
                      />
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px] tabular-nums">
                      {new Date(cand.appliedDate).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectCandidate(cand.id, cand.applicationId)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition-all font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Match</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
