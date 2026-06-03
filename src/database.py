import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_connection():
    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id              SERIAL PRIMARY KEY,
            title           TEXT NOT NULL,
            company         TEXT NOT NULL,
            location        TEXT,
            job_type        TEXT,
            job_min_salary  INTEGER,
            job_max_salary  INTEGER,
            benefits        TEXT,
            description     TEXT,
            status          TEXT DEFAULT 'pending',
            score           INTEGER,
            score_reasoning TEXT,
            source_url      TEXT UNIQUE NOT NULL,
            scraped_at      TEXT,
            resume_path     TEXT,
            cover_letter_path TEXT
        )
    """)

    conn.commit()
    conn.close()

def insert_job(title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO jobs (title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (source_url) DO NOTHING
        """, (title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url, datetime.now().isoformat()))
        conn.commit()
    finally:
        conn.close()

def fetch_jobs_by_status(status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE status = %s", (status,))
    rows = cursor.fetchall()
    conn.close()
    return rows

# update job status to either reviewed or rejected
def update_job_status(job_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET status = %s WHERE id = %s", (status, job_id))
    conn.commit()
    conn.close()

# update the score and reasoning given by ai 
def update_job_score(job_id, score, reasoning):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET score = %s, score_reasoning = %s WHERE id = %s", (score, reasoning, job_id))
    conn.commit()
    conn.close()

# update to paths of generated resume and cover letter
def update_job_output(job_id, resume_path, cover_letter_path):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE jobs SET resume_path = %s, cover_letter_path = %s WHERE id = %s",
        (resume_path, cover_letter_path, job_id)
    )
    conn.commit()
    conn.close()