import sqlite3
import json

# fetches data and maps to dictionary keys
def get_all_jobs_from_db():
    conn = sqlite3.connect("job_agent.db")
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM jobs")
        rows = cursor.fetchall()
        
        if not rows:
            return []
            
        columns = [description[0] for description in cursor.description]
        jobs_list = [dict(zip(columns, row)) for row in rows]
        return jobs_list
        
    except sqlite3.OperationalError as e:
        print(f"Database error: {e}")
        return []
    finally:
        conn.close()

# Formats and prints the stored jobs
def view_as_json():
    jobs = get_all_jobs_from_db()
    
    if not jobs:
        print("No data found in 'job_agent.db' to convert to JSON.")
        return
        
    print(f"DEBUGGING RAW JSON PAYLOADS ({len(jobs)} total)")
    
    for idx, job in enumerate(jobs, 1):
        print(f"[JOB RECORD #{idx}]")
        
    
        job.pop('id', None) 
        
        json_output = json.dumps(job, indent=4, ensure_ascii=False)
        print(json_output)
        print("=" * 50)

# Prints a list of jobs
def view_simple_list():
    jobs = get_all_jobs_from_db()
    if not jobs:
        return
    print(f"LIST ({len(jobs)} total)")
    for idx, job in enumerate(jobs, 1):
        print(f"{idx}. {job.get('title')} - {job.get('company')} ({job.get('location')})")

if __name__ == "__main__":
    view_as_json()