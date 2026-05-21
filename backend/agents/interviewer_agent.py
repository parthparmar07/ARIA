"""Interviewer Agent — drives the live session."""
from __future__ import annotations

import json
import os
from typing import AsyncGenerator

from groq import AsyncGroq

from models import QuestionMeta, SessionState
from utils import extract_json, load_prompt, render

_SYSTEM = load_prompt("interviewer")
_MODEL = os.environ.get("MODEL", "llama-3.1-8b-instant")


class InterviewerAgent:
    def __init__(self, client: AsyncGroq):
        self.client = client

    def _build_user_prompt(self, state: SessionState) -> str:
        topics = ", ".join({q.topic for q in state.question_history}) or "(none yet)"
        last_flags = (
            ", ".join(state.eval_trace[-1].flags) if state.eval_trace else "(none — first turn)"
        )
        return render(
            _SYSTEM,
            role=state.role,
            background=state.background or "(not provided)",
            focus=state.focus,
            difficulty=f"{state.difficulty:.2f}",
            turn=state.turn + 1,
            max_turns=state.max_turns,
            question_history_summary=topics,
            last_eval_flags=last_flags,
        )

    async def next_question(self, state: SessionState) -> QuestionMeta:
        """Non-streaming variant — returns parsed meta."""
        prompt = self._build_user_prompt(state)
        resp = await self.client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": "Generate the next question as JSON only. No prose around it.",
                }
            ],
            response_format={"type": "json_object"}
        )
        text = resp.choices[0].message.content
        data = extract_json(text)
        return QuestionMeta(**data)

    async def stream_next_question(
        self, state: SessionState
    ) -> AsyncGenerator[dict, None]:
        """Streams the question text token-by-token, then yields parsed meta.

        Strategy: we ask the model for JSON. We buffer until we can extract the
        "question" string, then stream characters of that field as tokens.
        At the end we emit {"type": "meta", ...} with the full QuestionMeta.
        """
        prompt = self._build_user_prompt(state)
        
        response_stream = await self.client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Generate the next question as JSON only."}
            ],
            stream=True,
            response_format={"type": "json_object"}
        )

        buffer = ""
        streamed_chars = 0
        question_started = False
        
        async for chunk in response_stream:
            text = chunk.choices[0].delta.content or ""
            buffer += text
            if not question_started and '"question"' in buffer:
                # Find opening quote of the value
                idx = buffer.find('"question"')
                after = buffer[idx + len('"question"') :]
                colon = after.find(":")
                if colon == -1:
                    continue
                rest = after[colon + 1 :].lstrip()
                if rest.startswith('"'):
                    question_started = True
                    # initial available chars after opening quote
                    prefix = rest[1:]
                    for ch in prefix:
                        if ch == '"':
                            question_started = False
                            break
                        yield {"type": "token", "content": ch}
                        streamed_chars += 1
            elif question_started:
                for ch in text:
                    if ch == '"':
                        question_started = False
                        break
                    yield {"type": "token", "content": ch}
                    streamed_chars += 1

        # Parse final JSON & yield meta
        try:
            data = extract_json(buffer)
            meta = QuestionMeta(**data)
        except Exception:
            meta = QuestionMeta(
                question=buffer[:300],
                question_type="behavioral",
                topic="General",
                is_followup=False,
            )
        yield {"type": "meta", "meta": json.loads(meta.model_dump_json())}
