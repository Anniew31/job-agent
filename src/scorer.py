import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types 
from pydantic import BaseModel, Field
from database import *
from config import SCORE_THRESHOLD, MAX_JOBS_PER_RUN
import time


load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class JobScoreSchema(BaseModel):
    score: int
    reasoning: str
    deal_breaker: bool | None = Field(default= False)
    deal_breaker_reason: str | None = Field(default=None)

# formats experience nicely for prompting
def format_experience(experience: list) -> str:
    entries = []
    for job in experience:
        end = job.get("end_date") if job.get("end_date") else "present"
        header = job.get("company") + " - "  + job.get("position") + " (" + job.get("start_date") + " - " + end + ")"
        bullets = "\n".join([f"•{b}" for b in job.get("bullets")])
        entry = header + "\n" + bullets 
        entries.append(entry)
    return "\n\n".join(entries)

# formats projects nicely for prompting
def format_projects(projects: list) -> str:
    entries = []
    for job in projects:
        bullets = "\n".join([f"•{b}" for b in job.get("bullets")])
        entry = job.get("name") + "\n" + bullets 
        entries.append(entry)
    return "\n\n".join(entries)

# make prompt using profile information
def build_prompt(profile: dict, job: dict) -> str:
    experience_str = format_experience(profile.get("experience", []))
    project_str = format_projects(profile.get("projects", []))
    
    return f"""
        You are a job application assistant scoring job fit for a candidate.

        CANDIDATE PROFILE:
        Positioning: {profile.get("positioning", [])}
        Target roles: {", ".join(profile.get("target_roles", []))}
        Role type: {profile.get("role_type",[])}
        Work preference: {profile.get("work_preference", [])}
        Minimum salary: {profile.get("salary_floor", [])} {profile.get("salary_type", [])}
        Skills: {json.dumps(profile.get("skills", []))}
        Deal breakers: {", ".join(profile["deal_breakers"]) if profile["deal_breakers"] else "None"}
        Experience:
        {experience_str}
        Projects:
        {project_str}

        JOB POSTING:
        Title: {job.get("title")}
        Company: {job.get("company")}
        Location: {job.get("location")}
        Job type: {job.get("job_type")}
        Salary range: {job.get("job_min_salary")} - {job.get("job_max_salary")} per year
        Description: {job.get("description", "")[:3000]}

        SCORING INSTRUCTIONS:
        - Score 1-10 based on overall fit between the candidate and the job
        - Check every deal breaker explicitly — if any are violated set deal_breaker to true
        - If job max salary is below candidate salary floor that is an automatic deal breaker
        - If the role type does not match (e.g. job is fulltime but candidate wants internship) that is a deal breaker
        - Be honest about missing experience or skill gaps
        - reasoning should be 2-3 sentences explaining the score
        - deal_breaker_reason should explain which deal breaker was violated, or null if none
    """

# uses gemini to score the job based on profile
def score_job(prompt: str) -> dict | None:

    # Retry mechanism
    max_retries = 3
    retry_delay = 5  # Seconds to wait before trying again

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=JobScoreSchema,
            ),
            )
            
            data = json.loads(response.text)
            return data

        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower() or "limit" in str(e).lower():
                print(f"⚠️ Rate limit hit. Waiting {retry_delay} seconds (Attempt {attempt + 1}/{max_retries})...")
                time.sleep(retry_delay)
                retry_delay *= 2 # waits longer next time
                continue
            else:
                print(f"LLM call failed with unexpected error: {e}")
                return None

    print(f"Failed to score after {max_retries} attempts due to rate limits.")
    return None

# scores the jobs that haven't been scored
def run_scorer(profile_path: str):
    with open(profile_path, "r") as f:
        profile = json.load(f)
    
    pending_jobs = fetch_jobs_by_status("pending")[:MAX_JOBS_PER_RUN]
    print(f"\nScoring {len(pending_jobs)} pending jobs...\n")
    
    for job in pending_jobs:
        job = dict(job)
        print(f"Scoring: {job.get('title')} at {job.get('company')}...")
        
        prompt = build_prompt(profile, job)
        result = score_job(prompt)
        
        if result is None:
            print(f"skipping — scorer returned nothing")
            continue
        
        score = result.get("score", 0)
        reasoning = result.get("reasoning", "")
        deal_breaker = result.get("deal_breaker", False)
        deal_breaker_reason = result.get("deal_breaker_reason")
 
        update_job_score(job.get("id"), score, reasoning)
        if deal_breaker:
            update_job_status(job.get("id"), "rejected")
            print(deal_breaker_reason)
        elif score < SCORE_THRESHOLD: 
            update_job_status(job.get("id"), "rejected")
            print(f'{score} was too low')
        else: 
            update_job_status(job.get("id"), "reviewed")
            print(f'AI reviewed it and found a fit of {score}/10. {reasoning}')

if __name__ == "__main__":
    run_scorer("profiles/annie_weng.json")