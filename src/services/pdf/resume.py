from weasyprint import HTML
from jinja2 import Environment, FileSystemLoader

# generates the pdf of the resume
def generate_resume_pdf(profile: dict, tailored_data: dict, output_path: str):
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
    for exp in profile.get("experience", []):
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

    HTML(string=html_str).write_pdf(output_path)