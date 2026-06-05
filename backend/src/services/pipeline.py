from backend.src.models import Profile
from backend.src.services.scorer.runner import run_scorer
from backend.src.services.scraper.scraper import scrape_for_profile
from backend.src.services.tailor.runner import run_tailor
from backend.src.database.database import get_profile_by_id

def full_pipeline(profile_id: int):
    scrape_for_profile(profile_id)
    run_scorer(profile_id)
    run_tailor(profile_id)