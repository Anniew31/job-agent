from backend.src.services.formatter import format_experience, format_projects
import json
from backend.src.models import Profile

# make prompt using profile information
def build_prompt(profile: Profile, job: dict) -> str:
    experience_str = format_experience(profile.experience)
    project_str = format_projects(profile.projects)
    
    return f"""
        You are a job application assistant scoring job fit for a candidate.

        CANDIDATE PROFILE:
        Positioning: {profile.positioning}
        Target roles: {", ".join(profile.target_roles)}
        Role type: {profile.role_type}
        Work preference: {profile.work_preference}
        Minimum salary: {profile.salary_floor} {profile.salary_type}
        Skills: {json.dumps(profile.skills)}
        Deal breakers: {", ".join(profile.deal_breakers) if profile.deal_breakers else "None"}
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
