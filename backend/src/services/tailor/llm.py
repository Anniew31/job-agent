import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import Optional
import json
from src.services.formatter import format_experience, format_projects
from src.models import Profile

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


# tailors resume to job description
def tailor_resume(profile: Profile, job: dict) -> dict | None:
    experience_str = format_experience(profile.experience)
    project_str = format_projects(profile.projects)

    exp_identifiers = [exp.company for exp in profile.experience]
    proj_identifiers = [proj.name for proj in profile.projects]
    
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
    - Return 2 to 3 bullets for each experience and project
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
            data = json.loads(response.text or "{}")
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
def write_cover_letter(profile: Profile, job: dict) -> str | None:
    experience_str = format_experience(profile.experience)
    project_str = format_projects(profile.projects)
    
    prompt = f"""
    You are a cover letter writing assistant helping a candidate apply for a job.

    CANDIDATE PROFILE:
    Name: {profile.name}
    Positioning: {profile.positioning}
    Skills: {", ".join(profile.skills)}
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
            data = json.loads(response.text or "{}")
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
