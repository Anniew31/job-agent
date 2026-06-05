from src.database.database import fetch_jobs_by_status, update_job_output
from src.services.tailor.llm import tailor_resume, write_cover_letter
from src.services.pdf.renderer import save_output
from src.database.database import get_profile_by_id

# fetches reviewed jobs and tailors resume and generates cover letter
def run_tailor(profile_id: int):
    profile = get_profile_by_id(profile_id)

    if profile is None:
        print(f"No profile found for id {profile_id}")
        return 0
    
    reviewed_jobs = fetch_jobs_by_status(profile_id, "reviewed")[:1]
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
        update_job_output(profile_id, job["id"], resume_path, cover_letter_path)
        
        print(f"saved to output/{job['company']}_{job['title']}/")