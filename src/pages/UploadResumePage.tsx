import React, { useState, useEffect, useRef } from "react";
import { Job, CandidateCardItem } from "../types/index.js";
import { MatchScoreBadge } from "../components/MatchScoreBadge.js";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Briefcase,
  X,
  FileCheck,
  Play,
  RotateCw,
  FolderOpen,
} from "lucide-react";

interface UploadResumePageProps {
  onCandidateProcessed: (candidateId: string, applicationId?: string) => void;
  onNavigateCandidates: () => void;
}

interface ParsedQueueItem {
  id: string;
  file?: File;
  pastedText?: string;
  fileName: string;
  fileSize: number;
  status: "pending" | "processing" | "completed" | "error";
  candidateId?: string;
  applicationId?: string;
  candidateName?: string;
  matchScore?: number;
  extractedSkills?: string[];
  errorMessage?: string;
}

export const UploadResumePage: React.FC<UploadResumePageProps> = ({
  onCandidateProcessed,
  onNavigateCandidates,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [pasteText, setPasteText] = useState("");
  const [pasteCandidateName, setPasteCandidateName] = useState("");
  const [queue, setQueue] = useState<ParsedQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.jobs && data.jobs.length > 0) {
          setSelectedJobId(data.jobs[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToQueue(Array.from(e.target.files));
    }
  };

  const addFilesToQueue = (files: File[]) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
    ];

    const newItems: ParsedQueueItem[] = [];

    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        alert(`File ${f.name} exceeds the 10MB limit.`);
        continue;
      }

      const ext = f.name.split(".").pop()?.toLowerCase();
      const isValid = validTypes.includes(f.type) || ["pdf", "docx", "txt", "md"].includes(ext || "");

      if (!isValid) {
        alert(`File ${f.name} is not a supported format. Please upload PDF, DOCX, TXT, or MD.`);
        continue;
      }

      newItems.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file: f,
        fileName: f.name,
        fileSize: f.size,
        status: "pending",
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
  };

  const handleAddPastedResume = () => {
    if (!pasteText.trim()) return;

    const newItem: ParsedQueueItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pastedText: pasteText,
      fileName: pasteCandidateName ? `${pasteCandidateName.replace(/\s+/g, "_")}_Resume.txt` : "Pasted_Resume.txt",
      fileSize: Buffer.byteLength(pasteText, "utf8"),
      status: "pending",
    };

    setQueue((prev) => [newItem, ...prev]);
    setPasteText("");
    setPasteCandidateName("");
  };

  const processQueueItem = async (item: ParsedQueueItem): Promise<ParsedQueueItem> => {
    try {
      const formData = new FormData();
      if (item.file) {
        formData.append("resumeFile", item.file);
      } else if (item.pastedText) {
        formData.append("resumeText", item.pastedText);
        formData.append("fileName", item.fileName);
      }

      if (selectedJobId) {
        formData.append("jobId", selectedJobId);
      }

      const res = await fetch("/api/candidates/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process resume");
      }

      const candidate = data.candidate;
      const app = data.application;

      return {
        ...item,
        status: "completed",
        candidateId: candidate.id,
        applicationId: app?.id,
        candidateName: candidate.fullName,
        matchScore: app?.matchScore,
        extractedSkills: [
          ...(candidate.skills?.technical || []),
          ...(candidate.skills?.frameworksAndTools || []),
        ].slice(0, 5),
      };
    } catch (err: any) {
      console.error("Queue item processing error:", err);
      return {
        ...item,
        status: "error",
        errorMessage: err.message || "Extraction failed",
      };
    }
  };

  const handleStartProcessing = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const pendingItems = queue.filter((i) => i.status === "pending" || i.status === "error");

    for (const item of pendingItems) {
      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "processing" } : i))
      );

      const result = await processQueueItem(item);

      setQueue((prev) =>
        prev.map((i) => (i.id === item.id ? result : i))
      );
    }

    setIsProcessing(false);
  };

  const handleLoadSampleResumes = () => {
    const samples: ParsedQueueItem[] = [
      {
        id: `sample_1_${Date.now()}`,
        fileName: "Maya_Lin_Senior_FullStack.txt",
        fileSize: 4200,
        status: "pending",
        pastedText: `MAYA LIN
Email: maya.lin.dev@gmail.com | Phone: (415) 334-9182 | San Francisco, CA
LinkedIn: linkedin.com/in/mayalin-tech | GitHub: github.com/mayalin-dev

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 7 years of deep experience architecting scalable React, TypeScript, Node.js, and PostgreSQL web platforms. Led migration of monolithic backend to microservices using Docker and AWS ECS. Strong advocate for test-driven development and clean code.

CORE TECHNICAL SKILLS
- Frontend: React, TypeScript, Next.js, Redux, Tailwind CSS, Jest
- Backend: Node.js, Express, PostgreSQL, REST APIs, GraphQL, Redis, Prisma
- Cloud & DevOps: Docker, AWS (ECS, S3, RDS, CloudFront), GitHub Actions, CI/CD

PROFESSIONAL EXPERIENCE
CloudSphere Technologies — Staff Full-Stack Software Engineer (2022 - Present)
- Architected enterprise React/TypeScript dashboards serving 45,000 daily active users with sub-second page loads.
- Designed Node.js REST and GraphQL microservices deployed via Docker containers on AWS.
- Mentored 6 junior/mid-level engineers and standardized automated CI/CD unit testing in Jest.

VentureMatrix Inc. — Senior Web Engineer (2019 - 2022)
- Built high-concurrency PostgreSQL data ingestion pipeline reducing query latency by 50%.
- Created reusable component design system in React and TypeScript.

EDUCATION
University of California, Berkeley — B.S. in Computer Science (2015 - 2019)

CERTIFICATIONS
- AWS Certified Solutions Architect Associate (2023)`,
      },
      {
        id: `sample_2_${Date.now()}`,
        fileName: "Dr_Arun_Patel_Lead_AI.txt",
        fileSize: 4900,
        status: "pending",
        pastedText: `DR. ARUN PATEL
Email: arun.patel.ai@cs.columbia.edu | Phone: (646) 778-9012 | New York, NY
GitHub: github.com/arunpatel-ml | Google Scholar: scholar.google.com/citations?user=arunpatel

PROFESSIONAL SUMMARY
Lead AI and Machine Learning Researcher with 6 years experience designing production Large Language Model (LLM) pipelines, retrieval-augmented generation (RAG) architectures, and fine-tuning transformer models. Deep expertise in PyTorch, vector databases, and asynchronous FastAPI inference servers.

TECHNICAL EXPERTISE
- Machine Learning & AI: Python, PyTorch, Transformers, Hugging Face, LLMs, Vector Databases (Pinecone, Qdrant, Chroma), Prompt Engineering, LangChain
- Engineering & Cloud: FastAPI, Docker, Kubernetes, PostgreSQL, GCP, AWS

EXPERIENCE
NeuroCognitive AI Labs — Lead Machine Learning Engineer (2022 - Present)
- Built scalable retrieval-augmented generation (RAG) pipeline utilizing dense vector embeddings and cross-encoder re-ranking.
- Deployed high-throughput FastAPI inference microservices handling 400+ requests/sec with p99 latency under 70ms.
- Built automated toxicity evaluation benchmarks and algorithmic fairness audit filters for generative outputs.

DeepData Systems — NLP Research Scientist (2020 - 2022)
- Fine-tuned transformer models for multi-lingual semantic document summarization.

EDUCATION
Columbia University — Ph.D. in Computer Science (Natural Language Processing & Machine Learning), 2020
Indian Institute of Technology (IIT) Bombay — B.Tech in Computer Science, 2016`,
      },
      {
        id: `sample_3_${Date.now()}`,
        fileName: "Jordan_Blake_DevOps.txt",
        fileSize: 3800,
        status: "pending",
        pastedText: `JORDAN BLAKE
Seattle, WA | jordan.blake.infra@gmail.com | (206) 881-4420
LinkedIn: linkedin.com/in/jordanblake-cloud | GitHub: github.com/jblake-infra

SUMMARY
Cloud Infrastructure and DevOps Engineer with 6 years of expertise building resilient Kubernetes clusters, Terraform infrastructure-as-code, and automated GitOps CI/CD delivery pipelines in AWS and Linux environments.

TECHNICAL SKILLS
Kubernetes, Terraform, AWS, Docker, CI/CD (GitHub Actions, ArgoCD), Linux, Prometheus, Grafana, Helm, Bash, Python, Go.

WORK EXPERIENCE
SaaSStream Cloud — Senior DevOps / SRE Lead (2021 - Present)
- Architected multi-region AWS EKS Kubernetes clusters hosting 120+ microservices with 99.99% uptime.
- Wrote modular Terraform modules managing 100% of cloud resources.
- Set up Prometheus and Grafana dashboards for cluster observability and automated incident response alerting.

AeroData Networks — Cloud Engineer (2019 - 2021)
- Containerized legacy applications using Docker and migrated workloads to AWS.

EDUCATION
University of Washington — B.S. in Computer Engineering (2019)

CERTIFICATIONS
- Certified Kubernetes Administrator (CKA)
- AWS Certified DevOps Engineer Professional`,
      },
    ];

    setQueue((prev) => [...prev, ...samples]);
  };

  const completedCount = queue.filter((i) => i.status === "completed").length;
  const pendingCount = queue.filter((i) => i.status === "pending").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-mono text-[11px]">Multimodal LLM Document Processing</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Upload & Parse Resumes</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Automatically extract skills, experience, education, and calculate assistive job matching scores with Gemini 3.8 Flash.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleLoadSampleResumes}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-cyan-300 border border-cyan-500/30 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <span>Load Sample Resumes</span>
          </button>
        </div>
      </div>

      {/* Target Job Selector Card */}
      <div className="p-5 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-white">Target Job Position for Scoring</h3>
            <p className="text-xs text-slate-400">Extracted resumes will be evaluated and ranked against this role</p>
          </div>
        </div>

        <div className="min-w-[260px]">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold cursor-pointer"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id} className="bg-[#0c111e]">
                {job.title} ({job.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex border-b border-white/[0.08] space-x-4 text-xs font-bold font-mono">
        <button
          onClick={() => setActiveTab("file")}
          className={`pb-3 flex items-center space-x-2 transition-all border-b-2 ${
            activeTab === "file"
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File (PDF / DOCX / TXT)</span>
        </button>

        <button
          onClick={() => setActiveTab("paste")}
          className={`pb-3 flex items-center space-x-2 transition-all border-b-2 ${
            activeTab === "paste"
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Plain Text Resume</span>
        </button>
      </div>

      {/* File Dropzone Tab */}
      {activeTab === "file" && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center space-y-4 backdrop-blur-xl ${
            dragActive
              ? "border-violet-400 bg-violet-600/15"
              : "border-white/[0.12] bg-[#0c111e]/75 hover:bg-[#0c111e]/95 hover:border-violet-500/50 shadow-xl"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-display font-bold text-white">
              Drag & drop candidate resumes here, or <span className="text-violet-400 underline">browse files</span>
            </h3>
            <p className="text-xs text-slate-400">
              Supports PDF, DOCX (Word), TXT, or MD documents up to 10MB each. Bulk uploads supported.
            </p>
          </div>

          <div className="flex items-center justify-center space-x-6 text-[11px] text-slate-500 pt-2 font-mono">
            <span>✓ PDF Parsing</span>
            <span>✓ DOCX Parsing</span>
            <span>✓ Anti-Bias Guardrails Active</span>
          </div>
        </div>
      )}

      {/* Paste Resume Tab */}
      {activeTab === "paste" && (
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 text-xs backdrop-blur-xl shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Candidate Full Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams (or auto-detect from text)"
                value={pasteCandidateName}
                onChange={(e) => setPasteCandidateName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 font-mono text-[11px]">Resume Text Content *</label>
            <textarea
              rows={8}
              placeholder="Paste raw resume text including summary, work experience, education, skills, and projects..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono text-xs leading-relaxed resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddPastedResume}
              disabled={!pasteText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold transition-all disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-indigo-600/25 border border-white/20 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Add to Processing Queue</span>
            </button>
          </div>
        </div>
      )}

      {/* Upload & Processing Queue */}
      {queue.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#0c111e]/90 border border-white/[0.08] space-y-4 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-display font-bold text-white flex items-center space-x-2">
                <span>Resume Processing Queue</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-violet-300 border border-white/[0.08] font-mono font-bold tabular-nums">
                  {completedCount} / {queue.length} Analyzed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Extracting structured candidate attributes and matching against target job criteria.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setQueue([])}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] transition-colors"
              >
                Clear Queue
              </button>

              <button
                type="button"
                onClick={handleStartProcessing}
                disabled={isProcessing || pendingCount === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-2 disabled:opacity-50 border border-white/20 active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resumes...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Process {pendingCount} Pending Resumes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Queue items list */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pt-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md"
              >
                <div className="flex items-center space-x-3 min-w-[220px]">
                  <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white truncate max-w-xs">{item.fileName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {Math.round(item.fileSize / 1024)} KB ·{" "}
                      {item.candidateName ? item.candidateName : "Pending extraction"}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center space-x-3 flex-wrap">
                  {item.status === "pending" && (
                    <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-slate-400 border border-white/[0.08] font-semibold font-mono text-[11px]">
                      Ready to Parse
                    </span>
                  )}
                  {item.status === "processing" && (
                    <span className="px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center space-x-1.5 font-semibold font-mono text-[11px]">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>Parsing with Gemini...</span>
                    </span>
                  )}
                  {item.status === "completed" && (
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Parsed & Indexed</span>
                      </span>

                      {item.matchScore !== undefined && (
                        <MatchScoreBadge score={item.matchScore} size="sm" />
                      )}
                    </div>
                  )}
                  {item.status === "error" && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center space-x-1 font-semibold text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{item.errorMessage || "Extraction failed"}</span>
                    </span>
                  )}

                  {/* Actions */}
                  {item.status === "completed" && item.candidateId && (
                    <button
                      onClick={() => onCandidateProcessed(item.candidateId!, item.applicationId)}
                      className="px-3 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 font-semibold transition-all text-xs"
                    >
                      View Profile & Match
                    </button>
                  )}

                  <button
                    onClick={() => setQueue((prev) => prev.filter((i) => i.id !== item.id))}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Jump to Candidates Board */}
          {completedCount > 0 && (
            <div className="pt-3 border-t border-white/[0.06] flex justify-end">
              <button
                onClick={onNavigateCandidates}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] flex items-center space-x-2 transition-colors"
              >
                <span>View All Candidates on Leaderboard</span>
                <FileCheck className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
