import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Scale,
  Users,
  Eye,
  Lock,
} from "lucide-react";

export const EthicsPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto text-xs sm:text-sm">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Responsible AI & Regulatory Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ethical AI, Non-Bias Guardrails & Compliance
        </h1>
        <p className="text-slate-400 mt-1 max-w-3xl leading-relaxed text-xs sm:text-sm">
          TalentRank AI is strictly engineered as an assistive, merit-based candidate evaluation system. Our architecture eliminates algorithmic bias and complies with global employment fairness standards.
        </p>
      </div>

      {/* Core Constitution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Prohibited Attributes Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/20 space-y-4">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Prohibited Protected Characteristics</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In accordance with legal statutes and ethical AI design, the following attributes are never extracted, inferred, or factored into ranking calculations:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              "Race & Ethnicity",
              "Gender & Gender Identity",
              "Age & Graduation Dates",
              "Religion & Beliefs",
              "Disability Status",
              "Marital & Family Status",
              "Nationality & Origin",
              "Socioeconomic Indicators",
            ].map((attr) => (
              <div key={attr} className="flex items-center space-x-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span className="font-semibold text-[11px]">{attr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Permitted Evaluation Criteria */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/20 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Permitted Job-Related Criteria</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Candidate ranking is exclusively calculated through objective, verifiable professional qualifications:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              "Mandatory Required Skills",
              "Preferred Bonus Skills",
              "Verified Experience Duration",
              "Role Title & Seniority Alignment",
              "Technical Frameworks & Tools",
              "Education & Academic Degree",
              "Professional Certifications",
              "Demonstrated Project Milestones",
            ].map((crit) => (
              <div key={crit} className="flex items-center space-x-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="font-semibold text-[11px]">{crit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assistive Human-in-the-Loop Architecture */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Scale className="w-5 h-5 text-indigo-400" />
          <span>Assistive Decision Support Guarantee (No Automated Rejection)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Under our system constitution, <strong>no candidate is ever automatically hired or automatically rejected</strong> by an algorithm. 
          The ranking output is explicitly classified as an assistive score to help human talent acquisition teams triage high resume volumes efficiently.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-white text-xs">100% Explainable</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every score is accompanied by transparent textual reasoning, extracted skills tags, and identified gaps.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-xs">Human Recruiter Autonomy</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Recruiters retain full unilateral discretion to advance, interview, or re-evaluate any candidate regardless of score.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white text-xs">Data Privacy & Retention</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Resumes are processed through secure server-side isolation with zero public exposure of personal identifying data.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Scoring Formula */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <FileText className="w-5 h-5 text-purple-400" />
          <span>Transparent Composite Scoring Formula</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The final assistive match score (0 - 100%) is derived through a mathematically transparent, weighted linear composite model:
        </p>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 space-y-1">
          <p className="font-bold text-white">OverallMatchScore = </p>
          <p className="pl-4">0.40 × (SkillsCoverageScore) +</p>
          <p className="pl-4">0.25 × (ExperienceSeniorityScore) +</p>
          <p className="pl-4">0.15 × (EducationCredentialScore) +</p>
          <p className="pl-4">0.20 × (SemanticVectorRelevanceScore)</p>
        </div>
      </div>
    </div>
  );
};
