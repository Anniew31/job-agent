from fastapi import BackgroundTasks, FastAPI
from services.scraper.scraper import scrape_for_profile 
from services.tailor.runner import run_tailor
from services.scorer.runner import run_scorer
from models import Profile
from database.database import fetch_jobs_by_status, fetch_all_jobs, get_job
from services.pipeline import full_pipeline

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/scrape")
def scrape(profile: Profile, background_tasks: BackgroundTasks):
    background_tasks.add_task(scrape_for_profile, profile)
    return {"status": "scraping started"}

@app.post("/tailor")
def tailor(profile: Profile, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_tailor, profile)
    return {"status": "tailoring started"}

@app.post("/score")
def score(profile: Profile, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_scorer, profile)
    return {"status": "scoring started"}

@app.get("/jobs")
def get_jobs(status: str | None = None):
    if status:
        return fetch_jobs_by_status(status)
    return fetch_all_jobs()

@app.get("/jobs/{job_id}")
def get_job_by_id(job_id: int):
    return get_job(job_id)

@app.post("/run")
def run_pipeline(profile: Profile, background_tasks: BackgroundTasks):
    background_tasks.add_task(fu_pipeline, profile)
    return {"status": "pipeline started"}