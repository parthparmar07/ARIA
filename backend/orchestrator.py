"""ARIA AgentOrchestrator — holds and mutates SessionState across turns."""
from __future__ import annotations

import asyncio
from typing import AsyncGenerator

from anthropic import AsyncAnthropic

from agents.coach_agent import CoachAgent
from agents.evaluator_agent import EvaluatorAgent
from agents.interviewer_agent import InterviewerAgent
from models import CoachReport, QuestionMeta, SessionState, adjust_difficulty
from session_store import SessionStore


class AgentOrchestrator:
    def __init__(self, client: AsyncAnthropic, store: SessionStore):
        self.client = client
        self.store = store
        self.interviewer = InterviewerAgent(client)
        self.evaluator = EvaluatorAgent(client)
        self.coach = CoachAgent(client)

    async def begin_session(self, state: SessionState) -> QuestionMeta:
        """Generate the opening question and persist."""
        meta = await self.interviewer.next_question(state)
        state.question_history.append(meta)
        await self.store.set(state)
        return meta

    async def process_turn(
        self, session_id: str, answer: str
    ) -> AsyncGenerator[dict, None]:
        """Score the answer, adapt difficulty, stream next question."""
        state = await self.store.get(session_id)
        if state is None:
            yield {"type": "error", "message": "Session not found"}
            return

        last_question = state.last_question
        state.answer_history.append(answer)

        # Evaluator runs first (we need its result for difficulty + flags)
        eval_task = asyncio.create_task(
            self.evaluator.score_answer(last_question, answer, state)
        )
        eval_result = await eval_task

        state.eval_trace.append(eval_result)
        state.difficulty = adjust_difficulty(state.difficulty, eval_result.overall)
        state.turn += 1

        yield {"type": "eval", "result": eval_result.model_dump()}

        if state.turn >= state.max_turns:
            state.complete = True
            await self.store.set(state)
            yield {"type": "complete"}
            return

        # Stream next question
        meta_payload: dict | None = None
        async for chunk in self.interviewer.stream_next_question(state):
            if chunk["type"] == "meta":
                meta_payload = chunk["meta"]
                yield chunk
            else:
                yield chunk

        if meta_payload is not None:
            state.question_history.append(QuestionMeta(**meta_payload))
        await self.store.set(state)

    async def build_report(self, session_id: str) -> CoachReport | None:
        state = await self.store.get(session_id)
        if state is None:
            return None
        return await self.coach.generate_report(state)
