from models import Profile
from services.scorer.runner import run_scorer
from services.scraper.scraper import scrape_for_profile
from services.tailor.runner import run_tailor

def full_pipeline(profile: Profile):
    scrape_for_profile(profile)
    run_scorer(profile)
    run_tailor(profile)