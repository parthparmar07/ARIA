"""Analyzer Agent — Assesses Resume vs Job Description match."""
from __future__ import annotations

import json
import os
from typing import Literal

from groq import AsyncGroq
from pydantic import BaseModel, Field

from utils import extract_json

_MODEL = os.environ.get("MODEL", "llama-3.1-8b-instant")

_SYSTEM_PROMPT = """You are an expert technical recruiter and hiring manager.
Your job is to analyze a candidate's resume against a specific Job Description.

Analyze the match and provide your evaluation strictly as a JSON object matching this schema:
{
  "match_score": <int between 0-100>,
  "strengths": [<list of strings, max 3, highlighting why they are a fit>],
  "gaps": [<list of strings, max 3, highlighting missing skills or experience>]
}

Keep your strengths and gaps concise and actionable.
Output ONLY JSON."""

class AnalysisResult(BaseModel):
    match_score: int
    strengths: list[str]
    gaps: list[str]

class AnalyzerAgent:
    def __init__(self, client: AsyncGroq):
        self.client = client

    async def analyze(self, resume_text: str, job_description: str) -> AnalysisResult:
        prompt = f"### Job Description:\n{job_description}\n\n### Resume:\n{resume_text}"
        
        resp = await self.client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        text = resp.choices[0].message.content
        data = extract_json(text)
        return AnalysisResult(**data)
