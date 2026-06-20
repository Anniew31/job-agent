import io
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Header, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.security import OAuth2PasswordRequestForm
from src.services.pdf.cover_letter import generate_cover_pdf
from src.services.pdf.resume import generate_resume_pdf_from_text
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
def login(form: OAuth2PasswordRequestForm = Depends(), demo_bypass: Optional[str] = Header(None)):
    if demo_bypass == "true" or form.username == "demo@jobagent.com":
        demo_email = "demo@jobagent.com"
        profile = get_profile_by_email(demo_email)
        
        if profile is None:
            raise HTTPException(status_code=404, detail="Demo profile not gotten")
        token = create_access_token(demo_email, profile["id"] or -1)
        return {
            "access_token": token, 
            "token_type": "bearer",
            "profile_complete": profile["profile_complete"]
        }
    
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

@app.post("/tailor/{job_id}")
def tailor(background_tasks: BackgroundTasks, job_id: int, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    background_tasks.add_task(run_tailor, current_user.id, job_id)
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

@app.get("/profile/metrics")
def get_profile_metrics(current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    return get_metrics(current_user.id)

@app.get("/profile/jobs")
def recent_jobs(current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    return get_recent_jobs(current_user.id)

@app.get("/profile/finder-analytics")
def get_finder_analytics(current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user session")
    return get_finder_chart_data(current_user.id)
    
@app.get("/profile/scores-data")
def get_scores_data(current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    return get_histogram_scores(current_user.id)

@app.post("/profile/review-data")
def review_action(current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
    return get_review_lifetime_stats(current_user.id)

@app.patch("/job/update-status")
def update_status(request: JobReviewed, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")   
    updated = update_job_status(current_user.id, request.job_id, request.status)
    if updated == 0:
        raise HTTPException(status_code=404, detail="Failed to update")
    return updated

@app.patch("/jobs/{job_id}/documents")
def update_documents(job_id: int, request: DocumentUpdateRequest, current_user: AuthUser = Depends(get_current_user)):
    if not current_user.id:
        raise HTTPException(status_code=400, detail="Invalid user")
    update_job_documents(current_user.id, job_id, request.resume_text, request.cover_letter_text)
    return {"status": "documents saved"}

@app.get("/job/{job_id}/status")
def get_job_tailor_status(job_id: int, current_user: AuthUser = Depends(get_current_user)):
    if current_user is None or current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user")
        
    job = get_job(job_id, current_user.id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    is_ready = bool(job.get("resume_text") and job.get("cover_letter_text"))
    
    return {
        "ready": is_ready,
        "resume_text": job.get("resume_text", ""),
        "cover_letter_text": job.get("cover_letter_text", "")
    }

@app.get("/jobs/{job_id}/pdf")
def download_pdf(
    job_id: int,
    tab: str = "resume",
    current_user: AuthUser = Depends(get_current_user)
):
    job = get_job(job_id, current_user.id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profile = get_profile_by_id(current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if tab == "resume":
        text = job.get("resume_text")
        if not text:
            raise HTTPException(status_code=404, detail="No resume generated yet")
        pdf_bytes = generate_resume_pdf_from_text(profile, text)
        filename = f"{job.get('company', 'resume').replace(' ', '_')}_resume.pdf"
    else:
        text = job.get("cover_letter_text")
        if not text:
            raise HTTPException(status_code=404, detail="No cover letter generated yet")
        pdf_bytes = generate_cover_pdf(profile, text, job.get("company", ""), job.get("title", ""))
        filename = f"{job.get('company', 'cover').replace(' ', '_')}_cover_letter.pdf"

    if pdf_bytes is None:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )