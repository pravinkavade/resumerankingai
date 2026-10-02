import React, { useState, useEffect } from "react";
import { CandidateCardItem, Job, ApplicationStatus } from "../types/index.js";
import { MatchScoreBadge } from "../components/MatchScoreBadge.js";
import { StatusBadge } from "../components/StatusBadge.js";
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Eye,
  CheckCircle2,
  XCircle,
  Briefcase,
  MapPin,
  Calendar,
  Trophy,
} from "lucide-react";

interface CandidatesPageProps {
  initialJobId?: string;
  onSelectCandidate: (candidateId: string, applicationId?: string) => void;
  onNavigateUpload: () => void;
}

export const CandidatesPage: React.FC<CandidatesPageProps> = ({
  initialJobId,
  onSelectCandidate,
  onNavigateUpload,
}) => {
  const [candidates, setCandidates] = useState<CandidateCardItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || "All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("score_desc");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [selectedJobId, selectedStatus, minScoreFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedJobId && selectedJobId !== "All") params.append("jobId", selectedJobId);
      if (selectedStatus && selectedStatus !== "All") params.append("status", selectedStatus);
      if (minScoreFilter > 0) params.append("minScore", minScoreFilter.toString());
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`/api/candidates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.candidates || []);
      }
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
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
        setCandidates((prev) =>
          prev.map((c) =>
            c.applicationId === applicationId ? { ...c, status: newStatus } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredCandidates = candidates.filter((cand) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      cand.fullName.toLowerCase().includes(q) ||
      cand.email.toLowerCase().includes(q) ||
      cand.jobTitle.toLowerCase().includes(q) ||
      cand.location.toLowerCase().includes(q) ||
      cand.topSkills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[11px]">AI Merit-Based Candidate Ranking</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
            Candidate Leaderboard & Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Explainable alignment scores generated against job requirements. Click any candidate to view detailed AI breakdowns.
          </p>
        </div>

        <button
          onClick={onNavigateUpload}
          className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white transition-all shadow-lg shadow-indigo-600/25 flex items-center space-x-2 shrink-0 border border-white/20 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Upload & Screen Resumes</span>
        </button>
      </div>

      {/* Primary Filters Toolbar */}
      <div className="p-5 rounded-2xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
        {/* Row 1: Target Job Selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            <Briefcase className="w-4 h-4 text-violet-400" />
            <span>Target Job Opening:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedJobId("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedJobId === "All"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                  : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
              }`}
            >
              All Openings
            </button>
            {jobs.map((j) => (
              <button
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedJobId === j.id
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                    : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                }`}
              >
                {j.title} ({j.candidateCount || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Secondary Controls */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Quick Score Threshold Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 text-xs mr-1 font-mono">Min Match:</span>
            {[
              { label: "All", val: 0 },
              { label: "70%+", val: 70 },
              { label: "80%+", val: 80 },
              { label: "90%+", val: 90 },
            ].map((btn) => (
              <button
                key={btn.val}
                onClick={() => setMinScoreFilter(btn.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  minScoreFilter === btn.val
                    ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                    : "bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.08]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#0c111e]">All Pipeline Stages</option>
              <option value="Applied" className="bg-[#0c111e]">Applied</option>
              <option value="Screened" className="bg-[#0c111e]">Screened</option>
              <option value="Shortlisted" className="bg-[#0c111e]">Shortlisted</option>
              <option value="Interview" className="bg-[#0c111e]">Interview</option>
              <option value="Offer" className="bg-[#0c111e]">Offer</option>
              <option value="Rejected" className="bg-[#0c111e]">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 bg-white/[0.04] border border-white/[0.1] rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="score_desc" className="bg-[#0c111e]">Highest Match Score</option>
              <option value="score_asc" className="bg-[#0c111e]">Lowest Match Score</option>
              <option value="exp_desc" className="bg-[#0c111e]">Most Experience</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Ranking List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Computing semantic candidate ranking...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No candidates match current criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try lowering the minimum match score or upload new resumes to rank candidates against this position.
          </p>
          <button
            onClick={onNavigateUpload}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-500 transition-colors"
          >
            Upload Candidate Resumes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCandidates.map((cand, index) => {
            const rank = index + 1;
            const match = cand.matchResult;

            return (
              <div
                key={cand.id}
                onClick={() => onSelectCandidate(cand.id, cand.applicationId)}
                className="p-5 rounded-2xl bg-[#0c111e]/85 border border-white/[0.08] hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group backdrop-blur-xl"
              >
                {/* Left: Rank, Avatar & Basic Info */}
                <div className="flex items-start space-x-4 min-w-[280px]">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-extrabold text-sm shrink-0 border ${
                      rank === 1
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10"
                        : rank === 2
                        ? "bg-slate-300/20 text-slate-200 border-slate-400/40"
                        : rank === 3
                        ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                        : "bg-white/[0.04] text-slate-400 border-white/[0.08]"
                    }`}
                  >
                    #{rank}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-display font-bold text-white text-base group-hover:text-violet-300 transition-colors">
                        {cand.fullName}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold text-slate-300">{cand.jobTitle}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{cand.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-violet-400" />
                        <span className="font-mono text-slate-300 tabular-nums">{cand.totalYearsExperience} yrs exp</span>
                      </span>
                    </div>

                    {/* Brief professional summary */}
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-1 max-w-xl">
                      {cand.summary}
                    </p>
                  </div>
                </div>

                {/* Center: Skills Alignment Tags */}
                <div className="flex-1 max-w-md hidden lg:block">
                  <div className="space-y-1.5">
                    {/* Matched Required Skills */}
                    {match?.matchedRequiredSkills && match.matchedRequiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.matchedRequiredSkills.slice(0, 4).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{sk}</span>
                          </span>
                        ))}
                        {match.matchedRequiredSkills.length > 4 && (
                          <span className="text-[10px] text-emerald-400 font-mono tabular-nums">
                            +{match.matchedRequiredSkills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Missing Skills Warning */}
                    {match?.missingRequiredSkills && match.missingRequiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.missingRequiredSkills.slice(0, 2).map((sk, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1"
                          >
                            <XCircle className="w-2.5 h-2.5" />
                            <span>Missing: {sk}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Match Score, Status & Actions */}
                <div className="flex items-center space-x-4 shrink-0 justify-between md:justify-end">
                  <MatchScoreBadge
                    score={cand.matchScore}
                    size="md"
                    breakdown={cand.matchResult?.breakdown}
                  />

                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusBadge
                      status={cand.status}
                      editable={!!cand.applicationId}
                      onStatusChange={(newSt) => {
                        if (cand.applicationId) {
                          handleStatusChange(cand.applicationId, newSt);
                        }
                      }}
                    />
                  </div>

                  <button
                    onClick={() => onSelectCandidate(cand.id, cand.applicationId)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    title="View candidate details & match reasoning"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
