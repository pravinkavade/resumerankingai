import React, { useState, useEffect } from "react";
import { Job, JobStatus } from "../types/index.js";
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Trash2,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Check,
} from "lucide-react";

interface JobsPageProps {
  onNavigateCreateJob: () => void;
  onViewJobCandidates: (jobId: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  onNavigateCreateJob,
  onViewJobCandidates,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreviewJob, setSelectedPreviewJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job and associated applications?")) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        if (selectedPreviewJob?.id === jobId) setSelectedPreviewJob(null);
      }
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      statusFilter === "All" || job.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept =
      departmentFilter === "All" || job.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesDept && matchesSearch;
  });

  const departments = Array.from(new Set(jobs.map((j) => j.department)));

  const getStatusBadge = (status: JobStatus, jobId: string) => {
    const styles: Record<JobStatus, { bg: string; text: string; dot: string }> = {
      Active: { bg: "bg-emerald-500/15", text: "text-emerald-300", dot: "bg-emerald-400" },
      Draft: { bg: "bg-white/[0.06]", text: "text-slate-300", dot: "bg-slate-400" },
      Closed: { bg: "bg-rose-500/15", text: "text-rose-300", dot: "bg-rose-400" },
      Archived: { bg: "bg-amber-500/15", text: "text-amber-300", dot: "bg-amber-400" },
    };

    const st = styles[status] || styles.Active;

    return (
      <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
        <select
          value={status}
          onChange={(e) => handleStatusChange(jobId, e.target.value as JobStatus)}
          className={`appearance-none pl-6 pr-6 py-1 rounded-full text-xs font-semibold border border-white/[0.1] ${st.bg} ${st.text} cursor-pointer focus:outline-none`}
        >
          <option value="Active" className="bg-[#0c111e]">Active</option>
          <option value="Draft" className="bg-[#0c111e]">Draft</option>
          <option value="Closed" className="bg-[#0c111e]">Closed</option>
          <option value="Archived" className="bg-[#0c111e]">Archived</option>
        </select>
        <span className={`w-2 h-2 rounded-full ${st.dot} absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none`} />
        <ChevronDown className="w-3 h-3 opacity-60 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Job Openings Management</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Define role criteria, inspect Gemini AI extracted competencies, and track candidate pipeline depth.
          </p>
        </div>

        <button
          onClick={onNavigateCreateJob}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 transition-all shrink-0 border border-white/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Job</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#0c111e]/90 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job title, skills, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0c111e]">All Statuses</option>
            <option value="Active" className="bg-[#0c111e]">Active</option>
            <option value="Draft" className="bg-[#0c111e]">Draft</option>
            <option value="Closed" className="bg-[#0c111e]">Closed</option>
            <option value="Archived" className="bg-[#0c111e]">Archived</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All" className="bg-[#0c111e]">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d} className="bg-[#0c111e]">{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Loading job openings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No jobs match your search</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting filters or create a new job opening with AI skill extraction.
          </p>
          <button
            onClick={onNavigateCreateJob}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white"
          >
            Post a Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 rounded-3xl bg-[#0c111e]/85 border border-white/[0.08] hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all flex flex-col justify-between space-y-4 group relative backdrop-blur-xl"
            >
              <div className="space-y-3">
                {/* Top Row: Department & Status */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono">
                    {job.department}
                  </span>
                  {getStatusBadge(job.status, job.id)}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-violet-300 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.employmentType}</span>
                    </span>
                    <span className="text-slate-300 font-semibold font-mono tabular-nums">
                      {job.experienceRequired}+ yrs exp
                    </span>
                    {job.salaryRange && (
                      <span className="text-emerald-400 font-mono text-[11px]">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>
                </div>

                {/* Brief description */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Required Skills Tags */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                    Required Competencies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.05] text-slate-200 border border-white/[0.08]"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 5 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.04] text-slate-400 font-mono">
                        +{job.requiredSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm font-mono tabular-nums">{job.candidateCount || 0}</span>
                    <span className="text-slate-400 ml-1">candidates</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPreviewJob(job)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                    title="View Job Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onViewJobCandidates(job.id)}
                    className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    Ranked Candidates
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Job Drawer / Modal */}
      {selectedPreviewJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#0c111e] border border-white/[0.1] rounded-3xl p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400 font-mono">
                  {selectedPreviewJob.department}
                </span>
                <h2 className="text-xl font-display font-extrabold text-white mt-1">{selectedPreviewJob.title}</h2>
                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                  <span>{selectedPreviewJob.location}</span>
                  <span>•</span>
                  <span>{selectedPreviewJob.employmentType}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono">{selectedPreviewJob.salaryRange}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPreviewJob(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">Role Description</h4>
                <p className="leading-relaxed bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
                  {selectedPreviewJob.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-1.5 font-mono">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreviewJob.requiredSkills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {selectedPreviewJob.preferredSkills.length > 0 && (
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1.5 font-mono">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPreviewJob.preferredSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-slate-300 border border-white/[0.08]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPreviewJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">Key Responsibilities</h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                    {selectedPreviewJob.responsibilities.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPreviewJob.benefits.length > 0 && (
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] mb-1 font-mono">Benefits & Perks</h4>
                  <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                    {selectedPreviewJob.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedPreviewJob(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-slate-300 text-xs font-semibold hover:bg-white/[0.1]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = selectedPreviewJob.id;
                  setSelectedPreviewJob(null);
                  onViewJobCandidates(id);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold hover:from-violet-500 hover:to-indigo-500"
              >
                View Candidates for this Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
