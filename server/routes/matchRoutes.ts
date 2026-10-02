import { Router, Request, Response } from "express";
import { db, ApplicationStatus } from "../db.js";
import { matchCandidateToJobWithGemini } from "../gemini.js";

const router = Router();

// GET /api/applications/:id - Get full application and AI match analysis
router.get("/:id", (req: Request, res: Response) => {
  const application = db.applications.find((a) => a.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const candidate = db.candidates.find((c) => c.id === application.candidateId);
  const job = db.jobs.find((j) => j.id === application.jobId);

  return res.json({
    application,
    candidate,
    job,
  });
});

// PATCH /api/applications/:id/status - Update application status
router.patch("/:id/status", (req: Request, res: Response) => {
  const { status } = req.body;
  const application = db.applications.find((a) => a.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  const validStatuses: ApplicationStatus[] = [
    "Applied",
    "Screened",
    "Shortlisted",
    "Interview",
    "Offer",
    "Rejected",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  application.status = status;
  application.updatedDate = new Date().toISOString();

  return res.json({ application, message: `Status updated to ${status}` });
});

// PATCH /api/applications/:id/notes - Update recruiter notes
router.patch("/:id/notes", (req: Request, res: Response) => {
  const { notes } = req.body;
  const application = db.applications.find((a) => a.id === req.params.id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }

  application.recruiterNotes = notes;
  application.updatedDate = new Date().toISOString();

  return res.json({ application });
});

// POST /api/match/evaluate - Trigger re-evaluation or cross-match candidate to a job
router.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.body;
    const candidate = db.candidates.find((c) => c.id === candidateId);
    const job = db.jobs.find((j) => j.id === jobId);

    if (!candidate || !job) {
      return res.status(404).json({ error: "Candidate or Job not found" });
    }

    const matchResult = await matchCandidateToJobWithGemini(
      {
        fullName: candidate.fullName,
        email: candidate.email,
        phone: candidate.phone,
        location: candidate.location,
        linkedin: candidate.linkedin,
        github: candidate.github,
        portfolio: candidate.portfolio,
        summary: candidate.summary,
        totalYearsExperience: candidate.totalYearsExperience,
        skills: candidate.skills,
        education: candidate.education,
        experience: candidate.experience,
        projects: candidate.projects,
        certifications: candidate.certifications,
      },
      {
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
        minExperienceYears: job.experienceRequired,
        educationRequirements: job.educationRequirements,
      }
    );

    // Update existing or create new application
    let application = db.applications.find((a) => a.candidateId === candidate.id && a.jobId === job.id);
    if (application) {
      application.matchScore = matchResult.overallScore;
      application.matchResult = matchResult;
      application.updatedDate = new Date().toISOString();
    } else {
      application = {
        id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        candidateId: candidate.id,
        jobId: job.id,
        status: "Applied",
        matchScore: matchResult.overallScore,
        matchResult,
        appliedDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };
      db.applications.unshift(application);
      db.syncCandidateCounts();
    }

    return res.json({
      application,
      matchResult,
    });
  } catch (error: any) {
    console.error("Match evaluation error:", error);
    return res.status(500).json({ error: "Evaluation failed: " + (error?.message || "Unknown error") });
  }
});

export default router;
