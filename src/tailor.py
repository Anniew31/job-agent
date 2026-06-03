import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from database import fetch_jobs_by_status, update_job_output
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from typing import Optional
from datetime import date

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class TailoredSection(BaseModel):
    identifier: str = Field(description="Exact company or project name")
    bullets: list[str] = Field(description="2-3 tailored bullet points")
    tech_stack: Optional[str] = Field(default=None, description="For projects only — comma separated tech e.g. 'Python, React, PostgreSQL'")

class TailoredResumeSchema(BaseModel):
    experiences: list[TailoredSection] = Field(description="List of tailored work experiences.")
    projects: list[TailoredSection] = Field(description="List of tailored projects.")

class CoverLetterSchema(BaseModel):
    cover_letter: str

# formats experience nicely to give to llm
def format_experience(experience: list) -> str:
    entries = []
    for job in experience:
        end = job.get("end_date") if job.get("end_date") else "present"
        header = f"{job['company']} — {job['position']} ({job['start_date']} - {end})"
        bullets = "\n".join([f"• {b}" for b in job["bullets"]])
        entry = header + "\n" + bullets
        entries.append(entry)
    return "\n\n".join(entries)

# formats projects nicely for prompting
def format_projects(projects: list) -> str:
    entries = []
    for job in projects:
        bullets = "\n".join([f"•{b}" for b in job["bullets"]])
        entry = job["name"] + "\n" + bullets 
        entries.append(entry)
    return "\n\n".join(entries)

# tailors resume to job description
def tailor_resume(profile: dict, job: dict) -> dict | None:
    experience_str = format_experience(profile.get("experience", []))
    project_str = format_projects(profile.get("projects", []))

    exp_identifiers = [exp["company"] for exp in profile.get("experience", [])]
    proj_identifiers = [proj["name"] for proj in profile.get("projects", [])]
    
    prompt = f"""
    You are a resume writing assistant helping a candidate tailor their resume bullets for a specific job.

    CANDIDATE'S EXISTING EXPERIENCE:
    {experience_str}

    CANDIDATE'S PROJECTS:
    {project_str}

    JOB THEY ARE APPLYING TO:
    Title: {job.get("title")}
    Company: {job.get("company")}
    Description: {job.get("description", "")[:3000]}

    INSTRUCTIONS:
    - Rewrite the candidate's existing bullets to mirror the language and keywords in the job description
    - Do NOT invent new experience or skills
    - Do NOT change the core facts — only reframe how they are described
    - Use strong action verbs
    - Keep each bullet concise, one sentence
    - Return 2 to 3 bullets for each experience
    - Prioritize bullets most relevant to this specific job
    - Make sure that total output is about 15 bullets

    CRITICAL STRUCTURE CONSTRAINT:
    In your JSON output response, you must use the EXACT identifier tags listed below for the 'identifier' fields:
    - Allowed Experience Identifiers: {json.dumps(exp_identifiers)}
    - Allowed Project Identifiers: {json.dumps(proj_identifiers)}
    """
    
    max_retries = 3
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=TailoredResumeSchema,
                ),
            )
            data = json.loads(response.text)
            return data
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower() or "SSL" in str(e):
                print(f"⚠️ Rate limit hit, waiting {retry_delay}s (attempt {attempt + 1}/{max_retries})...")
                import time
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                print(f"tailor_resume failed: {e}")
                return None
    return None

# generates cover letter based on candidate's profile and job description
def write_cover_letter(profile: dict, job: dict) -> str | None:
    experience_str = format_experience(profile.get("experience", []))
    project_str = format_projects(profile.get("projects", []))
    
    prompt = f"""
    You are a cover letter writing assistant helping a candidate apply for a job.

    CANDIDATE PROFILE:
    Name: {profile["name"]}
    Positioning: {profile["positioning"]}
    Skills: {", ".join(profile["skills"])}
    Experience:
    {experience_str}
    Projects:
    {project_str}

    JOB THEY ARE APPLYING TO:
    Title: {job.get("title")}
    Company: {job.get("company")}
    Location: {job.get("location")}
    Description: {job.get("description", "")[:3000]}

    INSTRUCTIONS:
    Write a page long cover letter structured exactly as follows:
    - Paragraph 1: Who the candidate is and why they are excited about this specific role and company
    - Paragraph 2: Their most relevant experience and skills for this role, using specific examples
    - Paragraph 3: A confident closing expressing interest in next steps
    - Do not use generic filler phrases like "I am writing to express my interest"
    - Write in first person, professional but warm tone
    - Address it to the hiring team if no specific name is available
    - Do not include a subject line or date, just the letter body
    - Make sure that it is about slighly more than three-fourths of a page
    """
    
    max_retries = 3
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CoverLetterSchema,
                ),
            )
            data = json.loads(response.text)
            return data.get("cover_letter")
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower() or "SSL" in str(e):
                print(f"⚠️ Rate limit hit, waiting {retry_delay}s (attempt {attempt + 1}/{max_retries})...")
                import time
                time.sleep(retry_delay)
                retry_delay *= 2
                continue
            else:
                print(f"write_cover_letter failed: {e}")
                return None
    return None

# saves outupt into seperate files and returns file paths
def save_output(job: dict, tailored_data:dict, tailored_letter: str, profile: dict) -> tuple[str, str]:
    company = job["company"].replace(" ", "_").replace("/", "_")
    title = job["title"].replace(" ", "_").replace("/", "_")
    
    folder = os.path.join("output", f"{company}_{title}")
    os.makedirs(folder, exist_ok=True)
    
    resume_path = os.path.join(folder, "resume.pdf")
    generate_resume_pdf(profile, tailored_data, resume_path)
    
    cover_letter_path = os.path.join(folder, "cover_letter.pdf")
    generate_cover_pdf(profile, tailored_letter, cover_letter_path, job["company"], job["title"])
    
    return resume_path, cover_letter_path

# generates the pdf of the cover letter
def generate_cover_pdf(profile: dict, tailored_letter: str, output_path: str, company: str, role: str):

    # load and render template
    env = Environment(loader=FileSystemLoader("src/templates"))
    template = env.get_template("cover_letter.html")

    html_str = template.render(
        name=profile["name"],
        phone=profile.get("phone"),
        email=profile.get("email"),
        date=date.today().strftime("%B %d, %Y"),
        company = company,
        job_title = role,
        cover_letter_body = tailored_letter
    )

    # convert rendered HTML to PDF
    HTML(string=html_str).write_pdf(output_path)

# generates the pdf of the resume
def generate_resume_pdf(profile: dict, tailored_data: dict, output_path: str):
    exp_lookup = {
        item["identifier"]: item["bullets"]
        for item in tailored_data.get("experiences", [])
    }

    proj_lookup = {
    item["identifier"]: {
        "bullets": item["bullets"],
        "tech_stack": item.get("tech_stack")
    }
    for item in tailored_data.get("projects", [])
}

    experiences = []
    for exp in profile.get("experience", []):
        experiences.append({
            **exp,
            "bullets": exp_lookup.get(exp["company"], exp.get("bullets", [])),
            "end_date": exp.get("end_date") or "Present"
        })

    projects = []
    for proj in profile.get("projects", []):
        name = proj["name"]
        looked_up = proj_lookup.get(name, {})
        projects.append({
            **proj,
            "bullets": looked_up.get("bullets", proj.get("bullets", [])),
            "tech_stack": looked_up.get("tech_stack", proj.get("tech_stack"))
        })

    # load and render template
    env = Environment(loader=FileSystemLoader("src/templates"))
    template = env.get_template("resume.html")

    html_str = template.render(
        name=profile["name"],
        phone=profile.get("phone"),
        email=profile.get("email"),
        location=profile.get("location"),
        websites=profile.get("websites", []),
        education=profile.get("education", []),
        experience=experiences,
        projects=projects,
        skills=profile.get("skills", [])
    )

    # convert rendered HTML to PDF
    HTML(string=html_str).write_pdf(output_path)

# fetches reviewed jobs and tailors resume and generates cover letter
def run_tailor(profile_path: str):
    
    with open(profile_path, "r") as f:
        profile = json.load(f)
    
    reviewed_jobs = fetch_jobs_by_status("reviewed")[:1]
    print(f"\nTailoring for {len(reviewed_jobs)} reviewed jobs...\n")
    
    for job in reviewed_jobs:
        job = dict(job)
        print(f"Tailoring: {job['title']} at {job['company']}...")
        
        tailored_data = tailor_resume(profile, job)
        tailored_letter = write_cover_letter(profile, job)
        
        if not tailored_data or not tailored_letter:
            print(f"skipping — generation failed")
            continue
        
        resume_path, cover_letter_path = save_output(job, tailored_data, tailored_letter, profile)
        update_job_output(job["id"], resume_path, cover_letter_path)
        
        print(f"saved to output/{job['company']}_{job['title']}/")

if __name__ == "__main__":
   run_tailor("profiles/annie_weng.json")