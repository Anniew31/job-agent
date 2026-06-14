import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime
import json
from src.models import *
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
        CREATE TABLE IF NOT EXISTS profiles (
            id              SERIAL PRIMARY KEY,
            email           TEXT UNIQUE,
            password_hash   TEXT,
            name            TEXT,
            phone           TEXT,
            location        TEXT,
            websites        TEXT,
            positioning     TEXT,
            education       TEXT,
            experience      TEXT,
            projects        TEXT,
            skills          TEXT,
            target_roles    TEXT,
            role_type       TEXT,
            work_preference TEXT,
            salary_floor    INTEGER,
            salary_type     TEXT,
            deal_breakers   TEXT,
            created_at      TIMESTAMP,
            profile_complete BOOLEAN DEFAULT FALSE
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id              SERIAL PRIMARY KEY,
            profile_id      INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
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
            source_url      TEXT NOT NULL,
            scraped_at      TIMESTAMP,
            resume_path     TEXT,
            cover_letter_path TEXT,
            CONSTRAINT unique_job_per_profile UNIQUE(profile_id, source_url)
        )
    """)

    conn.commit()
    conn.close()

# creates a new profile
def create_profile(email, password_hash, profile_data: Profile) -> Profile:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO profiles (
            email, password_hash, name, phone, location, websites,
            positioning, education, experience, projects, skills,
            target_roles, role_type, work_preference, salary_floor,
            salary_type, deal_breakers, created_at
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING *
    """, (
        email,
        password_hash,
        profile_data.name,
        profile_data.phone,
        profile_data.location,
        json.dumps(profile_data.websites),
        profile_data.positioning,
        json.dumps(profile_data.education),
        json.dumps(profile_data.experience),
        json.dumps(profile_data.projects),
        json.dumps(profile_data.skills),
        json.dumps(profile_data.target_roles),
        profile_data.role_type,
        profile_data.work_preference,
        profile_data.salary_floor,
        profile_data.salary_type,
        json.dumps(profile_data.deal_breakers),
        datetime.now()
    ))
    conn.commit()
    row = cursor.fetchone()
    conn.close()
    if row is None:
        raise Exception("Profile creation failed — no row returned")
    profile = dict(row)
    for field in ["websites", "education", "experience", "projects", "target_roles", "deal_breakers"]:
        if profile.get(field):
            profile[field] = json.loads(profile[field])
    if profile.get("skills"):
        profile["skills"] = json.loads(profile["skills"])
    return Profile(**profile)

# creates empty profile for registration
def create_empty_profile(email, password_hash):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO profiles (email, password_hash, created_at)
        VALUES (%s, %s, %s)
        RETURNING *
    """, (email, password_hash, datetime.now()))

    conn.commit()
    row = cursor.fetchone()
    conn.close()

    if row is None:
        raise Exception("Profile creation failed — no row returned")

    return dict(row)

# updates profiles basic info
def update_basic_profile(profile_id: int, request: BasicProfileRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE profiles SET name = %s, phone = %s, location = %s, target_roles = %s, role_type = %s, work_preference = %s 
        WHERE id = %s
    """, (request.name, request.phone, request.location, json.dumps(request.target_roles), request.role_type, request.work_preference, profile_id))
    conn.commit()
    conn.close()
    return cursor.rowcount

# updates profile's professional info
def update_profile_professional(profile_id: int, request: ProfessionalProfileRequest):
    conn = get_connection()
    cursor = conn.cursor()              
    cursor.execute("UPDATE profiles SET positioning = %s, websites = %s, skills = %s WHERE id = %s", 
    (request.positioning, json.dumps([w.model_dump() for w in request.websites]), json.dumps(request.skills),profile_id))
    conn.commit()
    conn.close()
    return cursor.rowcount

# updates profile's education info
def update_profile_education(profile_id: int, request: EducationRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE profiles SET education = %s WHERE id = %s", (json.dumps([e.model_dump() for e in request.education]),profile_id))
    conn.commit()
    conn.close()
    return cursor.rowcount

# updates profile's experience
def update_profile_experience(profile_id: int, request: ExperienceRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE profiles SET experience = %s WHERE id = %s", (json.dumps([e.model_dump() for e in request.experience]),profile_id))
    conn.commit()
    conn.close()
    return cursor.rowcount

# updates profile's projects
def update_profile_projects(profile_id: int, request: ProjectsRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE profiles SET projects = %s WHERE id = %s", (json.dumps([e.model_dump() for e in request.projects]),profile_id))
    conn.commit()
    conn.close()
    return cursor.rowcount

# updates profile's preferences
def update_profile_preference(profile_id: int, request: PreferencesRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE profiles SET salary_floor = %s, salary_type = %s, deal_breakers = %s WHERE id = %s
    """, (request.salary_floor, request.salary_type, json.dumps(request.deal_breakers), profile_id))
    conn.commit()
    conn.close()
    return cursor.rowcount

# changes value in database to indicate profile is complete
def update_profile_complete(profile_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE profiles SET profile_complete = TRUE WHERE id = %s", (profile_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount

# gets profile with a matching email
def get_profile_by_email(email: str) -> dict | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE email = %s", (email,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

# gets profile with matching id
def get_profile_by_id(id: int) -> Profile | None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM profiles WHERE id = %s", (id,))
    row = cursor.fetchone()
    conn.close()
    if not row: 
        return None
    else:
        profile = dict(row)
        for field in ["websites", "education", "experience", "projects", "target_roles", "deal_breakers"]:
            if profile.get(field):
                profile[field] = json.loads(profile[field])
        if profile.get("skills"):
            profile["skills"] = json.loads(profile["skills"])
        return Profile(**profile)
    
# calculates the needed dashboard metrics
# pending = new jobs awaiting AI scoring, scored = scored, waiting for user swipe
# accepted = user accepted it, applied = user applied for job
def get_metrics(id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as scraped_count,
            COALESCE(SUM(CASE WHEN status = 'scored' THEN 1 ELSE 0 END), 0) as reviewed_count,
            COALESCE(SUM(CASE WHEN status IN ('accepted') THEN 1 ELSE 0 END), 0) as accepted_count,
            COALESCE(SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END), 0) as applied_count,
            COALESCE(ROUND(AVG(score), 1), 0.0) as avg_score
        FROM jobs WHERE profile_id = %s""", (id,))
    row = cursor.fetchone()    
    cursor.close()
    conn.close()

    if row:
        metrics = dict(row)
        metrics["avg_score"] = float(metrics["avg_score"]) if metrics.get("avg_score") is not None else 0.0
        return metrics
    return {
        "scraped_count": 0,
        "reviewed_count": 0,
        "accepted_count": 0,
        "applied_count": 0,
        "avg_score": 0.0
    }

# gets the most recently scraped jobs
def get_recent_jobs(profile_id: int, limit: int = 10) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, company, score, status
        FROM jobs 
        WHERE profile_id = %s
        ORDER BY id DESC 
        LIMIT %s
    """, (profile_id, limit))
    
    rows = cursor.fetchall()
    
    cursor.close()
    conn.close()

    return [dict(row) for row in rows] if rows else []


# inserts jobs into databse
def insert_job(profile_id, title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO jobs (profile_id, title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT ON CONSTRAINT unique_job_per_profile DO NOTHING
        """, (profile_id, title, company, location, job_type, job_min_salary, job_max_salary, benefits, description, source_url, datetime.now()))
        conn.commit()
    finally:
        conn.close()

# gets only jobs with certain status
def fetch_jobs_by_status(profile_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE status = %s AND profile_id = %s", (status,profile_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# update job status to either reviewed or rejected
def update_job_status(profile_id, job_id, status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET status = %s WHERE id = %s AND profile_id = %s", (status, job_id, profile_id,))
    conn.commit()
    conn.close()

# update the score and reasoning given by ai 
def update_job_score(profile_id, job_id, score, reasoning):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE jobs SET score = %s, score_reasoning = %s WHERE id = %s AND profile_id = %s", (score, reasoning, job_id, profile_id,))
    conn.commit()
    conn.close()

# update to paths of generated resume and cover letter
def update_job_output(profile_id, job_id, resume_path, cover_letter_path):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE jobs SET resume_path = %s, cover_letter_path = %s WHERE id = %s AND profile_id = %s",
        (resume_path, cover_letter_path, job_id, profile_id)
    )
    conn.commit()
    conn.close()

# gets all jobs in database for a profile
def fetch_all_jobs(profile_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE profile_id = %s ORDER BY scraped_at DESC", (profile_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# gets a job with a certain id for a profile
def get_job(job_id: int, profile_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE id = %s AND profile_id = %s", (job_id, profile_id,))
    job = cursor.fetchone()
    conn.close()
    return dict(job) if job else None

# returns daily counts for the visual trend chart for a week
def get_finder_chart_data(profile_id: int) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                TO_CHAR(scraped_at::timestamp, 'Mon DD') as formatted_date,
                COUNT(id) as jobs_found
            FROM jobs
            WHERE profile_id = %s AND scraped_at IS NOT NULL
            GROUP BY TO_CHAR(scraped_at::timestamp, 'Mon DD'), DATE_TRUNC('day', scraped_at::timestamp)
            ORDER BY DATE_TRUNC('day', scraped_at::timestamp) DESC
            LIMIT 7
        """, (profile_id,))
        rows = cursor.fetchall()
        history = [dict(row) for row in rows] if rows else []
        history.reverse()
        return history
    except Exception as db_err:
        print(f"Database Query Error inside get_finder_chart_data: {db_err}")
        return []
    finally:
        cursor.close()
        conn.close()