/**
 * Mock orchestrator — simulates the 3-agent backend client-side
 * so the Lovable preview is fully demoable without running the Python backend.
 *
 * Real mode: set VITE_API_URL and the api client routes to FastAPI.
 */
import type { CoachReport, EvalResult, Focus, Scores, SessionState, Turn } from "@/types";

const QUESTIONS: Record<Focus, { topic: string; q: string; type: Turn["questionType"] }[]> = {
  behavioral: [
    { topic: "Conflict", q: "Tell me about a time you disagreed with a teammate on a technical decision. How did you resolve it?", type: "behavioral" },
    { topic: "Failure", q: "Walk me through a project that didn't go as planned. What did you learn?", type: "behavioral" },
    { topic: "Leadership", q: "Describe a moment you had to influence without authority.", type: "behavioral" },
    { topic: "Ambiguity", q: "Tell me about the most ambiguous problem you've worked on. How did you make progress?", type: "behavioral" },
    { topic: "Impact", q: "What's a piece of work you're most proud of, and why does it matter?", type: "behavioral" },
  ],
  technical: [
    { topic: "Debugging", q: "Walk me through a time you debugged something that felt impossible to find. What was your process?", type: "technical" },
    { topic: "System Design", q: "How would you design a real-time notification system for 10M users?", type: "technical" },
    { topic: "Tradeoffs", q: "When would you reach for SQL vs a document store, and why?", type: "technical" },
    { topic: "Optimization", q: "A page loads in 4s and you need it under 1s. Where do you start?", type: "technical" },
    { topic: "Architecture", q: "Explain how you'd structure a frontend codebase that 30 engineers will touch.", type: "technical" },
  ],
  case: [
    { topic: "Product Sense", q: "Pick a product you use weekly. What's one feature you'd remove, and what would happen?", type: "case" },
    { topic: "Metrics", q: "A new feature launches and DAU drops 3%. How do you investigate?", type: "case" },
    { topic: "Strategy", q: "Your company has 6 months of runway. Which 2 bets do you make?", type: "case" },
    { topic: "Prioritization", q: "You have 5 strong feature ideas and capacity for 2. How do you choose?", type: "case" },
    { topic: "Tradeoffs", q: "Speed of shipping vs quality of polish — when does each win?", type: "case" },
  ],
  mixed: [
    { topic: "Past Work", q: "Walk me through your most technically demanding project end to end.", type: "behavioral" },
    { topic: "Debugging", q: "Tell me about a bug that taught you something foundational.", type: "technical" },
    { topic: "Product Sense", q: "How do you decide what's worth building?", type: "case" },
    { topic: "Conflict", q: "Describe a hard disagreement with a PM or designer. How did you handle it?", type: "behavioral" },
    { topic: "Scale", q: "How would you scale a feature from 1k to 1M users without rewriting it?", type: "technical" },
  ],
};

const FOLLOWUPS = [
  "Can you make that more concrete — what was the actual outcome, with numbers if you have them?",
  "Tell me more about your specific role there. What did *you* do versus the team?",
  "What would you do differently if you faced that again tomorrow?",
];

const PIVOTS = [
  "That's okay — let's approach this from a different angle.",
  "No worries. Let me ask something adjacent —",
  "Totally fair. Let's reframe:",
];

export function adjustDifficulty(current: number, score: number): number {
  const delta = (score - 0.5) * 0.3;
  return Math.max(0, Math.min(1, current + delta));
}

export function difficultyLabel(d: number): string {
  if (d < 0.3) return "Calibrating";
  if (d < 0.55) return "Standard";
  if (d < 0.8) return "Advanced";
  return "Expert";
}

/* ---------- Evaluator (heuristic, mimics LLM scoring) ---------- */
export function mockEvaluate(question: string, answer: string, turn: number): EvalResult {
  const a = answer.trim();
  const wc = a.split(/\s+/).filter(Boolean).length;
  const lc = a.toLowerCase();
  const dunno = /\b(i don'?t know|no idea|not sure|never|haven'?t)\b/.test(lc) && wc < 25;

  const hasNumbers = /\d/.test(a);
  const hasSpecifics = /(because|specifically|for example|e\.g\.|i\s+)/i.test(a);
  const hasStructure = /(first|second|then|finally|approach|process)/i.test(a) || a.includes(".") && wc > 40;
  const hasFrameworks = /(STAR|RICE|ICE|jobs[- ]to[- ]be[- ]done|MVP|tradeoff|hypothes)/i.test(a);

  const flags: string[] = [];
  let scores: Scores;

  if (dunno) {
    scores = { clarity: 0.3, relevance: 0.2, depth: 0.2, evidence: 0.2, communication: 0.4 };
    flags.push("knowledge_gap");
  } else if (wc < 15) {
    scores = { clarity: 0.4, relevance: 0.35, depth: 0.25, evidence: 0.2, communication: 0.45 };
    flags.push("shallow_depth", "vague_response");
  } else {
    const base = Math.min(0.95, 0.45 + wc / 220);
    scores = {
      clarity: clamp(base + (hasStructure ? 0.12 : -0.05)),
      relevance: clamp(base + (hasSpecifics ? 0.08 : -0.02)),
      depth: clamp(base + (hasFrameworks ? 0.15 : 0) + (wc > 80 ? 0.06 : -0.04)),
      evidence: clamp(base + (hasNumbers ? 0.18 : -0.12) + (hasSpecifics ? 0.05 : 0)),
      communication: clamp(base + 0.05),
    };
    if (!hasNumbers) flags.push("no_metrics");
    if (!hasStructure) flags.push("unstructured");
    if (wc < 40) flags.push("shallow_depth");
  }

  const overall = round(
    scores.clarity * 0.2 +
      scores.relevance * 0.25 +
      scores.depth * 0.25 +
      scores.evidence * 0.2 +
      scores.communication * 0.1,
  );

  return {
    turn,
    question,
    answer_summary: a.slice(0, 80) + (a.length > 80 ? "…" : ""),
    scores: roundScores(scores),
    overall,
    flags,
    notes: dunno
      ? "Honest acknowledgment of knowledge gap. Pivot to reasoning prompt."
      : flags.includes("shallow_depth")
        ? "Answer at the level of intention rather than method. Needs concrete example."
        : `Solid answer${hasNumbers ? " with quantification" : "; could add metrics"}.${hasFrameworks ? " Framework awareness present." : ""}`,
  };
}

const clamp = (x: number) => Math.max(0.05, Math.min(0.98, +x.toFixed(2)));
const round = (x: number) => +x.toFixed(2);
const roundScores = (s: Scores): Scores => ({
  clarity: round(s.clarity),
  relevance: round(s.relevance),
  depth: round(s.depth),
  evidence: round(s.evidence),
  communication: round(s.communication),
});

/* ---------- Interviewer ---------- */
export function mockNextQuestion(state: SessionState, lastEval?: EvalResult): Turn {
  const pool = QUESTIONS[state.focus];
  const used = new Set(state.turns.map((t) => t.topic));

  if (lastEval?.flags.includes("knowledge_gap")) {
    const next = pool.find((q) => !used.has(q.topic)) ?? pool[0];
    return {
      question: `${PIVOTS[state.turn % PIVOTS.length]} ${next.q}`,
      questionType: next.type,
      topic: next.topic,
      isFollowup: false,
    };
  }
  if (lastEval && (lastEval.flags.includes("shallow_depth") || lastEval.flags.includes("no_metrics")) && !state.turns.at(-1)?.isFollowup) {
    return {
      question: FOLLOWUPS[state.turn % FOLLOWUPS.length],
      questionType: state.turns.at(-1)?.questionType ?? "behavioral",
      topic: state.turns.at(-1)?.topic ?? "Follow-up",
      isFollowup: true,
    };
  }

  const next = pool.find((q) => !used.has(q.topic)) ?? pool[state.turn % pool.length];
  const harder = state.difficulty > 0.75;
  return {
    question: harder ? `${next.q} Now add a constraint: assume you have half the time and budget.` : next.q,
    questionType: next.type,
    topic: next.topic,
    isFollowup: false,
  };
}

/* ---------- Coach ---------- */
export function mockCoachReport(state: SessionState): CoachReport {
  const evals = state.turns.map((t) => t.eval!).filter(Boolean);
  const avg = (k: keyof Scores) =>
    round(evals.reduce((s, e) => s + e.scores[k], 0) / Math.max(1, evals.length));
  const dim: Scores = {
    clarity: avg("clarity"),
    relevance: avg("relevance"),
    depth: avg("depth"),
    evidence: avg("evidence"),
    communication: avg("communication"),
  };
  const overall = round(evals.reduce((s, e) => s + e.overall, 0) / Math.max(1, evals.length));

  const dimEntries = Object.entries(dim) as [keyof Scores, number][];
  const sorted = [...dimEntries].sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const bottom = sorted.at(-1)!;

  const strengths = [
    `Strongest dimension: ${capitalize(top[0])} (${(top[1] * 10).toFixed(1)}/10). You consistently delivered on this front across turns.`,
    evals.some((e) => e.flags.includes("knowledge_gap"))
      ? "Intellectual honesty when uncertain — a signal interviewers actively look for in senior candidates."
      : "Maintained composure and momentum across every turn without stalling.",
    evals.find((e) => e.overall > 0.7)
      ? `Standout moment on Turn ${evals.find((e) => e.overall > 0.7)!.turn}: "${evals.find((e) => e.overall > 0.7)!.answer_summary}"`
      : "Engaged each question with clear effort to address what was asked.",
  ];

  const growth = [
    `Lowest dimension: ${capitalize(bottom[0])} (${(bottom[1] * 10).toFixed(1)}/10). ${gapAdvice(bottom[0])}`,
    evals.filter((e) => e.flags.includes("no_metrics")).length > evals.length / 2
      ? "Pattern: answers rarely include concrete numbers. Practice quantifying every claim (%, time saved, users impacted)."
      : "Pattern: a few turns drifted from the specific question asked. Re-read the prompt before answering.",
    evals.filter((e) => e.flags.includes("shallow_depth")).length > 1
      ? "Several answers stayed at intention-level rather than method-level. Use STAR to force concreteness."
      : "Push for a second-order insight on each answer — what would you do *differently* next time?",
  ];

  const plan = [
    {
      week: 1,
      title: "Foundations & Framework",
      items: [
        "Master STAR method — write 5 polished STAR stories from your background",
        "Read 'Cracking the PM Interview' or 'Designing Data-Intensive Applications' (role-dependent)",
        "Record yourself answering 3 questions daily; review playback for filler words",
      ],
    },
    {
      week: 2,
      title: bottom[0] === "evidence" ? "Quantification & Specificity" : `Targeted reps on ${capitalize(bottom[0])}`,
      items: [
        "Rewrite each STAR story with explicit metrics (%, time, $, users)",
        "Mock interview with a peer; ask them to flag every vague claim",
        "Build a 'metrics inventory' from your last 3 projects",
      ],
    },
    {
      week: 3,
      title: "Pressure & Depth",
      items: [
        "Do 3 timed mock sessions back-to-back with no breaks",
        "Practice answering one question 3 ways: 60s, 2min, 5min depth",
        "Solicit harsh feedback from someone in your target role",
      ],
    },
    {
      week: 4,
      title: "Polish & Confidence",
      items: [
        "Run a full ARIA session again and compare scores to baseline",
        "Prepare 5 sharp questions to ask interviewers",
        "Visualize and rehearse opening + closing 30 seconds",
      ],
    },
  ];

  const markdown = buildMarkdown({ state, overall, dim, strengths, growth, plan });

  return {
    overall_score: overall,
    score_by_dimension: dim,
    top_strength: `Strong ${capitalize(top[0])}`,
    top_gap: `Build ${capitalize(bottom[0])}`,
    priority_actions: plan[0].items.slice(0, 3),
    strengths,
    growth_areas: growth,
    practice_plan: plan,
    markdown,
  };
}

function gapAdvice(k: keyof Scores) {
  return {
    clarity: "Structure every answer with a one-line thesis, then 2–3 supporting points.",
    relevance: "Restate the question in your own words before answering — it forces alignment.",
    depth: "Push past the first answer that comes to mind. Ask 'what's the second-order insight?'",
    evidence: "Anchor every claim with a number, an example, or an outcome. No exceptions.",
    communication: "Slow down by 20%. Replace filler words with deliberate pauses.",
  }[k];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildMarkdown(p: {
  state: SessionState;
  overall: number;
  dim: Scores;
  strengths: string[];
  growth: string[];
  plan: CoachReport["practice_plan"];
}) {
  return `## ARIA Coaching Report

### Overall Score: ${(p.overall * 10).toFixed(1)} / 10

### Strengths
${p.strengths.map((s) => `- ${s}`).join("\n")}

### Growth Areas
${p.growth.map((s) => `- ${s}`).join("\n")}

### Turn-by-Turn
${p.state.turns
  .map((t, i) => `| ${i + 1} | ${t.topic} | ${(t.eval?.overall ?? 0 * 10).toFixed(1)} | ${t.eval?.notes ?? ""} |`)
  .join("\n")}

### 30-Day Practice Plan
${p.plan.map((w) => `**Week ${w.week} — ${w.title}**\n${w.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")}
`;
}
