from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
from backend.src.models import Profile

def generate_resume_pdf(profile: Profile,tailored_data: dict,output_path: str):
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

    for exp in profile.experience:
        exp_dict = exp.model_dump()
        experiences.append({
            **exp_dict,
            "bullets": exp_lookup.get(
                exp.company,
                exp.bullets
            ),
            "end_date": exp.end_date or "Present"
        })

    projects = []

    for proj in profile.projects:
        proj_dict = proj.model_dump()
        looked_up = proj_lookup.get(proj.name, {})
        projects.append({
            **proj_dict,
            "bullets": looked_up.get(
                "bullets",
                proj.bullets
            ),
            "tech_stack": looked_up.get(
                "tech_stack",
                proj.tech_stack
            )
        })

    env = Environment(
        loader=FileSystemLoader("src/templates")
    )

    template = env.get_template("resume.html")

    html_str = template.render(
        name=profile.name,
        phone=profile.phone,
        email=profile.email,
        location=profile.location,
        websites=[w.model_dump() for w in profile.websites],
        education=[e.model_dump() for e in profile.education],
        experience=experiences,
        projects=projects,
        skills=profile.skills
    )

    HTML(string=html_str).write_pdf(output_path)