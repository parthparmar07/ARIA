/**
 * API client. Routes to FastAPI when VITE_API_URL is set, otherwise uses
 * the in-browser mock orchestrator so the demo works out of the box.
 */
import type { EvalResult, SessionState, Turn, CoachReport, InterviewLoop } from "@/types";
import {
  adjustDifficulty,
  mockCoachReport,
  mockEvaluate,
  mockNextQuestion,
} from "./mock-orchestrator";
import { useSessionStore } from "@/store/session";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
export const USE_MOCK = !API_URL;

type Mode = "real" | "mock";
export const MODE: Mode = USE_MOCK ? "mock" : "real";

/* ---------- public API ---------- */

export async function startSession(state: SessionState, loopId?: string, roundType?: string): Promise<Turn> {
  if (USE_MOCK) {
    await delay(450);
    return mockNextQuestion(state);
  }
  const res = await fetch(`${API_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: state.id,
      role: state.role,
      background: state.background,
      focus: state.focus,
      loop_id: loopId,
      round_type: roundType,
    }),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const data = (await res.json()) as { question: string; question_type: Turn["questionType"]; topic: string; is_followup: boolean };
  return { question: data.question, questionType: data.question_type, topic: data.topic, isFollowup: data.is_followup };
}

/**
 * Submit answer, get evaluation + next question.
 * onToken streams the next question chunk by chunk.
 */
export async function submitAnswer(opts: {
  sessionId: string;
  answer: string;
  deliveryMetrics?: { wpm: number; filler_words: number };
  code?: string;
  onToken: (t: string) => void;
}): Promise<{ evalResult: EvalResult; nextTurn: Turn | null }> {
  const { sessionId, answer, deliveryMetrics, code, onToken } = opts;

  if (USE_MOCK) {
    const state = useSessionStore.getState().sessions[sessionId];
    const lastQ = state.turns.at(-1)?.question ?? "";
    await delay(350);
    const evalResult = mockEvaluate(lastQ, answer, state.turn);
    const newDifficulty = adjustDifficulty(state.difficulty, evalResult.overall);
    const newTurn = state.turn + 1;
    useSessionStore.getState().updateSession(sessionId, {
      turn: newTurn,
      difficulty: newDifficulty,
    });

    if (newTurn >= state.maxTurns) {
      return { evalResult, nextTurn: null };
    }

    const refreshed = useSessionStore.getState().sessions[sessionId];
    const nextTurn = mockNextQuestion(refreshed, evalResult);

    // Stream characters
    for (const ch of nextTurn.question) {
      onToken(ch);
      await delay(14);
    }
    return { evalResult, nextTurn };
  }

  // Real backend via SSE
  const res = await fetch(`${API_URL}/session/${sessionId}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answer, delivery_metrics: deliveryMetrics, code }),
  });
  if (!res.ok || !res.body) throw new Error(`Backend error: ${res.status}`);

  let evalResult: EvalResult | null = null;
  let nextTurnMeta: Partial<Turn> = {};
  let questionText = "";

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const events = buf.split("\n\n");
    buf = events.pop() ?? "";
    for (const ev of events) {
      const line = ev.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.type === "token") {
        questionText += payload.content;
        onToken(payload.content);
      } else if (payload.type === "eval") {
        evalResult = payload.result as EvalResult;
      } else if (payload.type === "meta") {
        nextTurnMeta = payload.meta;
      } else if (payload.type === "complete") {
        return { evalResult: evalResult!, nextTurn: null };
      }
    }
  }
  return {
    evalResult: evalResult!,
    nextTurn: questionText
      ? {
          question: questionText,
          questionType: (nextTurnMeta.questionType as Turn["questionType"]) ?? "behavioral",
          topic: nextTurnMeta.topic ?? "Follow-up",
          isFollowup: nextTurnMeta.isFollowup ?? false,
        }
      : null,
  };
}

export async function generateReport(sessionId: string): Promise<CoachReport> {
  if (USE_MOCK) {
    await delay(900);
    const state = useSessionStore.getState().sessions[sessionId];
    return mockCoachReport(state);
  }
  const res = await fetch(`${API_URL}/session/${sessionId}/report`);
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return (await res.json()) as CoachReport;
}

export async function createLoop(opts: {
  resume_text: string;
  job_description: string;
  target_company: string;
  target_role: string;
}): Promise<InterviewLoop> {
  const res = await fetch(`${API_URL}/loops`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return (await res.json()) as InterviewLoop;
}

export async function getLoops(): Promise<InterviewLoop[]> {
  const res = await fetch(`${API_URL}/loops`);
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return (await res.json()) as InterviewLoop[];
}

export async function getLoop(id: string): Promise<InterviewLoop> {
  const res = await fetch(`${API_URL}/loops/${id}`);
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  return (await res.json()) as InterviewLoop;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
