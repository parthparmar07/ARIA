"""ARIA FastAPI app — entry point."""
from __future__ import annotations

import json
import os
import uuid
import tempfile
from contextlib import asynccontextmanager

from groq import AsyncGroq
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import datetime

from models import Focus, SessionState
from orchestrator import AgentOrchestrator
from session_store import SessionStore

load_dotenv()

CORS_ORIGIN = os.environ.get("CORS_ORIGIN", "http://localhost:5173")
MAX_TURNS = int(os.environ.get("MAX_TURNS", "6"))
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY missing — see .env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = AsyncGroq(api_key=GROQ_API_KEY)
    app.state.store = SessionStore()
    app.state.orchestrator = AgentOrchestrator(app.state.client, app.state.store)
    yield


app = FastAPI(title="ARIA — Adaptive Role Intelligence for Interviews", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN, "*"] if CORS_ORIGIN == "*" else [CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request models ---


class StartRequest(BaseModel):
    session_id: str | None = None
    role: str = Field(min_length=1, max_length=200)
    background: str = Field(default="", max_length=2000)
    focus: Focus = "mixed"
    loop_id: str | None = None
    round_type: str | None = None


class AnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=8000)
    delivery_metrics: dict | None = None
    code: str | None = None

class CreateLoopRequest(BaseModel):
    resume_text: str
    job_description: str
    target_company: str
    target_role: str


# --- Routes ---


@app.get("/health")
async def health():
    return {"status": "ok", "service": "aria"}


@app.post("/session")
async def start_session(body: StartRequest):
    sid = body.session_id or uuid.uuid4().hex[:8]
    state = SessionState(
        session_id=sid,
        role=body.role,
        background=body.background,
        focus=body.focus,
        max_turns=MAX_TURNS,
        loop_id=body.loop_id,
        round_type=body.round_type,
    )
    await app.state.store.set(state)
    meta = await app.state.orchestrator.begin_session(state)
    return {
        "session_id": sid,
        "question": meta.question,
        "question_type": meta.question_type,
        "topic": meta.topic,
        "is_followup": meta.is_followup,
    }


@app.post("/session/{session_id}/answer")
async def submit_answer(session_id: str, body: AnswerRequest):
    state = await app.state.store.get(session_id)
    if state is None:
        raise HTTPException(404, "Session not found")

    async def event_stream():
        async for ev in app.state.orchestrator.process_turn(session_id, body.answer):
            yield f"data: {json.dumps(ev)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    state = await app.state.store.get(session_id)
    if state is None:
        raise HTTPException(404, "Session not found")
    return state.to_dict()


@app.get("/session/{session_id}/report")
async def get_report(session_id: str):
    report = await app.state.orchestrator.build_report(session_id)
    if report is None:
        raise HTTPException(404, "Session not found")
    return report.model_dump()


@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    await app.state.store.delete(session_id)
    return {"ok": True}


# --- Pipeline / Loops Mock Endpoints ---

_MOCK_LOOPS = {}

@app.post("/loops")
async def create_loop(body: CreateLoopRequest):
    loop_id = uuid.uuid4().hex[:8]
    loop = {
        "id": loop_id,
        "target_company": body.target_company,
        "target_role": body.target_role,
        "job_description": body.job_description,
        "resume_text": body.resume_text,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "rounds": [
            {
                "id": f"round-{uuid.uuid4().hex[:4]}",
                "round_type": "hr_screen",
                "title": "Recruiter Screen",
                "description": "Initial chat.",
                "status": "pending"
            }
        ],
        "fit_analysis": {
            "overall_score": 85,
            "stack_coverage": {"score": 90, "reasoning": "Strong match"},
            "project_evidence": {"score": 80, "reasoning": "Good evidence"},
            "seniority_fit": {"score": 85, "reasoning": "Appropriate"},
            "red_flags": [],
            "project_rationale": "Solid fit overall."
        },
        "documents": {
            "cover_letter": "Mock cover letter...",
            "cold_email": "Mock cold email...",
            "linkedin_note": "Mock linkedin note..."
        }
    }
    _MOCK_LOOPS[loop_id] = loop
    return loop

@app.get("/loops")
async def get_loops():
    return list(_MOCK_LOOPS.values())

@app.get("/loops/{loop_id}")
async def get_loop(loop_id: str):
    loop = _MOCK_LOOPS.get(loop_id)
    if not loop:
        raise HTTPException(404, "Loop not found")
    return loop

# --- Onboarding / Upload Mock Endpoint ---

@app.post("/onboarding/upload")
async def upload_document(file: UploadFile = File(...)):
    # Read text or PDF (mock implementation)
    content = await file.read()
    # In a real system we would use document_agent to parse PDF/text
    # For now, return mock text
    return {"text": f"Parsed resume from {file.filename}:\n\nSoftware Engineer with 5 years of experience..."}


# --- WebSocket Route for Real-Time Transcription ---

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    client: AsyncGroq = app.state.client
    try:
        while True:
            # Receive audio chunks from the frontend
            data = await websocket.receive_bytes()
            if not data:
                continue

            # Write the audio chunk to a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                temp_audio.write(data)
                temp_audio_path = temp_audio.name

            try:
                # Use Groq's whisper model for transcription
                with open(temp_audio_path, "rb") as file:
                    transcription = await client.audio.transcriptions.create(
                        file=(temp_audio_path, file.read()),
                        model="whisper-large-v3-turbo",
                        response_format="text",
                        language="en",
                    )
                
                # Send the transcription back to the client
                if transcription:
                    await websocket.send_json({"text": transcription.strip()})
            except Exception as e:
                print(f"Transcription error: {e}")
                await websocket.send_json({"error": "Transcription failed"})
            finally:
                if os.path.exists(temp_audio_path):
                    os.unlink(temp_audio_path)

    except WebSocketDisconnect:
        print("Client disconnected from WebSocket")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
