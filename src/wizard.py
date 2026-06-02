from models import *
import os
import json
from database import init_db

# asks user for input for a field
def ask_field(question, validator=None, optional=False, field_type=str):
    while True:
        raw = input(f"{question}: ").strip()

        if not raw:
            if optional:
                return None
            print("This field is required")
            continue

        try:
            value = field_type(raw)
        except ValueError:
            print(f"Expected a {field_type.__name__}")
            continue

        if validator:
            try:
                value = validator(value)
            except ValueError as e:
                print(f"{e}")
                continue

        return value
    
# asks user to provide answer from choices
def ask_choice(question, options):
    formatted = "/".join(options)
    while True:
        raw = input(f"{question} ({formatted}): ").strip().lower()
        if raw not in options:
            print(f"Must be one of: {formatted}")
            continue
        return raw

# asks user to list multiple answers
def ask_list(question, optional=False):
    while True:
        raw = input(f"{question} (comma-separated): ").strip()
        if not raw:
            if optional:
                return []
            print("At least one item required")
            continue  
        items = [item.strip() for item in raw.split(",") if item.strip()]
        if not items:
            print("At least one item required")
            continue
        return items  
    
# prints out title nicely 
def print_section(title):
    print(f"\n{'='*40}")
    print(f"{title}")
    print(f"{'='*40}\n")

# asks user for personal info
def collect_personal_info():
    print_section("PERSONAL INFO")
    return {
        "name": ask_field("Full name", validator=validate_not_empty),
        "email": ask_field("Email", validator=validate_email),
        "location": ask_field("Location (city, state)", validator=validate_not_empty),
        "positioning": ask_field("Two sentence bio for cover letters", validator=validate_positioning),
    }

# asks user for job preferences
def collect_job_preferences():
    print_section("JOB PREFERENCES")
    return {
        "target_roles": ask_list("Target roles (e.g. Software Engineer Intern)"),
        "role_type": ask_choice("Role type", ["internship", "fulltime", "either"]),
        "work_preference": ask_choice("Work preference", ["remote", "onsite", "hybrid", "any"]),
        "salary_floor": ask_field("Minimum salary", validator=validate_salary, field_type = int),
        "salary_type": ask_choice("Salary type", ["hourly", "annual"]),
        "deal_breakers": ask_list("Deal breakers", optional=True),
    }


# asks user for skills
def collect_skills():
    print_section("SKILLS")
    return {
        "skills": ask_list("Skills you have")
    }

# asks user for education history
def collect_education():
    print_section("EDUCATION")
    entries = []
    while True:
        school = ask_field("School", validator=validate_not_empty)
        degree = ask_field("Degree (e.g. Bachelor of Science)", validator=validate_not_empty)
        major = ask_field("Major", validator=validate_not_empty)
        gpa = ask_field("GPA (leave blank if prefer not to say)", optional=True, field_type = float, validator=validate_gpa)
        grad_year = ask_field("Graduation year", field_type = int, validator=validate_grad_year)

        entries.append(Education(
            school = school,
            degree = degree,
            major = major,
            gpa = gpa,
            grad_year = grad_year
        ))

        more = input("\nAdd another education entry? (y/n): ").strip().lower()
        if more != "y":
            break
    return entries

# asks user for their work experience
def collect_experience():
    print_section("WORK EXPERIENCE")
    entries = []

    has_experience = input("Do you have work experience to add? (y/n): ").strip().lower()
    if has_experience != "y":
        return entries

    while True:
        company = ask_field("Company", validator=validate_not_empty)
        position = ask_field("Position", validator=validate_not_empty)
        start = ask_field("Start date", validator=validate_date_format)
        end = ask_field("End date (leave blank if current)", optional=True, validator=validate_date_format)

        print("Enter bullet points one at a time. Empty line when done.")
        bullets = []
        while True:
            bullet = input(f"Bullet {len(bullets)+1}: ").strip()
            if not bullet:
                if len(bullets) == 0:
                    print("At least one bullet required")
                    continue
                break
            if len(bullet) < 10:
                print("Bullet must be at least 10 characters")
                continue
            bullets.append(bullet)

        entries.append(WorkExperience(
            company=company,
            position=position,
            start_date=start,
            end_date=end,
            bullets=bullets
        ))

        more = input("\n  Add another experience entry? (y/n): ").strip().lower()
        if more != "y":
            break
    return entries

# asks user for their projects
def collect_project():
    print_section("PROJECTS")
    projects = []

    has_project = input("Do you have projects to add? (y/n): ").strip().lower()
    if has_project != "y":
        return projects

    while True:
        name = ask_field("Name", validator=validate_not_empty)
        print("Enter bullet points one at a time. Empty line when done.")
        bullets = []
        while True:
            bullet = input(f"Bullet {len(bullets)+1}: ").strip()
            if not bullet:
                if len(bullets) == 0:
                    print("At least one bullet required")
                    continue
                break
            if len(bullet) < 10:
                print("Bullet must be at least 10 characters")
                continue
            bullets.append(bullet)

        projects.append(Project(
            name=name,
            bullets=bullets
        ))

        more = input("\n  Add another project? (y/n): ").strip().lower()
        if more != "y":
            break
    return projects


def run():
    init_db()

    print("\nWelcome to Job Agent Setup\n")
    
    data = {}
    data.update(collect_personal_info())
    data.update(collect_job_preferences())
    data.update(collect_skills())
    data["education"] = collect_education()
    data["experience"] = collect_experience()
    data["projects"] = collect_project()
    
    try:
        profile = Profile(**data)
    except Exception as e:
        print(f"\nSomething went wrong building your profile: {e}")
        return

    # save to file
    os.makedirs("profiles", exist_ok=True)
    filename = profile.name.lower().replace(" ", "_") + ".json"
    filepath = os.path.join("profiles", filename)
    
    with open(filepath, "w") as f:
        f.write(profile.model_dump_json(indent=2))
    
    print(f"\nProfile saved to {filepath} ✓")

if __name__ == "__main__":
    run()