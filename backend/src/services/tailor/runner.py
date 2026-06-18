from src.services.tailor.llm import tailor_resume, write_cover_letter
from src.services.pdf.renderer import save_output
from src.database.database import get_profile_by_id, get_job, update_job_documents

# tailors resume and generates cover letter for given job id
def run_tailor(profile_id: int, job_id: int):
    profile = get_profile_by_id(profile_id)

    if profile is None:
        print(f"No profile found for id {profile_id}")
        return 0
    
    job = get_job(job_id, profile_id)
    if job is None:
        print(f"No job found for id {job_id} and profile {profile_id}")
        return 0

    print(f"Tailoring: {job.get('title', 'unknown')} at {job.get('company', 'unknown')}...")
    
    tailored_data = tailor_resume(profile, job)
    tailored_letter = write_cover_letter(profile, job)
    
    if not tailored_data or not tailored_letter:
        print(f"skipping — generation failed")
        return 0
    
    resume_bytes, cover_bytes = save_output(job, tailored_data, tailored_letter, profile)

    experiences = tailored_data.get("experiences") or []
    experience_text = "\n\n".join([
        f"[{exp['identifier']}]\n" + "\n".join([f"• {b}" for b in exp.get("bullets", []) or []])
        for exp in experiences
    ])

    projects = tailored_data.get("projects") or []
    project_text = "\n\n".join([
        f"[{proj['identifier']}]\n" + "\n".join([f"• {b}" for b in proj.get("bullets", []) or []])
        for proj in projects
    ])

    resume_text = experience_text + "\n\n" + project_text

    update_job_documents(
        profile_id,
        job["id"],
        resume_text=resume_text,
        cover_letter_text=tailored_letter,
        resume_pdf=resume_bytes,
        cover_letter_pdf=cover_bytes,
    )
    
    print(f"saved to output/{job['company']}_{job['title']}/")