import os
from dotenv import load_dotenv
from google import genai
from google.genai import types 
from pydantic import BaseModel, Field
import time
import json

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class JobScoreSchema(BaseModel):
    score: int
    reasoning: str
    deal_breaker: bool | None = Field(default= False)
    deal_breaker_reason: str | None = Field(default=None)
# uses gemini to score the job based on profile
def score_job(prompt: str) -> dict | None:

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
                response_schema=JobScoreSchema,
            ),
            )
            
            data = json.loads(response.text or "{}")
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

    print(f"Failed to score after {max_retries} attempts due to rate limits.")
    return None