export type Focus = "behavioral" | "technical" | "case" | "mixed" | "product" | "execution" | "leadership";
export type QuestionType = "behavioral" | "technical" | "case" | "situational" | "system_design";

export interface Scores {
  clarity: number;
  relevance: number;
  depth: number;
  evidence: number;
  communication: number;
}

export interface EvalResult {
  turn: number;
  question: string;
  answer_summary: string;
  scores: Scores;
  overall: number;
  flags: string[];
  notes: string;
}

export interface Turn {
  question: string;
  questionType: QuestionType;
  topic: string;
  isFollowup: boolean;
  answer?: string;
  eval?: EvalResult;
}

export interface SessionState {
  id: string;
  role: string;
  background: string;
  focus: Focus;
  interview_mode?: "behavioral" | "technical" | "system_design";
  turn: number;
  maxTurns: number;
  difficulty: number;
  turns: Turn[];
  complete: boolean;
  createdAt: number;
}

export interface CoachReport {
  overall_score: number;
  score_by_dimension: Scores;
  top_strength: string;
  top_gap: string;
  priority_actions: string[];
  strengths: string[];
  growth_areas: string[];
  practice_plan: { week: number; title: string; items: string[] }[];
  role_fit?: string;
  markdown: string;
}

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  raw_text: string;
  quality_score?: number;
  tags?: string[];
}

export type RoundType = "hr_screen" | "technical" | "system_design" | "behavioral" | "culture_fit";

export interface InterviewRound {
  id: string;
  round_type: RoundType;
  title: string;
  description: string;
  session_id?: string;
  status: "pending" | "in_progress" | "completed";
}

export interface MetricFit {
  score: number;
  reasoning: string;
}

export interface DetailedFit {
  overall_score: number;
  stack_coverage: MetricFit;
  project_evidence: MetricFit;
  seniority_fit: MetricFit;
  red_flags: string[];
  project_rationale: string;
}

export interface TailoredDocuments {
  cover_letter: string;
  cold_email: string;
  linkedin_note: string;
}

export interface InterviewLoop {
  id: string;
  target_company: string;
  target_role: string;
  job_description: string;
  resume_text: string;
  fit_analysis?: DetailedFit;
  documents?: TailoredDocuments;
  rounds: InterviewRound[];
  created_at: string;
}
