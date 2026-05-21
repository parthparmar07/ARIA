"""In-memory session store for local dev."""
from __future__ import annotations

import json
from models import SessionState

SESSION_TTL = 60 * 60 * 24  # 24 hours

class SessionStore:
    def __init__(self, url: str | None = None):
        # We use a simple class-level dict so it survives across orchestrator instantiations 
        # in case Uvicorn reloads or lifespan creates new instances.
        if not hasattr(SessionStore, "_memory"):
            SessionStore._memory = {}

    async def get(self, session_id: str) -> SessionState | None:
        raw = SessionStore._memory.get(session_id)
        if not raw:
            return None
        return SessionState.from_dict(json.loads(raw))

    async def set(self, state: SessionState) -> None:
        SessionStore._memory[state.session_id] = json.dumps(state.to_dict())

    async def delete(self, session_id: str) -> None:
        SessionStore._memory.pop(session_id, None)
