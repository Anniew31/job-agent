from src.services.pdf.cover_letter import generate_cover_pdf
from src.services.pdf.resume import generate_resume_pdf
from src.models import Profile

# returns the bytes
def save_output(job: dict, tailored_data: dict, tailored_letter: str, profile: Profile) -> tuple[bytes | None, bytes | None]:
    resume_bytes = generate_resume_pdf(profile, tailored_data)
    cover_bytes = generate_cover_pdf(profile, tailored_letter, job["company"], job["title"])
    return resume_bytes, cover_bytes