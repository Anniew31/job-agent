from src.database.database import update_job_output
from src.services.tailor.llm import tailor_resume, write_cover_letter
from src.services.pdf.renderer import save_output
from src.database.database import get_profile_by_id, update_job_output, get_job

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
    
    resume_path, cover_letter_path = save_output(job, tailored_data, tailored_letter, profile)

    resume_text = "\n".join([
        f"[{exp['identifier']}]\n" + "\n".join([f"• {b}" for b in exp["bullets"]])
        for exp in tailored_data.get("experiences", [])
    ])

    update_job_output(
        profile_id, job["id"],
        resume_path, cover_letter_path,
        resume_text=resume_text,
        cover_letter_text= tailored_letter
    )
    
    print(f"saved to output/{job['company']}_{job['title']}/")