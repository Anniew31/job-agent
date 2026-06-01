from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from database import insert_job, init_db
from llm import extract_job_data
from bs4 import BeautifulSoup
import time
import random

def human_delay():
    time.sleep(random.uniform(1.0, 2.5))

def scrape_url(url: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        Stealth().apply_stealth_sync(page)

        page.goto(url)
        human_delay()

        raw_html = page.content()
        browser.close()

        soup = BeautifulSoup(raw_html, "html.parser")
        for element in soup(["script", "style", "noscript", "header", "footer", "nav"]):
            element.extract()

        cleaned_text = soup.get_text(separator=" ", strip=True)

        return cleaned_text

def scrape_job(url: str):
    print(f"Scraping {url}...")
    
    raw_text = scrape_url(url)
    job_data = extract_job_data(raw_text, url)

    if job_data:
        insert_job(
            title=job_data.get("title"),
            company=job_data.get("company"),
            location=job_data.get("location"),
            job_type=job_data.get("job_type"),
            salary=job_data.get("salary"),
            benefits=job_data.get("benefits"),
            description=job_data.get("description"),
            source_url=job_data.get("source_url")
        )
        print(f"saved: {job_data.get('title')} at {job_data.get('company')}")
    else:
        print(f"failed to extract job data")

if __name__ == "__main__":
    init_db()
    scrape_job("https://job-boards.greenhouse.io/anthropic/jobs/5023394008")