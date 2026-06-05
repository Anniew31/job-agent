from models import Profile
from services.scorer.runner import run_scorer
from services.scraper.scraper import scrape_for_profile
from services.tailor.runner import run_tailor
from database.database import get_profile_by_id

def full_pipeline(profile_id: int):
    scrape_for_profile(profile_id)
    run_scorer(profile_id)
    run_tailor(profile_id)