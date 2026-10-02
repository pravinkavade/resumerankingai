import { Router, Request, Response } from "express";
import { db, Job, JobStatus } from "../db.js";
import { analyzeJobWithGemini } from "../gemini.js";

const router = Router();

// GET /api/jobs - List all jobs with filters
router.get("/", (req: Request, res: Response) => {
  const { status, search, department } = req.query;
  db.syncCandidateCounts();

  let results = [...db.jobs];

  if (status && typeof status === "string" && status !== "All") {
    results = results.filter((j) => j.status.toLowerCase() === status.toLowerCase());
  }

  if (department && typeof department === "string" && department !== "All") {
    results = results.filter((j) => j.department.toLowerCase() === department.toLowerCase());
  }

  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.requiredSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Sort by updatedAt descending
  results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return res.json({ jobs: results, total: results.length });
});

// GET /api/jobs/:id - Get single job details with associated applications
router.get("/:id", (req: Request, res: Response) => {
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const jobApplications = db.applications.filter((a) => a.jobId === job.id);
  const candidatesWithApp = jobApplications.map((app) => {
    const candidate = db.candidates.find((c) => c.id === app.candidateId);
    return {
      applicationId: app.id,
      candidateId: candidate?.id,
      fullName: candidate?.fullName || "Candidate",
      email: candidate?.email || "",
      location: candidate?.location || "",
      totalYearsExperience: candidate?.totalYearsExperience || 0,
      skills: candidate?.skills?.technical || [],
      status: app.status,
      matchScore: app.matchScore,
      matchResult: app.matchResult,
      appliedDate: app.appliedDate,
    };
  });

  // Sort candidates by matchScore descending
  candidatesWithApp.sort((a, b) => b.matchScore - a.matchScore);

  return res.json({
    job: {
      ...job,
      candidateCount: candidatesWithApp.length,
    },
    candidates: candidatesWithApp,
  });
});

// POST /api/jobs/analyze - AI analysis of raw job description text before creating
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { title, department, description, requiredSkills = [], preferredSkills = [] } = req.body;

    if (!description && !title) {
      return res.status(400).json({ error: "Title or Job Description is required for AI analysis." });
    }

    const analyzed = await analyzeJobWithGemini(
      title || "Job Opening",
      department || "General",
      description || "",
      requiredSkills,
      preferredSkills
    );

    return res.json({ analyzed });
  } catch (error: any) {
    console.error("Job analysis error:", error);
    return res.status(500).json({ error: "Failed to analyze job description: " + (error?.message || "Unknown error") });
  }
});

// POST /api/jobs - Create job
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      title,
      department,
      location,
      employmentType,
      experienceRequired,
      salaryRange,
      description,
      requiredSkills = [],
      preferredSkills = [],
      educationRequirements,
      responsibilities = [],
      requirements = [],
      benefits = [],
      autoAnalyze = true,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Job title and description are required." });
    }

    let enrichedSkills = {
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : [],
      technicalSkills: Array.isArray(requiredSkills) ? [...requiredSkills] : [],
      softSkills: ["Collaboration", "Problem Solving", "Communication"],
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      keywords: [title, department || "Engineering"],
    };

    // If autoAnalyze is enabled or skills list is sparse, enrich with Gemini
    if (autoAnalyze && (enrichedSkills.requiredSkills.length === 0 || enrichedSkills.responsibilities.length === 0)) {
      const aiAnalysis = await analyzeJobWithGemini(
        title,
        department || "Engineering",
        description,
        enrichedSkills.requiredSkills,
        enrichedSkills.preferredSkills
      );

      enrichedSkills = {
        requiredSkills: Array.from(new Set([...enrichedSkills.requiredSkills, ...aiAnalysis.requiredSkills])),
        preferredSkills: Array.from(new Set([...enrichedSkills.preferredSkills, ...aiAnalysis.preferredSkills])),
        technicalSkills: aiAnalysis.technicalSkills,
        softSkills: aiAnalysis.softSkills,
        responsibilities: enrichedSkills.responsibilities.length > 0 ? enrichedSkills.responsibilities : aiAnalysis.keyResponsibilities,
        requirements: enrichedSkills.requirements.length > 0 ? enrichedSkills.requirements : aiAnalysis.keyRequirements,
        benefits: enrichedSkills.benefits.length > 0 ? enrichedSkills.benefits : aiAnalysis.benefits,
        keywords: aiAnalysis.keywords,
      };
    }

    const newJob: Job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      department: department?.trim() || "Engineering",
      location: location?.trim() || "Remote",
      employmentType: employmentType || "Full-time",
      experienceRequired: Number(experienceRequired) || 2,
      salaryRange: salaryRange || "Competitive",
      status: "Active",
      description: description.trim(),
      requiredSkills: enrichedSkills.requiredSkills,
      preferredSkills: enrichedSkills.preferredSkills,
      technicalSkills: enrichedSkills.technicalSkills,
      softSkills: enrichedSkills.softSkills,
      educationRequirements: educationRequirements || {
        degree: "Bachelor's Degree",
        fieldOfStudy: "Relevant Field",
      },
      responsibilities: enrichedSkills.responsibilities,
      requirements: enrichedSkills.requirements,
      benefits: enrichedSkills.benefits,
      keywords: enrichedSkills.keywords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      candidateCount: 0,
    };

    db.jobs.unshift(newJob);

    return res.status(201).json({ job: newJob });
  } catch (error: any) {
    console.error("Job creation error:", error);
    return res.status(500).json({ error: "Failed to create job: " + (error?.message || "Unknown error") });
  }
});

// PUT /api/jobs/:id - Update job
router.put("/:id", (req: Request, res: Response) => {
  const jobIndex = db.jobs.findIndex((j) => j.id === req.params.id);
  if (jobIndex === -1) {
    return res.status(404).json({ error: "Job not found" });
  }

  const existing = db.jobs[jobIndex];
  const {
    title,
    department,
    location,
    employmentType,
    experienceRequired,
    salaryRange,
    status,
    description,
    requiredSkills,
    preferredSkills,
    educationRequirements,
    responsibilities,
    requirements,
    benefits,
  } = req.body;

  const updated: Job = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    department: department !== undefined ? department.trim() : existing.department,
    location: location !== undefined ? location.trim() : existing.location,
    employmentType: employmentType || existing.employmentType,
    experienceRequired: experienceRequired !== undefined ? Number(experienceRequired) : existing.experienceRequired,
    salaryRange: salaryRange !== undefined ? salaryRange : existing.salaryRange,
    status: (status as JobStatus) || existing.status,
    description: description !== undefined ? description.trim() : existing.description,
    requiredSkills: requiredSkills || existing.requiredSkills,
    preferredSkills: preferredSkills || existing.preferredSkills,
    educationRequirements: educationRequirements || existing.educationRequirements,
    responsibilities: responsibilities || existing.responsibilities,
    requirements: requirements || existing.requirements,
    benefits: benefits || existing.benefits,
    updatedAt: new Date().toISOString(),
  };

  db.jobs[jobIndex] = updated;
  return res.json({ job: updated });
});

// PATCH /api/jobs/:id/status - Change status
router.patch("/:id/status", (req: Request, res: Response) => {
  const { status } = req.body;
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const validStatuses: JobStatus[] = ["Draft", "Active", "Closed", "Archived"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid job status" });
  }

  job.status = status;
  job.updatedAt = new Date().toISOString();
  return res.json({ job });
});

// DELETE /api/jobs/:id
router.delete("/:id", (req: Request, res: Response) => {
  const index = db.jobs.findIndex((j) => j.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Job not found" });
  }

  const deleted = db.jobs.splice(index, 1)[0];
  // Also clean up applications for this job
  db.applications = db.applications.filter((a) => a.jobId !== deleted.id);

  return res.json({ message: "Job deleted successfully", id: deleted.id });
});

export default router;
