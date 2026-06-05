from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from services.scraper.scraper import scrape_for_profile 
from services.tailor.runner import run_tailor
from services.scorer.runner import run_scorer
from models import Profile
from database.database import *
from services.pipeline import full_pipeline
from pydantic import BaseModel
from services.auth import *

class RegisterRequest(BaseModel):
    email: str
    password: str
    profile_data: Profile

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/register", status_code= 201)
def register(request: RegisterRequest):
    if get_profile_by_email(request.email): 
        raise HTTPException(status_code=409, detail="Email already exists")
    profile = create_profile(request.email, hash_password(request.password), request.profile_data)
    token = create_access_token(request.email, profile["id"])
    return {"status": "account created","token": token}
    
@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    profile = get_profile_by_email(form.username)
    if profile is None: 
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(form.password, profile["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(form.username, profile["id"])
    return {"access_token": token, "token_type": "bearer"}

@app.post("/scrape")
def scrape(background_tasks: BackgroundTasks, current_user: Profile = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(scrape_for_profile, current_user.id)
    return {"status": "scraping started"}

@app.post("/tailor")
def tailor(background_tasks: BackgroundTasks, current_user: Profile = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(run_tailor, current_user.id)
    return {"status": "tailoring started"}

@app.post("/score")
def score(background_tasks: BackgroundTasks, current_user: Profile = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(run_scorer, current_user.id)
    return {"status": "scoring started"}

@app.get("/jobs")
def get_jobs(current_user: Profile = Depends(get_current_user), status: str | None = None):
    if status:
        return fetch_jobs_by_status(current_user.id, status)
    return fetch_all_jobs(current_user.id)

@app.get("/jobs/{job_id}")
def get_job_by_id(job_id: int, current_user: Profile = Depends(get_current_user)):
    if not current_user.id:
        raise HTTPException(status_code=400, detail="Invalid user id")
    return get_job(job_id, current_user.id)

@app.post("/run")
def run_pipeline(background_tasks: BackgroundTasks, current_user: Profile = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(full_pipeline, current_user.id)
    return {"status": "pipeline started"}