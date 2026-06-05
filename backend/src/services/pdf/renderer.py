import os
from src.services.pdf.cover_letter import generate_cover_pdf
from src.services.pdf.resume import generate_resume_pdf
from src.models import Profile

# saves outupt into seperate files and returns file paths
def save_output(job: dict, tailored_data:dict, tailored_letter: str, profile: Profile) -> tuple[str, str]:
    company = job["company"].replace(" ", "_").replace("/", "_")
    title = job["title"].replace(" ", "_").replace("/", "_")
    
    folder = os.path.join("output", f"{company}_{title}")
    os.makedirs(folder, exist_ok=True)
    
    resume_path = os.path.join(folder, "resume.pdf")
    generate_resume_pdf(profile, tailored_data, resume_path)
    
    cover_letter_path = os.path.join(folder, "cover_letter.pdf")
    generate_cover_pdf(profile, tailored_letter, cover_letter_path, job["company"], job["title"])
    
    return resume_path, cover_letter_path