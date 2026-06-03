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