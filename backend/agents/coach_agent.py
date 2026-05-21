"""Coach Agent — end-of-session synthesis."""
from __future__ import annotations

import json
import os

from groq import AsyncGroq

from models import CoachReport, SessionState
from utils import extract_json, load_prompt, render

_SYSTEM = load_prompt("coach")
_MODEL = os.environ.get("MODEL", "llama-3.1-8b-instant")


class CoachAgent:
    def __init__(self, client: AsyncGroq):
        self.client = client

    async def generate_report(self, state: SessionState) -> CoachReport:
        eval_trace_json = json.dumps(
            [e.model_dump() for e in state.eval_trace], indent=2
        )
        avg_score = (
            sum(e.overall for e in state.eval_trace) / max(1, len(state.eval_trace))
        )
        prompt = render(
            _SYSTEM,
            role=state.role,
            focus=state.focus,
            total_turns=len(state.eval_trace),
            avg_score=f"{avg_score:.2f}",
            eval_trace_json=eval_trace_json,
        )

        resp = await self.client.chat.completions.create(
            model=_MODEL,
            temperature=0.7,
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": (
                        "Produce the coaching report now. Output the full Markdown "
                        "followed by a fenced ```json``` block with the summary."
                    ),
                }
            ],
        )
        text = resp.choices[0].message.content

        # Split markdown from JSON summary
        json_block = ""
        markdown = text
        if "```json" in text:
            head, _, rest = text.partition("```json")
            body, _, _tail = rest.partition("```")
            markdown = head.strip()
            json_block = body.strip()

        summary = {}
        if json_block:
            try:
                summary = extract_json(json_block)
            except Exception:
                summary = {}

        # Build report — fall back to derived values if model didn't include all keys
        score_by_dim = summary.get("score_by_dimension") or _avg_dims(state)
        overall = summary.get("overall_score", avg_score)
        # parse strengths / growth from markdown headers if not in JSON
        strengths = _section(markdown, "Strengths") or summary.get("strengths", [])
        growth = _section(markdown, "Growth Areas") or summary.get("growth_areas", [])
        plan = _parse_plan(markdown) or summary.get("practice_plan", [])

        return CoachReport(
            overall_score=overall,
            score_by_dimension=score_by_dim,
            top_strength=summary.get("top_strength", "See markdown report"),
            top_gap=summary.get("top_gap", "See markdown report"),
            priority_actions=summary.get("priority_actions", [])[:3],
            strengths=strengths,
            growth_areas=growth,
            practice_plan=plan,
            markdown=markdown,
        )


def _avg_dims(state: SessionState) -> dict:
    if not state.eval_trace:
        return {k: 0.5 for k in ["clarity", "relevance", "depth", "evidence", "communication"]}
    keys = ["clarity", "relevance", "depth", "evidence", "communication"]
    return {
        k: round(
            sum(getattr(e.scores, k) for e in state.eval_trace) / len(state.eval_trace),
            2,
        )
        for k in keys
    }


def _section(md: str, header: str) -> list[str]:
    """Pull bullets under a header until the next header."""
    import re

    pattern = rf"###?\s*{re.escape(header)}.*?\n(.*?)(?=\n###?\s|\Z)"
    m = re.search(pattern, md, re.S | re.I)
    if not m:
        return []
    return [
        line.lstrip("-•* ").strip()
        for line in m.group(1).splitlines()
        if line.strip().startswith(("-", "*", "•"))
    ]


def _parse_plan(md: str) -> list[dict]:
    import re

    weeks = []
    pattern = r"\*\*Week\s+(\d+)\s*[—:-]\s*([^*\n]+)\*\*\s*\n((?:.*\n?)+?)(?=\*\*Week|\Z)"
    for m in re.finditer(pattern, md, re.I):
        week_num = int(m.group(1))
        title = m.group(2).strip()
        items = [
            line.lstrip("-•* ").strip()
            for line in m.group(3).splitlines()
            if line.strip().startswith(("-", "*", "•"))
        ]
        if items:
            weeks.append({"week": week_num, "title": title, "items": items})
    return weeks
