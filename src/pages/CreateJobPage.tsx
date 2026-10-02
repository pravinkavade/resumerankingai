import React, { useState } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Briefcase,
  AlertCircle,
} from "lucide-react";

interface CreateJobPageProps {
  onJobCreated: (jobId: string) => void;
  onCancel: () => void;
}

export const CreateJobPage: React.FC<CreateJobPageProps> = ({
  onJobCreated,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("San Francisco, CA (Hybrid / Remote)");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceRequired, setExperienceRequired] = useState<number>(3);
  const [salaryRange, setSalaryRange] = useState("$140,000 - $175,000");
  const [description, setDescription] = useState("");

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["React", "TypeScript", "Node.js"]);
  const [newRequiredSkill, setNewRequiredSkill] = useState("");

  const [preferredSkills, setPreferredSkills] = useState<string[]>(["Docker", "AWS", "GraphQL"]);
  const [newPreferredSkill, setNewPreferredSkill] = useState("");

  // Education
  const [degree, setDegree] = useState("Bachelor's Degree");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science, Engineering, or Related Field");

  // Dynamic Lists
  const [responsibilities, setResponsibilities] = useState<string[]>([
    "Architect and maintain high-throughput web applications and scalable microservices.",
    "Collaborate cross-functionally with product designers and backend engineers.",
    "Optimize application performance, database queries, and Core Web Vitals.",
  ]);
  const [newResponsibility, setNewResponsibility] = useState("");

  const [requirements, setRequirements] = useState<string[]>([
    "Demonstrated hands-on experience in core required technologies.",
    "Strong understanding of relational databases and system design.",
    "Proven track record delivering reliable software in fast-paced teams.",
  ]);
  const [newRequirement, setNewRequirement] = useState("");

  const [benefits, setBenefits] = useState<string[]>([
    "Competitive base salary with equity options",
    "Comprehensive health, dental, and vision insurance",
    "Flexible remote work options and home-office budget",
    "Annual learning & conference stipend",
  ]);
  const [newBenefit, setNewBenefit] = useState("");

  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiAnalysisNotes, setAiAnalysisNotes] = useState<string | null>(null);

  // Skill tag adders
  const handleAddRequiredSkill = () => {
    if (!newRequiredSkill.trim()) return;
    if (!requiredSkills.includes(newRequiredSkill.trim())) {
      setRequiredSkills([...requiredSkills, newRequiredSkill.trim()]);
    }
    setNewRequiredSkill("");
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddPreferredSkill = () => {
    if (!newPreferredSkill.trim()) return;
    if (!preferredSkills.includes(newPreferredSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPreferredSkill.trim()]);
    }
    setNewPreferredSkill("");
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  // Dynamic list adders
  const handleAddResponsibility = () => {
    if (!newResponsibility.trim()) return;
    setResponsibilities([...responsibilities, newResponsibility.trim()]);
    setNewResponsibility("");
  };

  const handleAddRequirement = () => {
    if (!newRequirement.trim()) return;
    setRequirements([...requirements, newRequirement.trim()]);
    setNewRequirement("");
  };

  const handleAddBenefit = () => {
    if (!newBenefit.trim()) return;
    setBenefits([...benefits, newBenefit.trim()]);
    setNewBenefit("");
  };

  // Gemini AI Analysis
  const handleAnalyzeWithAI = async () => {
    if (!description && !title) {
      setErrorMsg("Please provide at least a Job Title or Job Description to analyze with Gemini.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          description,
          requiredSkills,
          preferredSkills,
        }),
      });

      if (!res.ok) {
        throw new Error("AI analysis request failed");
      }

      const data = await res.json();
      const analyzed = data.analyzed;

      if (analyzed) {
        if (analyzed.extractedTitle && !title) setTitle(analyzed.extractedTitle);
        if (analyzed.department) setDepartment(analyzed.department);
        if (analyzed.minExperienceYears) setExperienceRequired(analyzed.minExperienceYears);
        if (analyzed.requiredSkills?.length) setRequiredSkills(analyzed.requiredSkills);
        if (analyzed.preferredSkills?.length) setPreferredSkills(analyzed.preferredSkills);
        if (analyzed.educationRequirements) {
          setDegree(analyzed.educationRequirements.degree || degree);
          setFieldOfStudy(analyzed.educationRequirements.fieldOfStudy || fieldOfStudy);
        }
        if (analyzed.keyResponsibilities?.length) setResponsibilities(analyzed.keyResponsibilities);
        if (analyzed.keyRequirements?.length) setRequirements(analyzed.keyRequirements);
        if (analyzed.benefits?.length) setBenefits(analyzed.benefits);

        setAiAnalysisNotes(
          `Extracted ${analyzed.requiredSkills?.length || 0} required skills, ${
            analyzed.preferredSkills?.length || 0
          } preferred skills, and ${analyzed.keywords?.length || 0} semantic keywords.`
        );
      }
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      setErrorMsg("AI analysis encountered an issue: " + (err.message || "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Job title is required.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Job description is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        title: title.trim(),
        department,
        location,
        employmentType,
        experienceRequired,
        salaryRange,
        description,
        requiredSkills,
        preferredSkills,
        educationRequirements: {
          degree,
          fieldOfStudy,
        },
        responsibilities,
        requirements,
        benefits,
        autoAnalyze: true,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      onJobCreated(data.job.id);
    } catch (err: any) {
      console.error("Job creation error:", err);
      setErrorMsg(err.message || "Failed to create job opening");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs font-semibold mb-2 border border-violet-500/30">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono text-[11px]">Gemini AI Job Intelligence</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Create Job Description</h1>
          <p className="text-xs text-slate-400">
            Publish an opening with structured skills, requirements, and AI semantic vector matching.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeWithAI}
          disabled={isAnalyzing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 shrink-0 border border-white/20 active:scale-95"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
          <span>{isAnalyzing ? "Analyzing with Gemini..." : "Auto-Extract Skills with AI"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {aiAnalysisNotes && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{aiAnalysisNotes}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-violet-400" />
            <span>1. Basic Job Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="Engineering" className="bg-[#0c111e]">Engineering</option>
                <option value="AI Research & Innovation" className="bg-[#0c111e]">AI Research & Innovation</option>
                <option value="Infrastructure & Security" className="bg-[#0c111e]">Infrastructure & Security</option>
                <option value="Product" className="bg-[#0c111e]">Product</option>
                <option value="Design" className="bg-[#0c111e]">Design</option>
                <option value="Data & Analytics" className="bg-[#0c111e]">Data & Analytics</option>
                <option value="Sales & Operations" className="bg-[#0c111e]">Sales & Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Location</label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA (Hybrid / Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="Full-time" className="bg-[#0c111e]">Full-time</option>
                <option value="Part-time" className="bg-[#0c111e]">Part-time</option>
                <option value="Contract" className="bg-[#0c111e]">Contract</option>
                <option value="Remote" className="bg-[#0c111e]">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">
                Minimum Experience Required (Years)
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={experienceRequired}
                onChange={(e) => setExperienceRequired(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500 font-mono tabular-nums"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Salary Range</label>
              <input
                type="text"
                placeholder="e.g. $140,000 - $180,000"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold font-mono text-[11px]">Job Description *</label>
              <span className="text-[11px] text-slate-500 font-mono">Gemini will parse key responsibilities & keywords</span>
            </div>
            <textarea
              rows={4}
              required
              placeholder="Paste or write the overview of the role, team context, and key objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Section 2: Required & Preferred Skills */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>2. Skills & Competencies</span>
          </h3>

          {/* Required Skills */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-semibold font-mono text-[11px]">
              Mandatory Required Skills (Heavily weighted in matching score)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] min-h-[44px]">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center space-x-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(skill)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add required skill (e.g. React, PostgreSQL, Docker)..."
                value={newRequiredSkill}
                onChange={(e) => setNewRequiredSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequiredSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleAddRequiredSkill}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-semibold border border-white/[0.1]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="space-y-2 pt-2">
            <label className="block text-slate-300 font-semibold font-mono text-[11px]">
              Preferred / Nice-to-Have Skills (Bonus match points)
            </label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] min-h-[44px]">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1.5"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePreferredSkill(skill)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add preferred skill (e.g. Redis, AWS, Tailwind)..."
                value={newPreferredSkill}
                onChange={(e) => setNewPreferredSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPreferredSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleAddPreferredSkill}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-semibold border border-white/[0.1]"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Education */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
            3. Education Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Required Degree</label>
              <input
                type="text"
                placeholder="e.g. Bachelor's Degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Field of Study</label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Engineering, or Equivalent"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Responsibilities */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
            4. Core Responsibilities
          </h3>
          <div className="space-y-2">
            {responsibilities.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-300">{item}</span>
                <button
                  type="button"
                  onClick={() => setResponsibilities(responsibilities.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add a key responsibility..."
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddResponsibility();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-semibold border border-white/[0.1] flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Benefits */}
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider font-mono">
            5. Benefits & Perks
          </h3>
          <div className="space-y-2">
            {benefits.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-slate-300">{item}</span>
                <button
                  type="button"
                  onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <div className="flex space-x-2 pt-1">
              <input
                type="text"
                placeholder="Add a perk or benefit..."
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBenefit();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-semibold border border-white/[0.1] flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center space-x-2 disabled:opacity-50 border border-white/20 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>{isSubmitting ? "Creating & Indexing Job..." : "Publish Job Opening"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
