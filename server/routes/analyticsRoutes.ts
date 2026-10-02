import { Router, Request, Response } from "express";
import { db } from "../db.js";

const router = Router();

// GET /api/analytics - Recruitment platform analytics
router.get("/", (_req: Request, res: Response) => {
  db.syncCandidateCounts();

  const totalJobs = db.jobs.length;
  const activeJobs = db.jobs.filter((j) => j.status === "Active").length;
  const totalCandidates = db.candidates.length;

  const totalApplications = db.applications.length;
  const screenedCount = db.applications.filter((a) => a.status === "Screened" || a.status === "Shortlisted" || a.status === "Interview" || a.status === "Offer").length;
  const shortlistedCount = db.applications.filter((a) => a.status === "Shortlisted").length;
  const interviewCount = db.applications.filter((a) => a.status === "Interview").length;
  const offerCount = db.applications.filter((a) => a.status === "Offer").length;
  const rejectedCount = db.applications.filter((a) => a.status === "Rejected").length;

  // Chart 1: Candidates per Job
  const candidatesPerJob = db.jobs.map((job) => {
    const apps = db.applications.filter((a) => a.jobId === job.id);
    const avgScore = apps.length > 0
      ? Math.round(apps.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) / apps.length)
      : 0;

    return {
      jobId: job.id,
      jobTitle: job.title.length > 22 ? job.title.substring(0, 22) + "..." : job.title,
      fullTitle: job.title,
      department: job.department,
      candidatesCount: apps.length,
      shortlistedCount: apps.filter((a) => a.status === "Shortlisted" || a.status === "Interview").length,
      avgScore,
    };
  });

  // Chart 2: Application Status Distribution
  const statusCounts: Record<string, number> = {
    Applied: 0,
    Screened: 0,
    Shortlisted: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  for (const app of db.applications) {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
  }

  const statusColors: Record<string, string> = {
    Applied: "#6366f1", // Indigo
    Screened: "#3b82f6", // Blue
    Shortlisted: "#10b981", // Emerald
    Interview: "#f59e0b", // Amber
    Offer: "#8b5cf6", // Purple
    Rejected: "#ef4444", // Red
  };

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: statusColors[status] || "#94a3b8",
  }));

  // Chart 3: Candidate Matching Score Distribution (Histogram)
  const scoreBuckets = [
    { range: "90-100%", min: 90, max: 100, count: 0, label: "Top Match" },
    { range: "80-89%", min: 80, max: 89, count: 0, label: "Strong" },
    { range: "70-79%", min: 70, max: 79, count: 0, label: "Moderate" },
    { range: "60-69%", min: 60, max: 69, count: 0, label: "Marginal" },
    { range: "<60%", min: 0, max: 59, count: 0, label: "Low Fit" },
  ];

  for (const app of db.applications) {
    const score = app.matchScore ?? 0;
    for (const bucket of scoreBuckets) {
      if (score >= bucket.min && score <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  // Chart 4: Skills Frequently Found in Candidates
  const skillFrequency: Record<string, number> = {};
  for (const candidate of db.candidates) {
    const allSkills = [
      ...(candidate.skills.technical || []),
      ...(candidate.skills.frameworksAndTools || []),
    ];

    const uniqueInCandidate = Array.from(new Set(allSkills));
    for (const skill of uniqueInCandidate) {
      if (!skill || skill.length < 2) continue;
      const normalized = skill.trim();
      skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
    }
  }

  const topSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Math.round((count / Math.max(1, totalCandidates)) * 100),
    }));

  return res.json({
    metrics: {
      totalJobs,
      activeJobs,
      totalCandidates,
      totalApplications,
      screenedCandidates: screenedCount,
      shortlistedCandidates: shortlistedCount,
      interviews: interviewCount,
      offers: offerCount,
      rejectedCandidates: rejectedCount,
      averageMatchScore: db.applications.length > 0
        ? Math.round(db.applications.reduce((acc, a) => acc + (a.matchScore || 0), 0) / db.applications.length)
        : 0,
    },
    candidatesPerJob,
    statusDistribution,
    scoreDistribution: scoreBuckets,
    topSkills,
  });
});

export default router;
