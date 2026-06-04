from datetime import date
from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
from models import Profile

# generates the pdf of the cover letter
def generate_cover_pdf(profile: Profile, tailored_letter: str, output_path: str, company: str, role: str):

    # load and render template
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

    # convert rendered HTML to PDF
    HTML(string=html_str).write_pdf(output_path)

# generates the pdf of the resume
def generate_resume_pdf(profile_model: Profile, tailored_data: dict, output_path: str):
    profile = profile_model.model_dump()
    exp_lookup = {
        item["identifier"]: item["bullets"]
        for item in tailored_data.get("experiences", [])
    }

    proj_lookup = {
    item["identifier"]: {
        "bullets": item["bullets"],
        "tech_stack": item.get("tech_stack")
    }
    for item in tailored_data.get("projects", [])
}

    experiences = []
    for exp in profile.get("experiences", []):
        experiences.append({
            **exp,
            "bullets": exp_lookup.get(exp["company"], exp.get("bullets", [])),
            "end_date": exp.get("end_date") or "Present"
        })

    projects = []
    for proj in profile.get("projects", []):
        name = proj["name"]
        looked_up = proj_lookup.get(name, {})
        projects.append({
            **proj,
            "bullets": looked_up.get("bullets", proj.get("bullets", [])),
            "tech_stack": looked_up.get("tech_stack", proj.get("tech_stack"))
        })

    # load and render template
    env = Environment(loader=FileSystemLoader("src/templates"))
    template = env.get_template("resume.html")

    html_str = template.render(
        name=profile["name"],
        phone=profile.get("phone"),
        email=profile.get("email"),
        location=profile.get("location"),
        websites=profile.get("websites", []),
        education=profile.get("education", []),
        experience=experiences,
        projects=projects,
        skills=profile.get("skills", [])
    )

    # convert rendered HTML to PDF
    HTML(string=html_str).write_pdf(output_path)
