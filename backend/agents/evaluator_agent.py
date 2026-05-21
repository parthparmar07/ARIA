"""Evaluator Agent — silent scoring."""
from __future__ import annotations

import os

from groq import AsyncGroq

from models import EvalResult, SessionState
from utils import extract_json, load_prompt, render

_SYSTEM = load_prompt("evaluator")
_MODEL = os.environ.get("MODEL", "llama-3.1-8b-instant")
_MAX_RETRIES = 2


class EvaluatorAgent:
    def __init__(self, client: AsyncGroq):
        self.client = client

    async def score_answer(
        self, question: str, answer: str, state: SessionState
    ) -> EvalResult:
        prompt = render(
            _SYSTEM,
            question=question,
            answer=answer,
            role=state.role,
            focus=state.focus,
            turn=state.turn + 1,
        )

        last_err: Exception | None = None
        for _ in range(_MAX_RETRIES + 1):
            try:
                resp = await self.client.chat.completions.create(
                    model=_MODEL,
                    temperature=0.7,
                    messages=[
                        {"role": "system", "content": prompt},
                        {
                            "role": "user",
                            "content": (
                                f"QUESTION: {question}\n\nANSWER: {answer}\n\n"
                                "Return ONLY the JSON object. No markdown fences."
                            ),
                        }
                    ],
                    response_format={"type": "json_object"}
                )
                data = extract_json(resp.choices[0].message.content)
                return EvalResult(**data)
            except Exception as e:
                last_err = e
        # Fall through: return a safe default rather than crashing the turn
        return EvalResult(
            turn=state.turn + 1,
            question=question,
            answer_summary=answer[:80],
            scores={
                "clarity": 0.5,
                "relevance": 0.5,
                "depth": 0.5,
                "evidence": 0.5,
                "communication": 0.5,
            },
            overall=0.5,
            flags=["eval_parse_failed"],
            notes=f"Evaluator could not parse output. Raw error: {last_err}",
        )
