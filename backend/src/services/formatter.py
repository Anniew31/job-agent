from typing import List
from src.models import WorkExperience, Project 

def format_experience(experience: List[WorkExperience]) -> str:
    entries = []
    for job in experience:
        end = job.end_date if job.end_date else "present"
        header = f"{job.company} — {job.position} ({job.start_date} - {end})"
        bullets = "\n".join([f"• {b}" for b in job.bullets])
        
        entry = header + "\n" + bullets
        entries.append(entry)
    return "\n\n".join(entries)

def format_projects(projects: List[Project]) -> str:
    entries = []
    for project in projects:
        bullets = "\n".join([f"• {b}" for b in project.bullets])
        entry = project.name + "\n" + bullets 
        entries.append(entry)
    return "\n\n".join(entries)