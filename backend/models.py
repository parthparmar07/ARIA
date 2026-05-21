"""ARIA — Pydantic models shared by all agents."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel, Field

Focus = Literal["behavioral", "technical", "case", "mixed", "product", "execution", "leadership"]
QuestionType = Literal["behavioral", "technical", "case", "situational", "system_design"]


class Scores(BaseModel):
    clarity: float = Field(ge=0.0, le=1.0)
    relevance: float = Field(ge=0.0, le=1.0)
    depth: float = Field(ge=0.0, le=1.0)
    evidence: float = Field(ge=0.0, le=1.0)
    communication: float = Field(ge=0.0, le=1.0)


class EvalResult(BaseModel):
    turn: int
    question: str
    answer_summary: str
    scores: Scores
    overall: float = Field(ge=0.0, le=1.0)
    flags: list[str] = Field(default_factory=list)
    notes: str


class QuestionMeta(BaseModel):
    question: str
    question_type: QuestionType
    topic: str
    is_followup: bool = False


@dataclass
class SessionState:
    session_id: str
    role: str
    background: str
    focus: Focus
    turn: int = 0
    max_turns: int = 6
    difficulty: float = 0.5
    question_history: list[QuestionMeta] = field(default_factory=list)
    answer_history: list[str] = field(default_factory=list)
    eval_trace: list[EvalResult] = field(default_factory=list)
    complete: bool = False
    loop_id: str | None = None
    round_type: str | None = None
    interview_mode: str | None = None

    @property
    def last_question(self) -> str:
        return self.question_history[-1].question if self.question_history else ""

    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "role": self.role,
            "background": self.background,
            "focus": self.focus,
            "turn": self.turn,
            "max_turns": self.max_turns,
            "difficulty": self.difficulty,
            "question_history": [q.model_dump() for q in self.question_history],
            "answer_history": self.answer_history,
            "eval_trace": [e.model_dump() for e in self.eval_trace],
            "complete": self.complete,
            "loop_id": self.loop_id,
            "round_type": self.round_type,
            "interview_mode": self.interview_mode,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "SessionState":
        return cls(
            session_id=d["session_id"],
            role=d["role"],
            background=d["background"],
            focus=d["focus"],
            turn=d["turn"],
            max_turns=d["max_turns"],
            difficulty=d["difficulty"],
            question_history=[QuestionMeta(**q) for q in d["question_history"]],
            answer_history=d["answer_history"],
            eval_trace=[EvalResult(**e) for e in d["eval_trace"]],
            complete=d["complete"],
            loop_id=d.get("loop_id"),
            round_type=d.get("round_type"),
            interview_mode=d.get("interview_mode"),
        )


class CoachReport(BaseModel):
    overall_score: float
    score_by_dimension: Scores
    top_strength: str
    top_gap: str
    priority_actions: list[str]
    strengths: list[str]
    growth_areas: list[str]
    practice_plan: list[dict]
    markdown: str


def adjust_difficulty(current: float, score: float) -> float:
    """Smooth EMA — no jarring jumps."""
    delta = (score - 0.5) * 0.3
    return max(0.0, min(1.0, current + delta))
