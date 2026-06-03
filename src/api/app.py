from fastapi import FastAPI
from database.database import fetch_jobs_by_status, update_job_status

app = FastAPI()

@app.get("/jobs")
def get_jobs(status: str = "pending"):
    return fetch_jobs_by_status(status)

@app.post("/jobs/{job_id}/status")
def update_status(job_id: int, status: str):
    update_job_status(job_id, status)
    return {"ok": True}