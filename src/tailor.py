import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from database import fetch_jobs_by_status, update_job_output

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class TailoredResumeSchema(BaseModel):
    bullets: list[str]

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

# tailors resume to job description
def tailor_resume(profile: dict, job: dict) -> list[str] | None:
    experience_str = format_experience(profile.get("experience", []))
    
    prompt = f"""
    You are a resume writing assistant helping a candidate tailor their resume bullets for a specific job.

    CANDIDATE'S EXISTING EXPERIENCE:
    {experience_str}

    JOB THEY ARE APPLYING TO:
    Title: {job.get("title")}
    Company: {job.get("company")}
    Description: {job.get("description", "")[:3000]}

    INSTRUCTIONS:
    - Rewrite the candidate's existing bullets to mirror the language and keywords in the job description
    - Do NOT invent new experience or skills the candidate does not have
    - Do NOT change the core facts — only reframe how they are described
    - Use strong action verbs
    - Keep each bullet concise, one sentence
    - Return 6 to 8 bullets total drawn from across all their experience
    - Prioritize bullets most relevant to this specific job
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
            return data.get("bullets")
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
    
    prompt = f"""
    You are a cover letter writing assistant helping a candidate apply for a job.

    CANDIDATE PROFILE:
    Name: {profile["name"]}
    Positioning: {profile["positioning"]}
    Skills: {", ".join(profile["skills"])}
    Experience:
    {experience_str}

    JOB THEY ARE APPLYING TO:
    Title: {job.get("title")}
    Company: {job.get("company")}
    Location: {job.get("location")}
    Description: {job.get("description", "")[:3000]}

    INSTRUCTIONS:
    Write a page long cover letter structured exactly as follows:
    - Paragraph 1: Who the candidate is and why they are excited about this specific role and company
    - Can be multiple paragraphs: Their most relevant experience and skills for this role, using specific examples
    - Paragraph 3: A confident closing expressing interest in next steps
    - Do not use generic filler phrases like "I am writing to express my interest"
    - Write in first person, professional but warm tone
    - Address it to the hiring team if no specific name is available
    - Do not include a subject line or date, just the letter body
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
def save_output(job: dict, bullets: list[str], cover_letter: str) -> tuple[str, str]:
    company = job["company"].replace(" ", "_").replace("/", "_")
    title = job["title"].replace(" ", "_").replace("/", "_")
    
    folder = os.path.join("output", f"{company}_{title}")
    os.makedirs(folder, exist_ok=True)
    
    resume_path = os.path.join(folder, "resume_bullets.txt")
    cover_letter_path = os.path.join(folder, "cover_letter.txt")
    
    with open(resume_path, "w") as f:
        f.write("\n".join([f"• {b}" for b in bullets]))
    
    with open(cover_letter_path, "w") as f:
        f.write(cover_letter)
    
    return resume_path, cover_letter_path

# fetches reviewed jobs and tailors resume and generates cover letter
def run_tailor(profile_path: str):
    
    with open(profile_path, "r") as f:
        profile = json.load(f)
    
    reviewed_jobs = fetch_jobs_by_status("reviewed")
    print(f"\nTailoring for {len(reviewed_jobs)} reviewed jobs...\n")
    
    for job in reviewed_jobs:
        job = dict(job)
        print(f"Tailoring: {job['title']} at {job['company']}...")
        
        bullets = tailor_resume(profile, job)
        cover_letter = write_cover_letter(profile, job)
        
        if not bullets or not cover_letter:
            print(f"  ✗ skipping — generation failed")
            continue
        
        resume_path, cover_letter_path = save_output(job, bullets, cover_letter)
        update_job_output(job["id"], resume_path, cover_letter_path)
        
        print(f"saved to output/{job['company']}_{job['title']}/")

if __name__ == "__main__":
    run_tailor("profiles/annie_weng.json")