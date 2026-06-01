from dotenv import load_dotenv
from google import genai
from google.genai import types 
from pydantic import BaseModel, Field
import os
import json
import time

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class JobDataSchema(BaseModel):
    title: str | None = Field(default=None)
    company: str | None = Field(default=None)
    location: str | None = Field(default=None)
    job_type: str | None = Field(default=None)
    salary: str | None = Field(default=None)
    benefits: str | None = Field(default=None)
    description: str | None = Field(default=None)

def extract_job_data(raw_text: str, source_url: str) -> dict | None:
    prompt = f"Extract the job listing data from this webpage text:\n\n{raw_text[:4000]}"

    # Retry mechanism
    max_retries = 3
    retry_delay = 5  # Seconds to wait before trying again

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=JobDataSchema,
            ),
        )
            
            data = json.loads(response.text)
            data["source_url"] = source_url
            return data

        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower() or "limit" in str(e).lower():
                print(f"⚠️ Rate limit hit. Waiting {retry_delay} seconds (Attempt {attempt + 1}/{max_retries})...")
                time.sleep(retry_delay)
                retry_delay *= 2 # waits longer next time
                continue
            else:
                print(f"LLM call failed with unexpected error: {e}")
                return None

    print(f"Failed to extract data for {source_url} after {max_retries} attempts due to rate limits.")
    return None