import sqlite3
from datetime import datetime

DB_PATH = "job_agent.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row 
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            title           TEXT NOT NULL,
            company         TEXT NOT NULL,
            location        TEXT,
            job_type        TEXT,
            job_min_salary  INTEGER,
            job_max_salary  INTEGER,
            benefits        TEXT,
            description     TEXT,
            source_url      TEXT UNIQUE,
            status          TEXT DEFAULT 'pending',
            score           INTEGER,
            score_reasoning TEXT,
            scraped_at      TEXT
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url, datetime.now().isoformat()))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    finally:
        conn.close()

def fetch_jobs_by_status(status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE status = ?", (status,))
    rows = cursor.fetchall()
    conn.close()
    return rows

def update_job_status(job_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET status = ? WHERE id = ?", (status, job_id))
    conn.commit()
    conn.close()

def update_job_score(job_id, score, reasoning):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET score = ?, score_reasoning = ? WHERE id = ?", (score, reasoning, job_id))
    conn.commit()
    conn.close()