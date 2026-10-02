import { Router, Request, Response } from "express";
import multer from "multer";
import { createRequire } from "module";
import mammoth from "mammoth";
import { db, Candidate, Application } from "../db.js";
import { parseResumeWithGemini, matchCandidateToJobWithGemini, ExtractedResumeData } from "../gemini.js";

const require = createRequire(import.meta.url);
const pdfParse: any = require("pdf-parse");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

// Helper to extract text from buffer
async function extractTextFromUpload(file: Express.Multer.File): Promise<string> {
  const mimeType = file.mimetype;
  const fileName = file.originalname.toLowerCase();

  try {
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      const data = await (pdfParse as any)(file.buffer);
      if (data && data.text && data.text.trim().length > 20) {
        return data.text;
      }
    }
  } catch (pdfErr) {
    console.warn("pdf-parse notice, attempting fallback buffer decoding:", pdfErr);
  }

  try {
    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      if (result && result.value && result.value.trim().length > 20) {
        return result.value;
      }
    }
  } catch (docErr) {
    console.warn("mammoth docx notice:", docErr);
  }

  // Fallback UTF-8 text decode
  const rawDecoded = file.buffer.toString("utf-8");
  // Clean null bytes or non-printable binary artifacts if any
  return rawDecoded.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ");
}

// GET /api/candidates - List candidates with filters and match scores
router.get("/", (req: Request, res: Response) => {
  const { jobId, status, minScore, search, sortBy } = req.query;

  // Flatten candidate + application info
  let candidateCards = db.candidates.map((cand) => {
    // Find applications
    const apps = db.applications.filter((a) => a.candidateId === cand.id);
    const targetApp = jobId ? apps.find((a) => a.jobId === jobId) : apps[0];
    const job = targetApp ? db.jobs.find((j) => j.id === targetApp.jobId) : null;

    return {
      id: cand.id,
      fullName: cand.fullName,
      email: cand.email,
      phone: cand.phone,
      location: cand.location,
      summary: cand.summary,
      totalYearsExperience: cand.totalYearsExperience,
      topSkills: [
        ...(cand.skills.technical || []),
        ...(cand.skills.frameworksAndTools || []),
      ].slice(0, 6),
      allSkills: cand.skills,
      applicationId: targetApp?.id,
      jobId: targetApp?.jobId,
      jobTitle: job?.title || "General Pool",
      status: targetApp?.status || "Applied",
      matchScore: targetApp?.matchScore !== undefined ? targetApp.matchScore : null,
      matchResult: targetApp?.matchResult,
      appliedDate: targetApp?.appliedDate || cand.createdAt,
      createdAt: cand.createdAt,
      totalApplications: apps.length,
    };
  });

  // Filter by Job ID
  if (jobId && typeof jobId === "string" && jobId !== "All") {
    candidateCards = candidateCards.filter((c) => c.jobId === jobId);
  }

  // Filter by Application Status
  if (status && typeof status === "string" && status !== "All") {
    candidateCards = candidateCards.filter((c) => c.status?.toLowerCase() === status.toLowerCase());
  }

  // Filter by Minimum Match Score
  if (minScore && !isNaN(Number(minScore))) {
    const minVal = Number(minScore);
    candidateCards = candidateCards.filter((c) => (c.matchScore ?? 0) >= minVal);
  }

  // Filter by Search Query
  if (search && typeof search === "string" && search.trim()) {
    const q = search.toLowerCase().trim();
    candidateCards = candidateCards.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.jobTitle.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.topSkills.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortBy === "score_desc") {
    candidateCards.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
  } else if (sortBy === "score_asc") {
    candidateCards.sort((a, b) => (a.matchScore ?? 999) - (b.matchScore ?? 999));
  } else if (sortBy === "exp_desc") {
    candidateCards.sort((a, b) => b.totalYearsExperience - a.totalYearsExperience);
  } else {
    // Default: score desc if available, else date
    candidateCards.sort((a, b) => {
      if (b.matchScore !== null && a.matchScore !== null) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });
  }

  return res.json({ candidates: candidateCards, total: candidateCards.length });
});

// GET /api/candidates/:id - Deep candidate profile
router.get("/:id", (req: Request, res: Response) => {
  const candidate = db.candidates.find((c) => c.id === req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  const applications = db.applications
    .filter((a) => a.candidateId === candidate.id)
    .map((app) => {
      const job = db.jobs.find((j) => j.id === app.jobId);
      return {
        ...app,
        jobTitle: job?.title || "Unknown Job",
        jobDepartment: job?.department || "General",
        jobRequiredSkills: job?.requiredSkills || [],
        jobPreferredSkills: job?.preferredSkills || [],
      };
    });

  return res.json({ candidate, applications });
});

// POST /api/candidates/upload - Upload and Parse Resume (Supports PDF, DOCX, TXT, or pasted text)
router.post("/upload", upload.single("resumeFile"), async (req: Request, res: Response) => {
  try {
    let resumeText = "";
    let fileName = "pasted_resume.txt";
    let fileType = "text/plain";
    let fileSize = 0;

    if (req.file) {
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
      resumeText = await extractTextFromUpload(req.file);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
      fileSize = Buffer.byteLength(resumeText, "utf8");
      fileName = req.body.fileName || "Direct_Submission.txt";
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ error: "Could not extract readable resume text from the submitted file." });
    }

    const targetJobId = req.body.jobId;
    const targetJob = targetJobId ? db.jobs.find((j) => j.id === targetJobId) : null;

    // Step 1: LLM Extraction with Gemini
    const extractedData: ExtractedResumeData = await parseResumeWithGemini(resumeText, fileName);

    // Step 2: Create Candidate Record
    const newCandidate: Candidate = {
      id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: extractedData.fullName || "Candidate",
      email: extractedData.email || "candidate@example.com",
      phone: extractedData.phone || "",
      location: extractedData.location || "Remote",
      linkedin: extractedData.linkedin,
      github: extractedData.github,
      portfolio: extractedData.portfolio,
      summary: extractedData.summary,
      totalYearsExperience: extractedData.totalYearsExperience || 2,
      skills: extractedData.skills,
      education: extractedData.education,
      experience: extractedData.experience,
      projects: extractedData.projects,
      certifications: extractedData.certifications,
      rawResumeText: resumeText,
      fileName,
      fileType,
      fileSize,
      createdAt: new Date().toISOString(),
    };

    db.candidates.unshift(newCandidate);

    let applicationResult: Application | null = null;

    // Step 3: If targetJob provided, compute semantic match & ranking score
    if (targetJob) {
      const matchResult = await matchCandidateToJobWithGemini(extractedData, {
        title: targetJob.title,
        description: targetJob.description,
        requiredSkills: targetJob.requiredSkills,
        preferredSkills: targetJob.preferredSkills,
        minExperienceYears: targetJob.experienceRequired,
        educationRequirements: targetJob.educationRequirements,
      });

      applicationResult = {
        id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        candidateId: newCandidate.id,
        jobId: targetJob.id,
        status: "Applied",
        matchScore: matchResult.overallScore,
        matchResult,
        appliedDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      db.applications.unshift(applicationResult);
      db.syncCandidateCounts();
    }

    return res.status(201).json({
      success: true,
      candidate: newCandidate,
      application: applicationResult,
      targetJobTitle: targetJob?.title,
    });
  } catch (error: any) {
    console.error("Resume upload & parsing error:", error);
    return res.status(500).json({ error: "Failed to parse resume: " + (error?.message || "Unknown error") });
  }
});

// DELETE /api/candidates/:id
router.delete("/:id", (req: Request, res: Response) => {
  const index = db.candidates.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Candidate not found" });
  }

  const deleted = db.candidates.splice(index, 1)[0];
  db.applications = db.applications.filter((a) => a.candidateId !== deleted.id);
  db.syncCandidateCounts();

  return res.json({ message: "Candidate deleted successfully", id: deleted.id });
});

export default router;
