import requests
import os
from dotenv import load_dotenv
from database.database import insert_job, get_profile_by_id

load_dotenv()

RAPID_API_KEY = os.getenv("RAPID_API_KEY")

# calls api to get jobs as json
def fetch_jobs(query: str, location: str, num_pages: int = 1) -> list:
    url = "https://jsearch.p.rapidapi.com/search"
    
    headers = {
        "X-RapidAPI-Key": RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": query,
        "location": location,
        "num_pages": str(num_pages)
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"API error {response.status_code}: {response.text[:100]}")
        return []
    
    data = response.json()
    return data.get("data", [])

# turns json into a list to save it
def save_jobs(jobs: list, profile_id: int):
    profile = get_profile_by_id(profile_id)

    saved = 0
    
    for job in jobs:
        benefits_list = job.get("job_benefits") or []
        benefits_str = ", ".join(benefits_list)
        
        insert_job(
            profile_id=profile_id,
            title=job.get("job_title"),
            company=job.get("employer_name"),
            location=job.get("job_location"),
            job_type=job.get("job_employment_type"),
            job_min_salary=job.get("job_min_salary"),
            job_max_salary=job.get("job_max_salary"),
            benefits=benefits_str,
            description=job.get("job_description"),
            source_url=job.get("job_apply_link")
        )
        saved += 1
    
    return saved

# loads profile to determine what type of role to query for
def scrape_for_profile(profile_id: int):
    profile = get_profile_by_id(profile_id)

    if profile is None:
        print(f"No profile found for id {profile_id}")
        return 0

    target_roles = profile.target_roles 
    location = profile.location
    name = profile.name

    print(f"\nScraping jobs for {name}...")
    print(f"Roles: {target_roles}")
    print(f"Location: {location}\n")
    
    total_saved = 0
    
    for role in target_roles:
        print(f"Searching: {role}...")
        jobs = fetch_jobs(query=role, location=location)
        print(f"Found {len(jobs)} results")  
        saved = save_jobs(jobs, profile_id)
        total_saved += saved
        print(f"Saved {saved} jobs")
    
    print(f"\nDone. Total jobs saved: {total_saved}")