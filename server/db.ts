import bcrypt from "bcryptjs";
import { AnalyzedJobData, ExtractedResumeData, MatchAnalysisResult } from "./gemini.js";

export interface RecruiterUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "RECRUITER" | "ADMIN";
  createdAt: string;
}

export type JobStatus = "Draft" | "Active" | "Closed" | "Archived";
export type ApplicationStatus = "Applied" | "Screened" | "Shortlisted" | "Interview" | "Offer" | "Rejected";

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
  skills: {
    technical: string[];
    languages: string[];
    frameworksAndTools: string[];
    softSkills: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    fieldOfStudy: string;
    graduationYear: string;
    gpaOrHonors?: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate: string;
    durationYears?: number;
    responsibilities: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  rawResumeText: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
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
}

// In-Memory Database store with persistent life during server run
class DatabaseStore {
  users: RecruiterUser[] = [];
  jobs: Job[] = [];
  candidates: Candidate[] = [];
  applications: Application[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed Demo Recruiter User
    const demoPasswordHash = bcrypt.hashSync("password123", 10);
    this.users.push({
      id: "usr_recruiter_01",
      fullName: "Sarah Jenkins",
      email: "recruiter@talentrank.ai",
      passwordHash: demoPasswordHash,
      role: "RECRUITER",
      createdAt: new Date("2026-01-15T09:00:00Z").toISOString(),
    });

    // Seed Jobs
    const job1: Job = {
      id: "job_fullstack_01",
      title: "Senior Full-Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA (Hybrid / Remote)",
      employmentType: "Full-time",
      experienceRequired: 5,
      salaryRange: "$155,000 - $190,000",
      status: "Active",
      description: "We are seeking a Senior Full-Stack Engineer to architect and scale our mission-critical SaaS applications. You will spearhead our frontend architecture in React and TypeScript while designing robust distributed microservices using Node.js, Express, and PostgreSQL with Docker deployments on AWS.",
      requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Docker"],
      preferredSkills: ["GraphQL", "AWS", "Tailwind CSS", "Redis", "CI/CD pipelines"],
      technicalSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Docker", "AWS", "REST APIs", "Git", "Redis"],
      softSkills: ["Mentorship", "System Design", "Agile Collaboration", "Problem Solving"],
      educationRequirements: {
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science or Software Engineering",
      },
      responsibilities: [
        "Architect and maintain high-throughput full-stack web applications and microservices.",
        "Collaborate with product designers and backend engineers to implement intuitive user experiences.",
        "Champion engineering best practices, automated unit and integration testing, and clean code standards.",
        "Optimize database queries, indices, and caching strategies for sub-second page loads."
      ],
      requirements: [
        "5+ years of software development experience with React, TypeScript, and modern Node.js.",
        "Demonstrated relational database modeling and query performance tuning in PostgreSQL.",
        "Hands-on experience containerizing services with Docker and deploying to AWS cloud infrastructure.",
        "Strong understanding of web security, OAuth2, and scalable RESTful API design."
      ],
      benefits: [
        "Competitive base salary + equity compensation package",
        "Comprehensive medical, dental, and vision insurance with 100% premium coverage",
        "Flexible paid time off (Unlimited PTO) and remote home-office stipend ($1,500)",
        "Annual professional development budget ($2,500/year)"
      ],
      keywords: ["Full-Stack", "React", "TypeScript", "Node.js", "PostgreSQL", "Cloud", "SaaS", "Microservices", "Docker", "AWS"],
      createdAt: new Date("2026-02-01T10:00:00Z").toISOString(),
      updatedAt: new Date("2026-02-01T10:00:00Z").toISOString(),
    };

    const job2: Job = {
      id: "job_ai_ml_02",
      title: "Lead AI / Machine Learning Engineer",
      department: "AI Research & Innovation",
      location: "New York, NY (Hybrid)",
      employmentType: "Full-time",
      experienceRequired: 4,
      salaryRange: "$175,000 - $225,000",
      status: "Active",
      description: "Join our core AI team building production LLM pipelines, intelligent retrieval-augmented generation (RAG) architectures, and fine-tuned embeddings. You will bridge cutting-edge research models like Gemini with production-grade backend infrastructure.",
      requiredSkills: ["Python", "PyTorch", "LLMs", "Vector Databases", "FastAPI", "Prompt Engineering"],
      preferredSkills: ["LangChain", "Docker", "Kubernetes", "Fine-tuning", "GCP Vertex AI", "Hugging Face"],
      technicalSkills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Pinecone", "Qdrant", "PostgreSQL pgvector", "Docker"],
      softSkills: ["Research-to-Production Mindset", "Cross-Functional Leadership", "Technical Writing"],
      educationRequirements: {
        degree: "Master's or Bachelor's Degree",
        fieldOfStudy: "Computer Science, AI, or Mathematics",
      },
      responsibilities: [
        "Design and deploy production-grade LLM architectures, agents, and semantic search systems.",
        "Benchmark, evaluate, and optimize inference latency, token efficiency, and model quality.",
        "Construct robust data ingestion and embedding pipelines using vector databases.",
        "Ensure algorithmic fairness, data privacy, and ethical guardrails across all AI systems."
      ],
      requirements: [
        "4+ years building and shipping applied machine learning and natural language processing applications.",
        "Deep familiarity with generative models, transformer architectures, and API orchestration.",
        "Expertise in Python, asynchronous frameworks (FastAPI/AsyncIO), and PyTorch.",
        "Experience measuring and improving embedding similarity and retrieval recall."
      ],
      benefits: [
        "Top-tier compensation and equity grants",
        "State-of-the-art compute resources and GPU clusters",
        "Full health, dental, and vision insurance",
        "Conference attendance and paper publishing support"
      ],
      keywords: ["AI", "Machine Learning", "LLM", "Python", "PyTorch", "FastAPI", "Vector Search", "Gemini", "RAG"],
      createdAt: new Date("2026-02-10T14:30:00Z").toISOString(),
      updatedAt: new Date("2026-02-10T14:30:00Z").toISOString(),
    };

    const job3: Job = {
      id: "job_devops_03",
      title: "DevOps & Cloud Infrastructure Lead",
      department: "Infrastructure & Security",
      location: "Remote (US / Canada)",
      employmentType: "Full-time",
      experienceRequired: 5,
      salaryRange: "$150,000 - $185,000",
      status: "Active",
      description: "We are hiring a Cloud DevOps Lead to spearhead our Kubernetes clusters, automated GitOps CI/CD pipelines, and multi-region AWS infrastructure while maintaining 99.99% uptime.",
      requiredSkills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker", "Linux"],
      preferredSkills: ["Prometheus", "Grafana", "Helm", "Go", "SOC2 Compliance"],
      technicalSkills: ["Kubernetes", "AWS EKS", "Terraform", "GitHub Actions", "Docker", "Bash", "Python", "Prometheus"],
      softSkills: ["Incident Response", "Documentation", "Team Mentorship"],
      educationRequirements: {
        degree: "Bachelor's Degree",
        fieldOfStudy: "Computer Science or Equivalent Experience",
      },
      responsibilities: [
        "Maintain and automate immutable infrastructure-as-code using Terraform and AWS.",
        "Manage production Kubernetes clusters with automated autoscaling and disaster recovery.",
        "Design zero-downtime CI/CD deployment pipelines using GitHub Actions.",
        "Implement end-to-end observability, alerting, and log aggregation."
      ],
      requirements: [
        "5+ years in DevOps, Site Reliability, or Cloud Infrastructure engineering.",
        "Hands-on expertise running production Kubernetes workloads at scale.",
        "Deep mastery of Terraform and AWS services (VPC, IAM, EKS, RDS, S3).",
        "Strong understanding of network security, TLS, and infrastructure hardening."
      ],
      benefits: [
        "Competitive salary + equity",
        "100% remote flexibility with home workspace allowance",
        "Premium health and dental insurance",
        "Cell phone and high-speed internet stipend"
      ],
      keywords: ["DevOps", "Kubernetes", "AWS", "Terraform", "Docker", "SRE", "Infrastructure", "CI/CD"],
      createdAt: new Date("2026-02-15T11:00:00Z").toISOString(),
      updatedAt: new Date("2026-02-15T11:00:00Z").toISOString(),
    };

    const job4: Job = {
      id: "job_pm_04",
      title: "Senior Product Manager - Enterprise Platform",
      department: "Product",
      location: "Austin, TX (Hybrid)",
      employmentType: "Full-time",
      experienceRequired: 4,
      salaryRange: "$140,000 - $175,000",
      status: "Active",
      description: "Drive product strategy and execution for our B2B SaaS workflow tools, translating customer insights and recruiter feedback into delight-driven feature roadmaps.",
      requiredSkills: ["Product Strategy", "User Research", "Agile / Scrum", "Data Analytics", "Roadmap Management"],
      preferredSkills: ["SQL", "Figma", "B2B SaaS Experience", "A/B Testing"],
      technicalSkills: ["Jira", "Mixpanel", "SQL", "Figma", "Amplitude"],
      softSkills: ["Stakeholder Management", "Executive Communication", "Customer Empathy"],
      educationRequirements: {
        degree: "Bachelor's Degree",
        fieldOfStudy: "Business, Engineering, or Design",
      },
      responsibilities: [
        "Lead product discovery through direct user interviews and behavioral data analysis.",
        "Collaborate closely with design and engineering leads to ship high-impact sprint increments.",
        "Define and track product OKRs, feature adoption metrics, and retention levers.",
        "Communicate product updates and release notes to executive leadership and enterprise clients."
      ],
      requirements: [
        "4+ years of product management experience shipping commercial B2B SaaS solutions.",
        "Proven ability to translate ambiguous customer problems into clear PRDs and user stories.",
        "Data-driven analytical mindset with proficiency analyzing metrics.",
        "Outstanding interpersonal, written, and verbal communication skills."
      ],
      benefits: [
        "Competitive salary and performance bonuses",
        "Comprehensive health benefits and wellness allowance",
        "401(k) match up to 5%",
        "Generous parental leave"
      ],
      keywords: ["Product Management", "B2B SaaS", "Roadmap", "Agile", "User Research", "Analytics"],
      createdAt: new Date("2026-02-20T09:15:00Z").toISOString(),
      updatedAt: new Date("2026-02-20T09:15:00Z").toISOString(),
    };

    this.jobs.push(job1, job2, job3, job4);

    // Seed Realistic Candidates
    const cand1: Candidate = {
      id: "cand_alex_chen",
      fullName: "Alex Rivera",
      email: "alex.rivera.dev@gmail.com",
      phone: "+1 (415) 890-2134",
      location: "San Francisco, CA",
      linkedin: "https://linkedin.com/in/alex-rivera-fullstack",
      github: "https://github.com/alexrivera-tech",
      portfolio: "https://alexrivera.dev",
      summary: "Full-Stack Software Engineer with 6 years of experience building performant web applications using React, TypeScript, Node.js, and PostgreSQL. Proven track record leading architectural migrations, optimizing microservices for high availability, and mentoring junior developers.",
      totalYearsExperience: 6,
      skills: {
        technical: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Docker", "AWS", "GraphQL", "Redis", "Tailwind CSS"],
        languages: ["English (Native)", "Spanish (Conversational)"],
        frameworksAndTools: ["Express", "Next.js", "Docker", "Jest", "Git", "GitHub Actions", "Vite", "Prisma"],
        softSkills: ["Mentorship", "System Design", "Agile Leadership", "Cross-Functional Collaboration"],
      },
      education: [
        {
          degree: "Bachelor of Science",
          institution: "University of California, Berkeley",
          fieldOfStudy: "Computer Science",
          graduationYear: "2020",
          gpaOrHonors: "3.85 Magna Cum Laude",
        },
      ],
      experience: [
        {
          company: "Apex Cloud Technologies",
          title: "Senior Full-Stack Engineer",
          location: "San Francisco, CA",
          startDate: "2022-03",
          endDate: "Present",
          durationYears: 4,
          responsibilities: [
            "Architected real-time analytics dashboard in React/TypeScript, cutting latency by 45%.",
            "Designed and implemented Node.js microservices processing 12M+ monthly REST transactions.",
            "Containerized legacy monolithic services with Docker and orchestrated deployment via AWS ECS.",
            "Mentored team of 4 engineers and instituted rigorous pull request and automated testing standards."
          ],
        },
        {
          company: "Nexus Digital Systems",
          title: "Software Engineer",
          location: "San Jose, CA",
          startDate: "2020-06",
          endDate: "2022-02",
          durationYears: 2,
          responsibilities: [
            "Built responsive React web interfaces and integrated REST APIs with PostgreSQL backend.",
            "Refactored relational schema and implemented Redis caching to optimize database queries.",
            "Wrote comprehensive unit and end-to-end tests using Jest and Playwright."
          ],
        },
      ],
      projects: [
        {
          name: "OpenPulse Real-Time Telemetry",
          description: "Open-source distributed metrics visualizer built with React, TypeScript, and Node.js WebSockets.",
          technologies: ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
          link: "https://github.com/alexrivera-tech/openpulse",
        },
        {
          name: "CloudScale CI Pipeline",
          description: "Automated container security scanner integrated into GitHub Actions.",
          technologies: ["Docker", "AWS", "Bash", "Python"],
        },
      ],
      certifications: [
        {
          name: "AWS Certified Solutions Architect – Associate",
          issuer: "Amazon Web Services",
          year: "2023",
        },
      ],
      rawResumeText: `ALEX RIVERA
Email: alex.rivera.dev@gmail.com | Phone: (415) 890-2134 | San Francisco, CA
LinkedIn: linkedin.com/in/alex-rivera-fullstack | GitHub: github.com/alexrivera-tech

PROFESSIONAL SUMMARY
Senior Full-Stack Software Engineer with 6 years of expertise building resilient, scalable web applications with React, TypeScript, Node.js, and PostgreSQL. Experienced in cloud microservices, Docker containerization, and AWS deployments.

TECHNICAL SKILLS
- Frontend: React, TypeScript, Next.js, Tailwind CSS, Redux Toolkit, Vite
- Backend: Node.js, Express, REST APIs, GraphQL, PostgreSQL, Redis, Prisma
- DevOps & Cloud: Docker, AWS (ECS, S3, RDS), GitHub Actions, CI/CD, Git
- Practices: System Architecture, Test-Driven Development (Jest), Agile/Scrum

EXPERIENCE
Apex Cloud Technologies — Senior Full-Stack Engineer (2022 - Present)
- Led frontend redesign in React and TypeScript, improving Core Web Vitals score by 35%.
- Scaled backend Node.js microservices handling 12M+ monthly API calls with 99.98% uptime.
- Transitioned on-prem monolith to containerized Docker services orchestrated on AWS.

Nexus Digital Systems — Software Engineer (2020 - 2022)
- Built interactive client portals and scalable CRUD endpoints using Node.js and PostgreSQL.
- Implemented Redis caching layers, accelerating frequently accessed queries by 60%.

EDUCATION
University of California, Berkeley — B.S. in Computer Science (2016 - 2020) | GPA: 3.85

CERTIFICATIONS
- AWS Certified Solutions Architect (2023)`,
      fileName: "Alex_Rivera_FullStack_Resume.pdf",
      fileType: "application/pdf",
      fileSize: 142000,
      createdAt: new Date("2026-02-12T09:00:00Z").toISOString(),
    };

    const cand2: Candidate = {
      id: "cand_priya_sharma",
      fullName: "Priya Sharma",
      email: "priya.sharma.ai@outlook.com",
      phone: "+1 (646) 430-8812",
      location: "New York, NY",
      linkedin: "https://linkedin.com/in/priya-sharma-ml",
      github: "https://github.com/priyasharma-ai",
      portfolio: "https://priyasharma.io",
      summary: "Machine Learning and AI Engineer with 5 years of research and production experience. Specializes in LLM fine-tuning, retrieval-augmented generation (RAG) pipelines, vector search optimization, and FastAPI microservice architecture.",
      totalYearsExperience: 5,
      skills: {
        technical: ["Python", "PyTorch", "LLMs", "Vector Databases", "FastAPI", "Prompt Engineering", "LangChain", "Docker", "GCP", "PostgreSQL"],
        languages: ["English", "Hindi"],
        frameworksAndTools: ["Hugging Face", "Qdrant", "Pinecone", "NumPy", "Pandas", "Scikit-Learn", "Docker", "Git"],
        softSkills: ["Applied Research", "Algorithmic Fairness", "Technical Leadership", "Problem Solving"],
      },
      education: [
        {
          degree: "Master of Science",
          institution: "Columbia University",
          fieldOfStudy: "Computer Science (Machine Learning Track)",
          graduationYear: "2021",
        },
        {
          degree: "Bachelor of Technology",
          institution: "Indian Institute of Technology (IIT) Delhi",
          fieldOfStudy: "Computer Science and Engineering",
          graduationYear: "2019",
        },
      ],
      experience: [
        {
          company: "Cognitive AI Labs",
          title: "Senior AI / ML Engineer",
          location: "New York, NY",
          startDate: "2022-07",
          endDate: "Present",
          durationYears: 3.5,
          responsibilities: [
            "Engineered enterprise semantic search platform integrating vector embeddings and hybrid BM25 search.",
            "Built and scaled FastAPI inference microservices with PyTorch models processing 500+ requests/sec.",
            "Implemented strict toxicity filtering and bias-mitigation pipelines for generative text systems.",
            "Reduced vector index query costs by 40% using quantization and intelligent caching."
          ],
        },
        {
          company: "DataVantage Research",
          title: "NLP Research Engineer",
          location: "New York, NY",
          startDate: "2021-01",
          endDate: "2022-06",
          durationYears: 1.5,
          responsibilities: [
            "Trained and evaluated transformer-based classification models for financial document parsing.",
            "Designed automated synthetic dataset generation workflows and quality evaluation metrics."
          ],
        },
      ],
      projects: [
        {
          name: "RAG-Eval Harness",
          description: "Open-source automated benchmark framework for evaluating semantic retrieval hallucination rates.",
          technologies: ["Python", "FastAPI", "Qdrant", "PyTorch", "Docker"],
        },
      ],
      certifications: [
        {
          name: "TensorFlow Certified Developer",
          issuer: "Google",
          year: "2022",
        },
      ],
      rawResumeText: `PRIYA SHARMA
New York, NY | priya.sharma.ai@outlook.com | (646) 430-8812
LinkedIn: linkedin.com/in/priya-sharma-ml | GitHub: github.com/priyasharma-ai

SUMMARY
Senior AI / Machine Learning Engineer with 5 years experience specializing in Large Language Models (LLMs), RAG pipelines, PyTorch, vector databases, and asynchronous FastAPI services.

CORE SKILLS
Python, PyTorch, FastAPI, Vector Databases (Qdrant, Pinecone), LLMs, LangChain, Transformers, Docker, Hugging Face, Semantic Search, PostgreSQL.

EXPERIENCE
Cognitive AI Labs — Senior AI / ML Engineer (2022 - Present)
- Designed enterprise semantic retrieval engine utilizing dense embeddings and hybrid search algorithms.
- Deployed asynchronous FastAPI inference services handling 500+ QPS with p99 latency <80ms.
- Built automated evaluation benchmarks for hallucination detection and bias guardrails.

DataVantage Research — NLP Research Engineer (2021 - 2022)
- Developed transformer-based named entity recognition and relation extraction pipelines.

EDUCATION
Columbia University — M.S. in Computer Science (Machine Learning Specialization), 2021
IIT Delhi — B.Tech. in Computer Science & Engineering, 2019`,
      fileName: "Priya_Sharma_AI_Resume.docx",
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 184000,
      createdAt: new Date("2026-02-14T11:00:00Z").toISOString(),
    };

    const cand3: Candidate = {
      id: "cand_marcus_vance",
      fullName: "Marcus Vance",
      email: "marcus.vance.cloud@gmail.com",
      phone: "+1 (206) 555-0199",
      location: "Seattle, WA",
      linkedin: "https://linkedin.com/in/marcusvance-devops",
      github: "https://github.com/mvance-infra",
      summary: "DevOps and Infrastructure Specialist with 7 years of deep cloud engineering experience. Expert in Kubernetes cluster orchestration, Terraform infrastructure-as-code, AWS architecture, and automated continuous delivery.",
      totalYearsExperience: 7,
      skills: {
        technical: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker", "Linux", "Prometheus", "Grafana", "Bash", "Python", "Go"],
        languages: ["English"],
        frameworksAndTools: ["Helm", "GitHub Actions", "ArgoCD", "AWS EKS", "Terraform Cloud", "Ansible"],
        softSkills: ["Incident Management", "Security Hardening", "Documentation", "Team Mentorship"],
      },
      education: [
        {
          degree: "Bachelor of Science",
          institution: "University of Washington",
          fieldOfStudy: "Informatics & Network Systems",
          graduationYear: "2019",
        },
      ],
      experience: [
        {
          company: "CloudVanguard Systems",
          title: "Principal DevOps Lead",
          location: "Seattle, WA (Remote)",
          startDate: "2021-08",
          endDate: "Present",
          durationYears: 4.5,
          responsibilities: [
            "Architected multi-region AWS EKS clusters hosting 180+ containerized microservices.",
            "Automated 100% of cloud provisioning via modular Terraform templates and GitOps with ArgoCD.",
            "Designed self-healing autoscaling rules, reducing monthly AWS compute spend by $38,000.",
            "Led incident response drill teams and maintained 99.995% service availability SLA."
          ],
        },
        {
          company: "AeroTech Solutions",
          title: "Cloud Infrastructure Engineer",
          location: "Seattle, WA",
          startDate: "2019-06",
          endDate: "2021-07",
          durationYears: 2,
          responsibilities: [
            "Built CI/CD pipelines in GitHub Actions, slashing build-and-test deployment time from 40m to 8m.",
            "Set up Prometheus and Grafana dashboards monitoring cluster memory, CPU, and network I/O."
          ],
        },
      ],
      projects: [
        {
          name: "Kube-Drainer Auto-Scaler",
          description: "Kubernetes operator for proactive node spot instance termination handling.",
          technologies: ["Go", "Kubernetes", "AWS", "Docker"],
        },
      ],
      certifications: [
        {
          name: "Certified Kubernetes Administrator (CKA)",
          issuer: "Linux Foundation / CNCF",
          year: "2023",
        },
        {
          name: "AWS Certified DevOps Engineer – Professional",
          issuer: "Amazon Web Services",
          year: "2022",
        },
      ],
      rawResumeText: `MARCUS VANCE
Seattle, WA | marcus.vance.cloud@gmail.com | (206) 555-0199
LinkedIn: linkedin.com/in/marcusvance-devops | GitHub: github.com/mvance-infra

SUMMARY
Cloud Infrastructure and DevOps Engineer with 7 years of experience specializing in Kubernetes, Terraform, AWS, and GitOps CI/CD automation.

SKILLS
Kubernetes, AWS, Terraform, Docker, CI/CD, Helm, ArgoCD, Prometheus, Grafana, Linux, Bash, Go, Python.

EXPERIENCE
CloudVanguard Systems — Principal DevOps Lead (2021 - Present)
- Designed and operated multi-cluster AWS EKS infrastructure with automated failover and 99.995% uptime.
- Codified enterprise cloud landing zones in Terraform, enforcing security policies via OPA Gatekeeper.
- Reduced cloud infrastructure expenditure by 28% through rightsizing and Spot instances.

AeroTech Solutions — Cloud Infrastructure Engineer (2019 - 2021)
- Spearheaded migration from legacy VMs to Docker containers and automated CI/CD pipelines.

EDUCATION
University of Washington — B.S. in Informatics (2019)

CERTIFICATIONS
- Certified Kubernetes Administrator (CKA)
- AWS Certified DevOps Engineer Professional`,
      fileName: "Marcus_Vance_DevOps_Resume.pdf",
      fileType: "application/pdf",
      fileSize: 165000,
      createdAt: new Date("2026-02-18T10:00:00Z").toISOString(),
    };

    const cand4: Candidate = {
      id: "cand_elena_rostova",
      fullName: "Elena Rostova",
      email: "elena.rostova.pm@gmail.com",
      phone: "+1 (512) 809-3321",
      location: "Austin, TX",
      linkedin: "https://linkedin.com/in/elena-rostova-pm",
      summary: "Senior B2B SaaS Product Manager with 5 years leading cross-functional teams in agile discovery, user research, data analytics, and product strategy. Champion of customer-centric development and rapid feature validation.",
      totalYearsExperience: 5,
      skills: {
        technical: ["Product Strategy", "User Research", "Agile / Scrum", "Data Analytics", "Roadmap Management", "SQL", "Figma"],
        languages: ["English", "French"],
        frameworksAndTools: ["Jira", "Mixpanel", "Amplitude", "Figma", "Confluence", "PostgreSQL (Queries)"],
        softSkills: ["Stakeholder Management", "Executive Presentation", "Customer Empathy", "Negotiation"],
      },
      education: [
        {
          degree: "Bachelor of Business Administration (BBA)",
          institution: "University of Texas at Austin",
          fieldOfStudy: "Management Information Systems (MIS)",
          graduationYear: "2020",
        },
      ],
      experience: [
        {
          company: "Stratum Cloud ERP",
          title: "Senior Product Manager",
          location: "Austin, TX",
          startDate: "2022-04",
          endDate: "Present",
          durationYears: 3.8,
          responsibilities: [
            "Spearheaded core workflow automation product line contributing $4.2M in annual recurring revenue.",
            "Conducted 120+ customer discovery interviews and synthesized actionable PRDs and user journey maps.",
            "Formulated product roadmap and partnered with 14 engineers across dual sprint teams."
          ],
        },
      ],
      projects: [
        {
          name: "Workflow Self-Serve Builder",
          description: "No-code enterprise rule engine that increased onboarding conversion by 32%.",
          technologies: ["Product Discovery", "SQL Analytics", "Figma", "User Testing"],
        },
      ],
      certifications: [
        {
          name: "Certified Scrum Product Owner (CSPO)",
          issuer: "Scrum Alliance",
          year: "2021",
        },
      ],
      rawResumeText: `ELENA ROSTOVA
Austin, TX | elena.rostova.pm@gmail.com | (512) 809-3321
LinkedIn: linkedin.com/in/elena-rostova-pm

SUMMARY
Senior Product Manager with 5 years experience scaling B2B SaaS applications, driving user discovery, analyzing funnel metrics in SQL and Mixpanel, and collaborating with cross-functional agile teams.

SKILLS
Product Strategy, User Research, Agile/Scrum, Data Analytics, Roadmapping, SQL, Mixpanel, Figma, Jira.

EXPERIENCE
Stratum Cloud ERP — Senior Product Manager (2022 - Present)
- Managed core enterprise automation product used by 250+ enterprise accounts.
- Increased user retention by 24% after overhaul of automated onboarding flow.
- Wrote clear user stories, defined acceptance criteria, and managed sprint prioritization.

EDUCATION
University of Texas at Austin — BBA in Management Information Systems, 2020`,
      fileName: "Elena_Rostova_Product_Manager.pdf",
      fileType: "application/pdf",
      fileSize: 139000,
      createdAt: new Date("2026-02-22T13:00:00Z").toISOString(),
    };

    const cand5: Candidate = {
      id: "cand_david_kim",
      fullName: "David Kim",
      email: "david.kim.code@gmail.com",
      phone: "+1 (408) 772-9104",
      location: "San Jose, CA",
      linkedin: "https://linkedin.com/in/david-kim-web",
      github: "https://github.com/dkim-web",
      summary: "Junior Software Developer with 2 years of experience specializing in React and JavaScript frontend components. Eager to expand full-stack capabilities into TypeScript, backend services, and cloud deployments.",
      totalYearsExperience: 2,
      skills: {
        technical: ["React", "JavaScript", "HTML", "CSS", "REST APIs", "Git", "Tailwind CSS"],
        languages: ["English", "Korean"],
        frameworksAndTools: ["React", "Vite", "Node.js (Basics)", "Express (Basics)", "Git"],
        softSkills: ["Fast Learner", "Enthusiasm", "Team Player", "Attention to Detail"],
      },
      education: [
        {
          degree: "Bachelor of Arts",
          institution: "San Jose State University",
          fieldOfStudy: "Digital Media & Web Programming",
          graduationYear: "2023",
        },
      ],
      experience: [
        {
          company: "PixelCraft Agency",
          title: "Associate Frontend Developer",
          location: "San Jose, CA",
          startDate: "2023-07",
          endDate: "Present",
          durationYears: 2,
          responsibilities: [
            "Built dynamic frontend components in React and CSS for client e-commerce websites.",
            "Integrated third-party REST endpoints and handled UI form validation.",
            "Participated in daily standups and code reviews."
          ],
        },
      ],
      projects: [
        {
          name: "TaskTrack Web App",
          description: "Personal productivity web app built with React, Tailwind, and local storage.",
          technologies: ["React", "JavaScript", "Tailwind CSS"],
        },
      ],
      certifications: [],
      rawResumeText: `DAVID KIM
San Jose, CA | david.kim.code@gmail.com | (408) 772-9104
LinkedIn: linkedin.com/in/david-kim-web | GitHub: github.com/dkim-web

SUMMARY
Associate Web Developer with 2 years practical experience building clean, responsive interfaces with React, JavaScript, and Tailwind CSS.

SKILLS
React, JavaScript, HTML5, CSS3, Tailwind CSS, Git, Basic Node.js, REST APIs.

EXPERIENCE
PixelCraft Agency — Associate Frontend Developer (2023 - Present)
- Developed responsive marketing sites and customer dashboards using React.
- Connected client UI to backend APIs and implemented data validation checks.

EDUCATION
San Jose State University — B.A. in Digital Media (2023)`,
      fileName: "David_Kim_Resume.pdf",
      fileType: "application/pdf",
      fileSize: 112000,
      createdAt: new Date("2026-02-24T14:00:00Z").toISOString(),
    };

    this.candidates.push(cand1, cand2, cand3, cand4, cand5);

    // Seed Applications with Explainable Match Scores
    // Application 1: Alex Rivera applied to Senior Full-Stack Engineer (Strong match: 94%)
    this.applications.push({
      id: "app_alex_fullstack",
      candidateId: cand1.id,
      jobId: job1.id,
      status: "Shortlisted",
      matchScore: 94,
      matchResult: {
        overallScore: 94,
        breakdown: {
          skillsMatchScore: 96,
          experienceMatchScore: 95,
          educationMatchScore: 92,
          semanticRelevanceScore: 93,
        },
        matchedRequiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Docker"],
        missingRequiredSkills: [],
        matchedPreferredSkills: ["AWS", "Tailwind CSS", "Redis", "CI/CD pipelines"],
        missingPreferredSkills: ["GraphQL"],
        strengths: [
          "100% coverage of mandatory core skills (React, TypeScript, Node.js, PostgreSQL, Docker).",
          "6 years of verified production experience exceeds the 5-year requirement.",
          "Demonstrated microservice scaling (12M+ monthly API calls) and AWS ECS containerization.",
          "Strong computer science fundamentals from UC Berkeley (3.85 GPA).",
        ],
        potentialGaps: [
          "Resume lists GraphQL familiarity but fewer public production metrics compared to REST.",
        ],
        interviewQuestions: [
          "How did you structure the transition from the legacy monolith to Docker containers on AWS ECS?",
          "Can you walk through your PostgreSQL schema optimization and Redis caching strategy that cut latency by 45%?",
          "How do you approach type safety and code sharing between React frontends and Node.js backends in TypeScript?",
        ],
        executiveSummary: "Alex Rivera is an exceptional candidate for the Senior Full-Stack Engineer role, presenting a 94% composite alignment across all technical criteria, architecture requirements, and cloud infrastructure experience.",
        fairnessAuditNotes: "Evaluation based purely on declared technical proficiencies, verifiable work milestones, and documented experience duration. No protected demographic criteria evaluated.",
      },
      recruiterNotes: "Top recommendation from initial automated screening. Scheduling technical design phone screen.",
      appliedDate: "2026-02-12T10:30:00Z",
      updatedDate: "2026-02-15T16:00:00Z",
    });

    // Application 2: David Kim applied to Senior Full-Stack Engineer (Junior / Moderate match: 58%)
    this.applications.push({
      id: "app_david_fullstack",
      candidateId: cand5.id,
      jobId: job1.id,
      status: "Screened",
      matchScore: 58,
      matchResult: {
        overallScore: 58,
        breakdown: {
          skillsMatchScore: 50,
          experienceMatchScore: 40,
          educationMatchScore: 75,
          semanticRelevanceScore: 65,
        },
        matchedRequiredSkills: ["React", "REST APIs"],
        missingRequiredSkills: ["TypeScript", "Node.js", "PostgreSQL", "Docker"],
        matchedPreferredSkills: ["Tailwind CSS"],
        missingPreferredSkills: ["GraphQL", "AWS", "Redis", "CI/CD pipelines"],
        strengths: [
          "Hands-on experience with modern React components and UI development.",
          "Clear enthusiasm for software engineering and responsive web interfaces.",
        ],
        potentialGaps: [
          "Only 2 years of professional experience vs 5 years required for this Senior level role.",
          "Missing core mandatory backend skills: PostgreSQL, Docker containerization, and advanced TypeScript.",
        ],
        interviewQuestions: [
          "What experience do you have with TypeScript or backend Node.js APIs in personal or team projects?",
          "How would you approach learning Docker containerization and relational database design?",
        ],
        executiveSummary: "David Kim demonstrates solid foundational frontend React skills but lacks the requisite 5+ years of senior full-stack backend and distributed systems experience required for this vacancy.",
        fairnessAuditNotes: "Objective qualification assessment based on missing mandatory requirements and seniority thresholds.",
      },
      recruiterNotes: "Good profile for an Associate or Junior Frontend position, but underqualified for the Senior Full-Stack vacancy.",
      appliedDate: "2026-02-24T15:20:00Z",
      updatedDate: "2026-02-25T11:00:00Z",
    });

    // Application 3: Priya Sharma applied to Lead AI / ML Engineer (Strong match: 96%)
    this.applications.push({
      id: "app_priya_aiml",
      candidateId: cand2.id,
      jobId: job2.id,
      status: "Interview",
      matchScore: 96,
      matchResult: {
        overallScore: 96,
        breakdown: {
          skillsMatchScore: 98,
          experienceMatchScore: 95,
          educationMatchScore: 96,
          semanticRelevanceScore: 95,
        },
        matchedRequiredSkills: ["Python", "PyTorch", "LLMs", "Vector Databases", "FastAPI", "Prompt Engineering"],
        missingRequiredSkills: [],
        matchedPreferredSkills: ["LangChain", "Docker", "Hugging Face"],
        missingPreferredSkills: ["Kubernetes", "GCP Vertex AI"],
        strengths: [
          "Exceptional alignment with core AI stack: PyTorch, Qdrant, Pinecone, FastAPI, and generative LLMs.",
          "5 years of specialized NLP and LLM production experience exceeding the 4-year requirement.",
          "Master of Science from Columbia University with focus on Machine Learning.",
          "High throughput production deployments (500+ QPS, <80ms p99 latency).",
        ],
        potentialGaps: [
          "Minimal mention of large-scale Kubernetes cluster management; primarily worked with Docker/FastAPI.",
        ],
        interviewQuestions: [
          "How did you structure your vector database indexing (Qdrant/Pinecone) to minimize latency while maintaining high semantic recall?",
          "Can you discuss your hallucination detection benchmarks and automated bias guardrail implementations?",
        ],
        executiveSummary: "Priya Sharma is an outstanding top-percentile match for the Lead AI/ML Engineer role, exhibiting direct mastery over generative models, vector search, and high-performance inference APIs.",
        fairnessAuditNotes: "Strict meritocratic assessment of AI engineering competency, published accomplishments, and educational alignment.",
      },
      recruiterNotes: "Interview stage scheduled. Hiring manager highly enthusiastic about her production RAG and vector database background.",
      appliedDate: "2026-02-14T12:00:00Z",
      updatedDate: "2026-02-26T09:30:00Z",
    });

    // Application 4: Marcus Vance applied to DevOps & Cloud Infrastructure Lead (Strong match: 95%)
    this.applications.push({
      id: "app_marcus_devops",
      candidateId: cand3.id,
      jobId: job3.id,
      status: "Shortlisted",
      matchScore: 95,
      matchResult: {
        overallScore: 95,
        breakdown: {
          skillsMatchScore: 98,
          experienceMatchScore: 96,
          educationMatchScore: 90,
          semanticRelevanceScore: 96,
        },
        matchedRequiredSkills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker", "Linux"],
        missingRequiredSkills: [],
        matchedPreferredSkills: ["Prometheus", "Grafana", "Helm", "Go"],
        missingPreferredSkills: ["SOC2 Compliance"],
        strengths: [
          "7 years of proven cloud infrastructure and DevOps experience (5 required).",
          "Certified Kubernetes Administrator (CKA) and AWS Certified DevOps Engineer Professional.",
          "Multi-cluster AWS EKS experience with 99.995% uptime track record.",
          "Deep Terraform and GitOps pipeline automation experience.",
        ],
        potentialGaps: [
          "Formal SOC2 compliance audit leadership could be probed during the interview.",
        ],
        interviewQuestions: [
          "How do you handle automated multi-cluster disaster recovery and stateful workloads in AWS EKS?",
          "Could you explain your cost reduction strategy with Kubernetes Spot instances?",
        ],
        executiveSummary: "Marcus Vance is a premier fit for the DevOps Lead position, holding both top cloud credentials and verifiable large-scale Kubernetes track record.",
        fairnessAuditNotes: "Grounded strictly in verified cloud engineering track record, infrastructure certifications, and technical deliverables.",
      },
      recruiterNotes: "Screened and shortlisted. Excellent technical background and dual CKA/AWS certifications.",
      appliedDate: "2026-02-18T11:45:00Z",
      updatedDate: "2026-02-20T14:15:00Z",
    });

    // Application 5: Elena Rostova applied to Senior Product Manager (Strong match: 91%)
    this.applications.push({
      id: "app_elena_pm",
      candidateId: cand4.id,
      jobId: job4.id,
      status: "Interview",
      matchScore: 91,
      matchResult: {
        overallScore: 91,
        breakdown: {
          skillsMatchScore: 94,
          experienceMatchScore: 92,
          educationMatchScore: 88,
          semanticRelevanceScore: 90,
        },
        matchedRequiredSkills: ["Product Strategy", "User Research", "Agile / Scrum", "Data Analytics", "Roadmap Management"],
        missingRequiredSkills: [],
        matchedPreferredSkills: ["SQL", "Figma", "B2B SaaS Experience"],
        missingPreferredSkills: ["A/B Testing"],
        strengths: [
          "5 years of dedicated B2B SaaS product management experience exceeding 4-year requirement.",
          "Direct revenue impact ($4.2M ARR product line) and customer discovery rigour (120+ interviews).",
          "Certified Scrum Product Owner (CSPO) with data querying skills in SQL.",
        ],
        potentialGaps: [
          "Large scale statistical A/B testing was less prominent in portfolio compared to qualitative discovery.",
        ],
        interviewQuestions: [
          "How do you balance quantitative SQL funnel data with qualitative user discovery interviews when prioritizing the roadmap?",
          "Can you walk us through a time you had to sunset or pivot a feature that wasn't hitting adoption targets?",
        ],
        executiveSummary: "Elena Rostova is an experienced B2B SaaS Product Manager with proven cross-functional delivery and measurable business outcomes.",
        fairnessAuditNotes: "Evaluated on documented product management accomplishments, analytical acumen, and agile methodology proficiency.",
      },
      recruiterNotes: "Initial screening completed. Scheduled for panel interview with Head of Product.",
      appliedDate: "2026-02-22T14:10:00Z",
      updatedDate: "2026-02-27T10:00:00Z",
    });

    // Application 6: Alex Rivera applied to Lead AI/ML (Domain Cross-match: 64%)
    this.applications.push({
      id: "app_alex_aiml",
      candidateId: cand1.id,
      jobId: job2.id,
      status: "Applied",
      matchScore: 64,
      matchResult: {
        overallScore: 64,
        breakdown: {
          skillsMatchScore: 55,
          experienceMatchScore: 85,
          educationMatchScore: 90,
          semanticRelevanceScore: 60,
        },
        matchedRequiredSkills: ["Docker"],
        missingRequiredSkills: ["Python", "PyTorch", "LLMs", "Vector Databases", "FastAPI", "Prompt Engineering"],
        matchedPreferredSkills: ["CI/CD pipelines"],
        missingPreferredSkills: ["LangChain", "Fine-tuning", "GCP Vertex AI", "Hugging Face"],
        strengths: [
          "Strong general engineering background, system design, and distributed systems experience.",
          "Solid cloud and container proficiency.",
        ],
        potentialGaps: [
          "Candidate is primarily a TypeScript/React/Node full-stack engineer; lacks hands-on deep learning, PyTorch, and NLP modeling experience.",
        ],
        interviewQuestions: [
          "Have you built or integrated with LLM APIs in previous full-stack applications?",
          "How do you envision bridging your full-stack expertise with machine learning infrastructure?",
        ],
        executiveSummary: "Alex has strong general engineering competencies but lacks specific PyTorch and AI/ML model engineering background for a Lead AI role.",
        fairnessAuditNotes: "Objective skills overlap comparison against core AI specialization requirements.",
      },
      recruiterNotes: "Cross-applied. Candidate is much better suited for the Senior Full-Stack Engineer opening.",
      appliedDate: "2026-02-23T11:00:00Z",
      updatedDate: "2026-02-23T11:00:00Z",
    });
  }

  // Helper to recompute candidate counts
  syncCandidateCounts() {
    for (const job of this.jobs) {
      job.candidateCount = this.applications.filter((a) => a.jobId === job.id).length;
    }
  }
}

export const db = new DatabaseStore();
db.syncCandidateCounts();
