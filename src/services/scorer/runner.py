from database.database import fetch_jobs_by_status, update_job_score, update_job_status
from services.config import MAX_JOBS_PER_RUN, SCORE_THRESHOLD
from services.scorer.llm import score_job
from services.scorer.prompt import build_prompt
from models import Profile

# scores the jobs that haven't been scored
def run_scorer(profile: Profile):
    pending_jobs = fetch_jobs_by_status(profile.id, "pending")[:MAX_JOBS_PER_RUN]
    print(f"\nScoring {len(pending_jobs)} pending jobs...\n")
    
    for job in pending_jobs:
        job = dict(job)
        print(f"Scoring: {job.get('title')} at {job.get('company')}...")
        
        prompt = build_prompt(profile, job)
        result = score_job(prompt)
        
        if result is None:
            print(f"skipping — scorer returned nothing")
            continue
        
        score = result.get("score", 0)
        reasoning = result.get("reasoning", "")
        deal_breaker = result.get("deal_breaker", False)
        deal_breaker_reason = result.get("deal_breaker_reason")
 
        update_job_score(profile.id, job.get("id"), score, reasoning)
        if deal_breaker:
            update_job_status(profile.id, job.get("id"), "rejected")
            print(deal_breaker_reason)
        elif score < SCORE_THRESHOLD: 
            update_job_status(profile.id, job.get("id"), "rejected")
            print(f'{score} was too low')
        else: 
            update_job_status(profile.id, job.get("id"), "reviewed")
            print(f'AI reviewed it and found a fit of {score}/10. {reasoning}')