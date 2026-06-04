from fastapi import BackgroundTasks, FastAPI
from services.scraper.scraper import scrape_for_profile 
from services.tailor.runner import run_tailor
from services.scorer.runner import run_scorer
from services.pdf.renderer import save_output
from models import Profile

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