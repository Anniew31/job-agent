from datetime import date
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
from src.models import Profile

# generates the pdf of the cover letter
def generate_cover_pdf(profile: Profile, tailored_letter: str, company: str, role: str):

    env = Environment(loader=FileSystemLoader("src/templates"))
    template = env.get_template("cover_letter.html")

    html_str = template.render(
        name=profile.name,
        phone=profile.phone,
        email=profile.email,
        date=date.today().strftime("%B %d, %Y"),
        company = company,
        job_title = role,
        cover_letter_body = tailored_letter
    )

    return HTML(string=html_str).write_pdf()