"""Novel Agents — additional specialized coaching personas."""
from __future__ import annotations

import os
from groq import AsyncGroq
from utils import extract_json

_MODEL = os.environ.get("MODEL", "llama-3.1-8b-instant")

class DeceptionDetectorAgent:
    def __init__(self, client: AsyncGroq):
        self.client = client

    async def check_claim(self, answer: str) -> dict:
        prompt = (
            "You are a 'Deception Detector' for interviews. Analyze the candidate's answer for "
            "statistically unlikely or grandiose claims (e.g., 'led a team of 50 as an intern', 'increased revenue 400%').\n\n"
            "Return JSON:\n"
            "{\n"
            '  "flags": ["list of suspicious claims"],\n'
            '  "credibility_score": 0.9\n'
            "}"
        )
        resp = await self.client.chat.completions.create(
        model=_MODEL,
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": answer}],
        temperature=0.2,
    )
        try:
            return extract_json(resp.choices[0].message.content)
        except Exception:
            return {"flags": [], "credibility_score": 1.0}

class DevilAdvocateAgent:
    def __init__(self, client: AsyncGroq):
        self.client = client

    async def generate_pushback(self, answer: str, context: str) -> str | None:
        prompt = (
            "Listen for vague, high-level answers where the candidate claims impact but doesn't explain HOW.\n"
            "If the answer is sufficiently detailed and technical, return 'NONE'.\n"
            "If it's vague, return a short, surgical, interrupting follow-up question asking for the exact technical 'how'.\n"
            "Keep it under 15 words."
        )
        resp = await self.client.chat.completions.create(
        model=_MODEL,
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": f"Question: {question}\nAnswer: {answer}"}],
        temperature=0.5,
    )
        text = resp.choices[0].message.content.strip()
        if not text or text == "NONE":
            return None
        return text

class DeliveryPacingAnalyst:
    def __init__(self, client: AsyncGroq):
        self.client = client

    async def analyze_delivery(self, delivery_metrics: dict) -> dict:
        prompt = (
            "You are a Delivery & Body Language Analyst.\n"
            "Analyze the given delivery metrics (WPM, filler word count, etc) for a single answer.\n"
            "Return JSON:\n"
            "{\n"
            '  "pacing_feedback": "You spoke at 160 WPM, which is slightly fast.",\n'
            '  "confidence_score": 0.8\n'
            "}"
        )
        resp = await self.client.chat.completions.create(
        model=_MODEL,
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": str(delivery_metrics)}],
        temperature=0.3,
    )
        try:
            return extract_json(resp.choices[0].message.content)
        except Exception:
            return {"pacing_feedback": "Delivery data inconclusive.", "confidence_score": 0.5}
