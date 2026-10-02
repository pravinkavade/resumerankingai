# TalentRank AI - AI-Powered Resume Screening & Candidate Ranking System

TalentRank AI is an enterprise-grade AI-powered recruitment and candidate ranking platform. Built for modern talent acquisition teams, it automates resume parsing, analyzes job descriptions, extracts competencies, and semantically matches candidates against job requirements using Google Gemini LLMs while enforcing strict ethical and anti-bias guardrails.

---

## 🌟 Key Capabilities

1. **Recruiter Authentication & RBAC**:
   - Secure registration, login, and JWT bearer authentication.
   - Recruiter role permissions, extensible to Admin roles.
   - Built-in 1-Click Demo Recruiter profile (`recruiter@talentrank.ai` / `password123`).

2. **Job Description Management & AI Extraction**:
   - Create, edit, filter, and archive jobs with departments, locations, and salary bands.
   - **Gemini 3.8 Flash JD Intelligence**: Automatically analyzes job descriptions to extract mandatory required skills, preferred skills, technical proficiencies, soft skills, seniority thresholds, responsibilities, and semantic search keywords.

3. **Multimodal Resume Ingestion & Parsing**:
   - Support for **PDF**, **Word (.docx)**, **Plain Text (.txt)**, and **Markdown (.md)**.
   - Batch upload queue with real-time status indicators.
   - LLM-powered extraction: Candidate contact details, professional summary, structured work experience timeline, academic degrees, personal projects, and industry certifications.
   - Pre-loaded sample candidate library for instant testing.

4. **Explainable Semantic Matching & Ranking**:
   - **Composite Assistive Score (0 - 100%)**:
     - **Skills Match (40%)**: Mandatory required skills coverage and preferred bonuses.
     - **Experience Seniority (25%)**: Verified years and role title alignment.
     - **Education & Credentials (15%)**: Academic degree and certifications.
     - **Semantic Context Relevance (20%)**: Deep embedding language similarity.
   - **Explainable Reasoning**: Detailed candidate strengths, potential gap areas, and AI-tailored competency interview questions for human recruiters.
   - **Interactive Skills Matrix**: Visual badges contrasting matched vs missing required skills.

5. **Recruiter Analytics & Business Intelligence**:
   - **Candidates per Job** (volume & average scores).
   - **Pipeline Funnel Distribution** (Applied, Screened, Shortlisted, Interview, Offer, Rejected).
   - **Match Score Distribution Histogram** (quality density index).
   - **Top Talent Skills Supply** (market inventory frequency chart).

6. **Anti-Bias & Ethical AI Constitution**:
   - **100% Assistive**: Algorithms never make autonomous hiring or rejection decisions; recruiters retain full decision autonomy.
   - **Strict Protected Attribute Exclusion**: Prohibits consideration or inference of race, ethnicity, religion, gender, age, disability, marital status, or nationality in accordance with EEOC, Title VII, and NYC Local Law 144 standards.

---

## 🏗️ Technology Architecture

- **Frontend**:
  - React 19, TypeScript, Vite
  - Tailwind CSS
  - Recharts for data visualizations
  - Lucide React icons
- **Backend & API**:
  - Node.js & Express RESTful API engine (with full Python FastAPI / Pydantic / SQLAlchemy architecture compatibility)
  - JWT Authentication (`jsonwebtoken`, `bcryptjs`)
  - Document extractors (`pdf-parse`, `mammoth`)
- **AI Engine**:
  - `@google/genai` TypeScript SDK (User-Agent telemetry: `aistudio-build`)
  - Model: `gemini-3.8-flash` for structured JSON extraction and semantic matching
- **Infrastructure**:
  - Docker & Docker Compose
  - PostgreSQL container database

---

## ⚙️ Environment Variables Configuration

Create a `.env` file based on `.env.example`:

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# DATABASE_URL: PostgreSQL connection string
DATABASE_URL="postgresql://talentrank_user:talentrank_password@localhost:5432/talentrank_db"

# JWT_SECRET_KEY: Secret key used to sign and verify recruiter JWT tokens
JWT_SECRET_KEY="your-secure-random-jwt-secret-key"

# APP_URL: The URL where the app is hosted
APP_URL="http://localhost:3000"
```

> **Security Note**: Never commit API keys or secret tokens to version control. Keys are read securely from server-side environment variables.

---

## 🚀 Running the Application

### Option A: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Express API + Vite on port 3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Docker Compose Deployment

```bash
# Build and run PostgreSQL and Application containers
docker-compose up --build
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new recruiter account |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `POST` | `/api/auth/demo-login` | 1-click demo recruiter authentication |
| `GET` | `/api/auth/me` | Fetch authenticated recruiter profile |
| `GET` | `/api/jobs` | List jobs with candidate counts and status filters |
| `POST` | `/api/jobs` | Create a new job opening |
| `POST` | `/api/jobs/analyze` | Analyze job description using Gemini AI |
| `GET` | `/api/jobs/:id` | Get job details and ranked candidates |
| `PATCH` | `/api/jobs/:id/status` | Update job status (`Active`, `Draft`, `Closed`, `Archived`) |
| `DELETE` | `/api/jobs/:id` | Delete job and associated applications |
| `GET` | `/api/candidates` | List candidates with filters, ranking, and search |
| `GET` | `/api/candidates/:id` | Get candidate profile, applications, and extracted resume |
| `POST` | `/api/candidates/upload` | Upload resume file (PDF/DOCX/TXT) or text for LLM parsing & job match |
| `PATCH` | `/api/applications/:id/status` | Advance application pipeline stage |
| `PATCH` | `/api/applications/:id/notes` | Update recruiter evaluation notes |
| `POST` | `/api/match/evaluate` | Re-evaluate candidate against target job |
| `GET` | `/api/analytics` | Fetch recruitment metrics, charts, and skill distributions |
| `GET` | `/api/health` | Service diagnostics and Gemini status |

---

## ⚖️ Ethical AI Compliance

TalentRank AI is designed in compliance with the **Uniform Guidelines on Employee Selection Procedures (EEOC)** and the **EU Artificial Intelligence Act (High-Risk AI Systems)**:
- Transparent scoring formulas without black-box decisions.
- Complete explainability with strengths, gaps, and tailored interview probes.
- Zero extraction or storage of demographic attributes.
