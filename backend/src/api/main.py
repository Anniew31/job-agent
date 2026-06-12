from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from src.services.scraper.scraper import scrape_for_profile 
from src.services.tailor.runner import run_tailor
from src.services.scorer.runner import run_scorer
from src.models import *
from src.database.database import *
from src.services.pipeline import full_pipeline
from pydantic import BaseModel
from src.services.auth import *
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

class RegisterRequest(BaseModel):
    email: str
    password: str

# update profile helper
def update_profile_section(update_fn, profile_id: int | None, request):
    if profile_id is None:
        raise HTTPException(status_code=400, detail="Invalid user")

    updated = update_fn(profile_id, request)

    if updated == 0:
        raise HTTPException(status_code=404, detail="Failed to update")
    
    return {"status": "profile saved"}

@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/auth/register", status_code= 201)
def register(request: RegisterRequest):
    if get_profile_by_email(request.email) is not None:
        raise HTTPException(status_code=409, detail="Email already exists")
    password_hash = hash_password(request.password)
    profile = create_empty_profile(request.email, password_hash)
    token = create_access_token(request.email, profile["id"])

    return {
        "status": "account created",
        "token": token,
        "profile_id": profile["id"]
    }

@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    profile = get_profile_by_email(form.username)
    if profile is None: 
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(form.password, profile["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(form.username, profile["id"] or -1)
    return {
        "access_token": token, 
        "token_type": "bearer",
        "profile_complete": profile["profile_complete"]
    }

@app.patch("/profile/basic")
def basic_profile(request: BasicProfileRequest, current_user: AuthUser = Depends(get_current_user)):
    return update_profile_section(update_basic_profile, current_user.id, request)

@app.patch("/profile/professional")
def professional_profile(request: ProfessionalProfileRequest, current_user: AuthUser = Depends(get_current_user)):
    return update_profile_section(update_profile_professional, current_user.id, request)

@app.patch("/profile/education")
def education_profile(request: EducationRequest, current_user: AuthUser = Depends(get_current_user)):
    return update_profile_section(update_profile_education, current_user.id, request)

@app.patch("/profile/experience")
def experience_profile(request: ExperienceRequest, current_user: AuthUser = Depends(get_current_user)):
    return update_profile_section(update_profile_experience, current_user.id, request)

@app.patch("/profile/projects")
def project_profile(request: ProjectsRequest, current_user: AuthUser = Depends(get_current_user)):
    return update_profile_section(update_profile_projects, current_user.id, request)

@app.patch("/profile/preferences")
def preference_profile(request: PreferencesRequest, current_user: AuthUser = Depends(get_current_user)):
    return update_profile_section(update_profile_preference, current_user.id, request)

@app.post("/profile/complete")
def complete_profile(current_user: Profile = Depends(get_current_user)):
    if current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    update_profile_complete(current_user.id)
    return {"status": "profile marked complete"}

@app.post("/scrape")
def scrape(background_tasks: BackgroundTasks, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(scrape_for_profile, current_user.id)
    return {"status": "scraping started"}

@app.post("/tailor")
def tailor(background_tasks: BackgroundTasks, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(run_tailor, current_user.id)
    return {"status": "tailoring started"}

@app.post("/score")
def score(background_tasks: BackgroundTasks, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(run_scorer, current_user.id)
    return {"status": "scoring started"}

@app.get("/jobs")
def get_jobs(current_user: AuthUser = Depends(get_current_user), status: str | None = None):
    if status:
        return fetch_jobs_by_status(current_user.id, status)
    return fetch_all_jobs(current_user.id)

@app.get("/jobs/{job_id}")
def get_job_by_id(job_id: int, current_user: AuthUser = Depends(get_current_user)):
    if not current_user.id:
        raise HTTPException(status_code=400, detail="Invalid user id")
    return get_job(job_id, current_user.id)

@app.post("/run")
def run_pipeline(background_tasks: BackgroundTasks, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(full_pipeline, current_user.id)
    return {"status": "pipeline started"}

@app.get("/profile")
def get_profile(current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    return get_profile_by_id(current_user.id)