from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

# Gemini 2.5 Flash model
model = genai.GenerativeModel(
    model_name="models/gemini-2.5-flash",
    generation_config={
        "temperature": 0.2,
        "response_mime_type": "application/json"
    }
)


class CodeInput(BaseModel):
    code: str
    temperature: float = Field(default=0.2, ge=0.0, le=1.0)


class Issue(BaseModel):
    type: str
    description: str
    severity: str


class CodeReviewResponse(BaseModel):
    summary: str
    issues: list[Issue]
    overall_risk: str


@app.post("/analyze", response_model=CodeReviewResponse)
def analyze_code(payload: CodeInput):

    # 1️⃣ Input guard (non-negotiable)
    if len(payload.code) > 10_000:
        raise HTTPException(
            status_code=400,
            detail="Code too large for analysis"
        )

    prompt = f"""
You are a senior backend engineer doing strict code review.

Return ONLY valid JSON.
NO markdown.
NO explanations.
NO extra text.

JSON format:
{{
  "summary": "string",
  "issues": [
    {{
      "type": "security | performance | readability | bug",
      "description": "string",
      "severity": "low | medium | high"
    }}
  ],
  "overall_risk": "low | medium | high"
}}

Code:
{payload.code}
"""

    try:
        response = model.generate_content(prompt)
        raw_output = response.text
        return json.loads(raw_output)

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="LLM returned invalid JSON"
        )
