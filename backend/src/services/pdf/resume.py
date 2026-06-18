from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader
from src.models import Profile

def generate_resume_pdf(profile: Profile, tailored_data: dict) -> bytes:
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

    pdf = HTML(string=html_str).write_pdf()
    return pdf or b""

def generate_resume_pdf_from_text(profile: Profile, resume_text: str) -> bytes:
    env = Environment(loader=FileSystemLoader("src/templates"))
    template = env.get_template("resume.html")

    def parse_sections(text: str) -> dict[str, list[str]]:
        sections = {}
        current_key = None
        current_bullets = []

        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("[") and line.endswith("]"):
                if current_key is not None:
                    sections[current_key] = current_bullets
                current_key = line[1:-1]  # strip the brackets
                current_bullets = []
            elif line.startswith("•") and current_key:
                current_bullets.append(line.lstrip("• ").strip())

        if current_key is not None:
            sections[current_key] = current_bullets

        return sections

    sections = parse_sections(resume_text)

    experiences = []
    for exp in profile.experience:
        exp_dict = exp.model_dump()
        exp_dict["end_date"] = exp.end_date or "Present"
        exp_dict["bullets"] = sections.get(exp.company, exp.bullets)
        experiences.append(exp_dict)

    projects = []
    for proj in profile.projects:
        proj_dict = proj.model_dump()
        proj_dict["bullets"] = sections.get(proj.name, proj.bullets)
        projects.append(proj_dict)

    html_str = template.render(
        name=profile.name,
        phone=profile.phone,
        email=profile.email,
        location=profile.location,
        websites=[w.model_dump() for w in profile.websites],
        education=[e.model_dump() for e in profile.education],
        experience=experiences,
        projects=projects,
        skills=profile.skills,
    )

    pdf = HTML(string=html_str).write_pdf()
    return pdf or b""