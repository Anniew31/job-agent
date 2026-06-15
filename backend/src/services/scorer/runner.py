from src.database.database import *
from src.services.scorer.llm import score_job
from src.services.scorer.prompt import build_prompt

# scores the jobs that haven't been scored
def run_scorer(profile_id: int):
    profile = get_profile_by_id(profile_id)

    if profile is None:
        return 0
    
    threshold = profile.score_threshold if profile.score_threshold is not None else 4
    pending_jobs = fetch_jobs_by_status(profile.id, "pending")
    
    for job in pending_jobs:
        job = dict(job)
        prompt = build_prompt(profile, job)
        result = score_job(prompt)
        
        if result is None:
            continue
        
        score = result.get("score", 0)
        reasoning = result.get("reasoning", "")
        deal_breaker = result.get("deal_breaker", False)
        deal_breaker_reason = result.get("deal_breaker_reason")
 
        update_job_score(profile.id, job.get("id"), score, reasoning)
        if deal_breaker:
            update_job_status(profile.id, job.get("id"), "rejected")
        elif score < threshold: 
            update_job_status(profile.id, job.get("id"), "rejected")
        else: 
            update_job_status(profile.id, job.get("id"), "scored")