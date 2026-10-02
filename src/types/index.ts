export type JobStatus = "Draft" | "Active" | "Closed" | "Archived";
export type ApplicationStatus = "Applied" | "Screened" | "Shortlisted" | "Interview" | "Offer" | "Rejected";

export interface RecruiterUser {
  id: string;
  fullName: string;
  email: string;
  role: "RECRUITER" | "ADMIN";
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceRequired: number;
  salaryRange: string;
  status: JobStatus;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  educationRequirements: {
    degree: string;
    fieldOfStudy: string;
  };
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
  candidateCount?: number;
}

export interface CandidateEducation {
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
  gpaOrHonors?: string;
}

export interface CandidateExperience {
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  durationYears?: number;
  responsibilities: string[];
}

export interface CandidateProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface CandidateCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface CandidateSkills {
  technical: string[];
  languages: string[];
  frameworksAndTools: string[];
  softSkills: string[];
}

export interface MatchAnalysisResult {
  overallScore: number;
  breakdown: {
    skillsMatchScore: number;
    experienceMatchScore: number;
    educationMatchScore: number;
    semanticRelevanceScore: number;
  };
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  strengths: string[];
  potentialGaps: string[];
  interviewQuestions: string[];
  executiveSummary: string;
  fairnessAuditNotes: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  totalYearsExperience: number;
  skills: CandidateSkills;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
  rawResumeText: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface CandidateCardItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  totalYearsExperience: number;
  topSkills: string[];
  allSkills: CandidateSkills;
  applicationId?: string;
  jobId?: string;
  jobTitle: string;
  status: ApplicationStatus;
  matchScore: number | null;
  matchResult?: MatchAnalysisResult;
  appliedDate: string;
  createdAt: string;
  totalApplications: number;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  matchScore: number;
  matchResult: MatchAnalysisResult;
  recruiterNotes?: string;
  appliedDate: string;
  updatedDate: string;
  jobTitle?: string;
  jobDepartment?: string;
  jobRequiredSkills?: string[];
  jobPreferredSkills?: string[];
}

export interface AnalyticsData {
  metrics: {
    totalJobs: number;
    activeJobs: number;
    totalCandidates: number;
    totalApplications: number;
    screenedCandidates: number;
    shortlistedCandidates: number;
    interviews: number;
    offers: number;
    rejectedCandidates: number;
    averageMatchScore: number;
  };
  candidatesPerJob: Array<{
    jobId: string;
    jobTitle: string;
    fullTitle: string;
    department: string;
    candidatesCount: number;
    shortlistedCount: number;
    avgScore: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  scoreDistribution: Array<{
    range: string;
    min: number;
    max: number;
    count: number;
    label: string;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
    percentage: number;
  }>;
}
