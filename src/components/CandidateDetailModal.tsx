import React, { useState, useEffect } from "react";
import {
  Candidate,
  Application,
  ApplicationStatus,
} from "../types/index.js";
import { MatchScoreBadge } from "./MatchScoreBadge.js";
import { StatusBadge } from "./StatusBadge.js";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  ShieldCheck,
  Award,
  Sparkles,
  Save,
  MessageSquare,
} from "lucide-react";

interface CandidateDetailModalProps {
  candidateId: string | null;
  applicationId?: string;
  onClose: () => void;
  onUpdateStatus?: (applicationId: string, status: ApplicationStatus) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidateId,
  applicationId,
  onClose,
  onUpdateStatus,
}) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "skills" | "experience" | "raw">("analysis");
  const [recruiterNotes, setRecruiterNotes] = useState<string>("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;

    const fetchCandidate = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/candidates/${candidateId}`);
        if (res.ok) {
          const data = await res.json();
          setCandidate(data.candidate);
          setApplications(data.applications || []);

          // Select matching application
          const targetApp = applicationId
            ? data.applications.find((a: Application) => a.id === applicationId)
            : data.applications[0];

          setSelectedApp(targetApp || null);
          setRecruiterNotes(targetApp?.recruiterNotes || "");
        }
      } catch (err) {
        console.error("Failed to fetch candidate details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId, applicationId]);

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!selectedApp) return;

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setSelectedApp({ ...selectedApp, status: newStatus });
        if (onUpdateStatus) {
          onUpdateStatus(selectedApp.id, newStatus);
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: recruiterNotes }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!candidateId) return null;

  const match = selectedApp?.matchResult;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative w-full max-w-5xl bg-[#0c111e] border border-white/[0.1] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-white/[0.08] bg-gradient-to-r from-[#11172a] via-[#0d1222] to-[#11172a] flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-xl shadow-indigo-500/25 shrink-0">
              <div className="w-full h-full bg-[#0d1222] rounded-[14px] flex items-center justify-center text-xl font-display font-extrabold text-white">
                {candidate?.fullName?.charAt(0) || "C"}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3 flex-wrap">
                <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
                  {candidate?.fullName || "Candidate Profile"}
                </h2>
                {selectedApp && (
                  <StatusBadge
                    status={selectedApp.status}
                    editable={true}
                    onStatusChange={handleStatusChange}
                  />
                )}
                {selectedApp?.matchScore !== undefined && (
                  <MatchScoreBadge
                    score={selectedApp.matchScore}
                    size="lg"
                    breakdown={selectedApp.matchResult?.breakdown}
                  />
                )}
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                {candidate?.email && (
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{candidate.email}</span>
                  </span>
                )}
                {candidate?.phone && (
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{candidate.phone}</span>
                  </span>
                )}
                {candidate?.location && (
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{candidate.location}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-semibold text-slate-200 tabular-nums">
                    {candidate?.totalYearsExperience || 0} Years Experience
                  </span>
                </span>
                {candidate?.linkedin && (
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {candidate?.github && (
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Job Selector if multiple */}
        {applications.length > 1 && (
          <div className="px-6 py-2.5 bg-[#0a0f1c] border-b border-white/[0.08] flex items-center space-x-3 text-xs">
            <span className="text-slate-400 font-semibold font-mono">Evaluating Against Role:</span>
            <div className="flex space-x-2">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setRecruiterNotes(app.recruiterNotes || "");
                  }}
                  className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                    selectedApp?.id === app.id
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                      : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  {app.jobTitle} ({app.matchScore}%)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/[0.08] bg-[#090e1a] flex space-x-2">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "analysis"
                ? "border-violet-500 text-violet-300 bg-violet-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>AI Match Explanation & Score</span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "skills"
                ? "border-violet-500 text-violet-300 bg-violet-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Skills Matrix & Gaps</span>
          </button>

          <button
            onClick={() => setActiveTab("experience")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "experience"
                ? "border-violet-500 text-violet-300 bg-violet-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span>Experience & Projects</span>
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === "raw"
                ? "border-violet-500 text-violet-300 bg-violet-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Original Resume Document</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Loading candidate evaluation and match breakdown...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: AI Match Explanation */}
              {activeTab === "analysis" && (
                <div className="space-y-6">
                  {/* Executive Summary Card */}
                  <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/30 via-[#10162a] to-indigo-950/25 p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-violet-300 font-display font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span>Executive Match Synthesis ({selectedApp?.jobTitle || "Role"})</span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-300/80 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        Gemini 3.8 Flash Engine
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-normal">
                      {match?.executiveSummary || candidate?.summary || "Comprehensive evaluation completed."}
                    </p>
                  </div>

                  {/* 4-Factor Weighted Breakdown Bars */}
                  {match?.breakdown && (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0f1526]/80 p-5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        Assistive Scoring Dimensions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">Skills Coverage (40%)</span>
                            <span className="font-mono font-bold text-emerald-400 tabular-nums">{match.breakdown.skillsMatchScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${match.breakdown.skillsMatchScore}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 pt-0.5">Mandatory required skills & bonus preferred coverage</p>
                        </div>

                        <div className="space-y-1.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">Experience & Seniority (25%)</span>
                            <span className="font-mono font-bold text-cyan-400 tabular-nums">{match.breakdown.experienceMatchScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${match.breakdown.experienceMatchScore}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 pt-0.5">Total verified industry years & role seniority alignment</p>
                        </div>

                        <div className="space-y-1.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">Education & Credentials (15%)</span>
                            <span className="font-mono font-bold text-violet-400 tabular-nums">{match.breakdown.educationMatchScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${match.breakdown.educationMatchScore}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 pt-0.5">Academic degree, field of study, and verified certifications</p>
                        </div>

                        <div className="space-y-1.5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">Semantic Relevance (20%)</span>
                            <span className="font-mono font-bold text-purple-400 tabular-nums">{match.breakdown.semanticRelevanceScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${match.breakdown.semanticRelevanceScore}%` }} />
                          </div>
                          <p className="text-[10px] text-slate-400 pt-0.5">Deep language vector similarity to role responsibilities</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Potential Gaps Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Strengths */}
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Key Strengths Identified</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {match?.strengths?.map((str, idx) => (
                          <li key={idx} className="flex items-start space-x-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{str}</span>
                          </li>
                        )) || <li>Strong professional background detected.</li>}
                      </ul>
                    </div>

                    {/* Identified Gaps or Probe Areas */}
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                        <HelpCircle className="w-4 h-4" />
                        <span>Identified Gaps & Interview Probes</span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {match?.potentialGaps?.map((gap, idx) => (
                          <li key={idx} className="flex items-start space-x-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{gap}</span>
                          </li>
                        )) || <li>No critical skill gaps identified.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Competency-Based Interview Questions */}
                  {match?.interviewQuestions && match.interviewQuestions.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0f1526]/80 p-5 space-y-3">
                      <div className="flex items-center space-x-2 text-cyan-400 font-display font-bold text-xs uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4" />
                        <span>Tailored Recruiter Interview Questions</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        AI-generated competency questions specifically calibrated to verify this candidate's reported experience for {selectedApp?.jobTitle}.
                      </p>
                      <div className="space-y-2 pt-1">
                        {match.interviewQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-200 flex items-start space-x-3"
                          >
                            <span className="w-5 h-5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px] font-mono">
                              Q{idx + 1}
                            </span>
                            <span className="leading-relaxed">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fairness Audit Verification Note */}
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] flex items-start space-x-3 text-xs text-slate-400">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">EEOC Fairness & Assistive Compliance Statement: </span>
                      {match?.fairnessAuditNotes || "Candidate evaluated purely on demonstrated technical proficiencies and verifiable career milestones. Protected attributes are prohibited and excluded from algorithmic ranking."}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Skills Matrix */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  {/* Required Skills Alignment */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0f1526]/80 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between font-mono">
                      <span>Mandatory Required Skills Alignment</span>
                      <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                        {match?.matchedRequiredSkills?.length || 0} /{" "}
                        {((match?.matchedRequiredSkills?.length || 0) + (match?.missingRequiredSkills?.length || 0))} Matched
                      </span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Matched Required */}
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/25 space-y-2">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Matched Required Skills</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {match?.matchedRequiredSkills && match.matchedRequiredSkills.length > 0 ? (
                            match.matchedRequiredSkills.map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{sk}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None matched</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Required */}
                      <div className="p-4 rounded-xl bg-white/[0.03] border border-rose-500/25 space-y-2">
                        <span className="text-xs font-semibold text-rose-400 flex items-center space-x-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Missing Required Skills</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {match?.missingRequiredSkills && match.missingRequiredSkills.length > 0 ? (
                            match.missingRequiredSkills.map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>{sk}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-emerald-400 font-medium">All mandatory skills present!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferred Skills */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0f1526]/80 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Preferred / Bonus Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {match?.matchedPreferredSkills?.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{sk} (Bonus +)</span>
                        </span>
                      ))}
                      {match?.missingPreferredSkills?.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.05] text-slate-400 border border-white/[0.08]"
                        >
                          {sk} (Unmatched)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* All Extracted Skills Bank */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0f1526]/80 p-5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      All Extracted Candidate Skills
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider font-mono">
                          Technical & Core Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {candidate?.skills?.technical?.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.05] text-slate-200 border border-white/[0.08]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {candidate?.skills?.frameworksAndTools && candidate.skills.frameworksAndTools.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider font-mono">
                            Frameworks & Tools
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {candidate.skills.frameworksAndTools.map((tool, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.05] text-slate-300 border border-white/[0.08]"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {candidate?.skills?.softSkills && candidate.skills.softSkills.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider font-mono">
                            Soft Skills & Leadership
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {candidate.skills.softSkills.map((soft, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.05] text-slate-300 border border-white/[0.08]"
                              >
                                {soft}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Experience & Projects */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  {/* Work Experience Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Work Experience History
                    </h4>
                    <div className="space-y-4">
                      {candidate?.experience?.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-[#0f1526]/80 border border-white/[0.08] space-y-2 relative"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h5 className="font-display font-bold text-white text-base">{exp.title}</h5>
                              <p className="text-violet-400 text-xs font-semibold">{exp.company}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                              {exp.startDate} - {exp.endDate}
                            </span>
                          </div>

                          <ul className="space-y-1.5 text-xs text-slate-300 pt-2">
                            {exp.responsibilities?.map((r, rIdx) => (
                              <li key={rIdx} className="flex items-start space-x-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                <span className="leading-relaxed">{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  {candidate?.projects && candidate.projects.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                        Highlighted Projects
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidate.projects.map((proj, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#0f1526]/80 border border-white/[0.08] space-y-2">
                            <h5 className="font-display font-bold text-white text-sm">{proj.name}</h5>
                            <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.technologies?.map((tech, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08]"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0f1526]/80 border border-white/[0.08] space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Education</h4>
                      {candidate?.education?.map((edu, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <p className="font-bold text-white">{edu.degree} in {edu.fieldOfStudy}</p>
                          <p className="text-violet-400">{edu.institution}</p>
                          <p className="text-slate-400 font-mono text-[11px] tabular-nums">{edu.graduationYear} {edu.gpaOrHonors && `• ${edu.gpaOrHonors}`}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1526]/80 border border-white/[0.08] space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Certifications</h4>
                      {candidate?.certifications && candidate.certifications.length > 0 ? (
                        candidate.certifications.map((cert, idx) => (
                          <div key={idx} className="text-xs space-y-0.5">
                            <p className="font-bold text-white">{cert.name}</p>
                            <p className="text-slate-400">{cert.issuer} • {cert.year}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No external certifications listed</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Raw Document */}
              {activeTab === "raw" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Parsed file: {candidate?.fileName} ({Math.round((candidate?.fileSize || 0) / 1024)} KB)</span>
                    <span className="font-mono text-emerald-400">LLM Extracted</span>
                  </div>
                  <pre className="p-5 rounded-2xl bg-[#080c14] border border-white/[0.08] text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
                    {candidate?.rawResumeText}
                  </pre>
                </div>
              )}

              {/* Recruiter Notes & Actions Section */}
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2 font-mono">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    <span>Recruiter Evaluation Notes</span>
                  </label>
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Notes Saved Successfully</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <textarea
                    rows={2}
                    value={recruiterNotes}
                    onChange={(e) => setRecruiterNotes(e.target.value)}
                    placeholder="Enter internal recruiter evaluation notes, interview impressions, or next steps..."
                    className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-colors flex items-center space-x-2 shrink-0 disabled:opacity-50 shadow-md shadow-indigo-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingNotes ? "Saving..." : "Save Notes"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
