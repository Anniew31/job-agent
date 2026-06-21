Job Agent

An AI-powered job application assistant that scrapes listings, scores them against your profile, lets you review matches by swiping through them, and generates a tailored resume and cover letter for every job you accept.

Live demo → (link coming soon)


What it does

Most job search tools stop at "here's a list of jobs." Job Agent goes further — it builds a full pipeline from discovery to application:


Scrape — pulls job listings matching your target roles via the JSearch API
Score — an LLM reads each job description and scores it 1–10 against your profile, automatically filtering out jobs that violate your deal-breakers (salary floor, required experience, role type)
Review — swipe through scored matches like a deck of cards; accept or pass on each one
Tailor — for every job you accept, an LLM rewrites your resume bullets to mirror the job description's language and drafts a personalized cover letter — grounded entirely in your real experience, no fabrication
Track — a dashboard shows your full pipeline with stats, and an applications page tracks outcomes (interviewing, offered, rejected, ghosted) after you submit

Tech stack

Backend

FastAPI — REST API with JWT authentication
PostgreSQL (Neon) — multi-user data store
Google Gemini — structured LLM scoring and document tailoring (Pydantic schema-enforced JSON output)
JSearch API — job listing aggregation
WeasyPrint + Jinja2 — HTML → PDF generation for resumes and cover letters, rendered on demand from live-edited text


Frontend

Next.js (App Router) + TypeScript
Client-side state management with React hooks


Architecture

Scrape → Score → Review (swipe) → Tailor → Track
  │         │           │              │        │
  │         │           │              │        └─ Applications dashboard
  │         │           │              └─ AI resume + cover letter generation
  │         │           └─ Accept/reject UI, updates job status
  │         └─ LLM scores job fit, auto-rejects below threshold
  └─ JSearch API pulls listings per target role

Every stage is its own page and its own API endpoint, backed by a jobs table that tracks status through the full pipeline: pending → reviewed → accepted → tailored → applied, with rejected and ghosted as terminal states.