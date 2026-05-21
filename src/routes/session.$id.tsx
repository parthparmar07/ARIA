import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Sparkles, CheckCircle2, Camera, MicOff, Terminal, Clock, Volume2, Wifi, WifiOff } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Nav } from "@/components/Nav";
import { useSessionStore } from "@/store/session";
import { startSession, submitAnswer, generateReport } from "@/lib/api";
import type { Turn, Scores } from "@/types";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ScoreBar } from "@/components/ScoreRing";
import { useVoiceWS } from "@/hooks/use-voice-ws";

const EMPTY_SCORES: Scores = { clarity: 0, relevance: 0, depth: 0, evidence: 0, communication: 0 };

export default function SessionPage() {
  const { id } = useParams() as { id: string };
  const nav = useNavigate();
  const session = useSessionStore((s) => s.sessions[id]);
  const appendTurn = useSessionStore((s) => s.appendTurn);
  const setReport = useSessionStore((s) => s.setReport);
  const updateSession = useSessionStore((s) => s.updateSession);

  const [currentTurn, setCurrentTurn] = useState<Turn | null>(null);
  const [streamed, setStreamed] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState("# Write your solution here...\n");
  const [phase, setPhase] = useState<"loading" | "thinking" | "asking" | "answering" | "scoring" | "done">("loading");
  const [aggregated, setAggregated] = useState<Scores>(EMPTY_SCORES);
  const [topics, setTopics] = useState<string[]>([]);
  const [questionTimer, setQuestionTimer] = useState(0);
  const timerRef = useRef<any>(null);
  const startedRef = useRef(false);

  // Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const [wpm, setWpm] = useState(0);
  const [fillerWords, setFillerWords] = useState(0);
  const speakingStartTimeRef = useRef<number | null>(null);
  const wordCountAtStartRef = useRef(0);
  const [micError, setMicError] = useState<string | null>(null);

  // WebSocket voice
  const { isListening, supported: wsSupported, startListening, stopListening } = useVoiceWS({
    onTranscript: (text) => {
      setAnswer((prev) => {
        const newAns = (prev + " " + text).trim();
        const fillerMatch = newAns.match(/\b(um|uh|like|you know|basically|literally|sort of|kind of)\b/gi);
        setFillerWords(fillerMatch ? fillerMatch.length : 0);
        return newAns;
      });
    },
    onError: (msg) => setMicError(msg),
  });

  // TTS for reading questions aloud
  const speakQuestion = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Google UK") || v.name.includes("Daniel") || v.lang === "en-GB");
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
  }, []);

  // Initialize camera only
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(() => {});
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // WPM tracker
  useEffect(() => {
    let interval: any;
    if (isListening && speakingStartTimeRef.current) {
      interval = setInterval(() => {
        const currentWords = answer.trim().split(/\s+/).filter(Boolean).length;
        const wordsAdded = currentWords - wordCountAtStartRef.current;
        const mins = (Date.now() - speakingStartTimeRef.current!) / 60000;
        if (mins > 0 && wordsAdded > 0) setWpm(Math.round(wordsAdded / mins));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening, answer]);

  // Question timer
  useEffect(() => {
    if (phase === "answering") {
      setQuestionTimer(0);
      timerRef.current = setInterval(() => setQuestionTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, currentTurn]);

  const toggleListen = () => {
    if (isListening) {
      stopListening();
    } else {
      speakingStartTimeRef.current = Date.now();
      wordCountAtStartRef.current = answer.trim().split(/\s+/).filter(Boolean).length;
      setMicError(null);
      startListening();
    }
  };

  // Bootstrap first question
  useEffect(() => {
    if (!session || startedRef.current) return;
    startedRef.current = true;
    (async () => {
      setPhase("thinking");
      const first = await startSession(session);
      setCurrentTurn(first);
      setStreamed("");
      setIsStreaming(true);
      setPhase("asking");
      for (const ch of first.question) {
        await new Promise((r) => setTimeout(r, 14));
        setStreamed((s) => s + ch);
      }
      setIsStreaming(false);
      setPhase("answering");
      // Auto-speak the question
      speakQuestion(first.question);
    })();
  }, [session, speakQuestion]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <h1 className="font-display text-3xl text-mahogany">Session not found</h1>
            <p className="mt-2 text-mahogany-soft text-sm">It may have expired. Start a new one.</p>
            <button onClick={() => nav("/setup")} className="aria-btn-primary mt-6">New session</button>
          </div>
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (!answer.trim() || !currentTurn || phase !== "answering") return;
    const trimmed = answer.trim();
    setPhase("scoring");
    if (isListening) { stopListening(); }

    const turnWithAnswer = { ...currentTurn, answer: trimmed };
    appendTurn(id, turnWithAnswer);
    setAnswer("");
    setStreamed("");
    setIsStreaming(true);

    const { evalResult, nextTurn } = await submitAnswer({
      sessionId: id,
      answer: trimmed,
      deliveryMetrics: { wpm, filler_words: fillerWords },
      code: session.interview_mode === "technical" ? code : undefined,
      onToken: (t) => setStreamed((s) => s + t),
    });
    setIsStreaming(false);

    const updated = useSessionStore.getState().sessions[id];
    const turns = [...updated.turns];
    turns[turns.length - 1] = { ...turns[turns.length - 1], eval: evalResult };
    updateSession(id, { turns });

    const evals = turns.map((t) => t.eval).filter(Boolean) as NonNullable<Turn["eval"]>[];
    setAggregated({
      clarity: avg(evals.map((e) => e.scores.clarity)),
      relevance: avg(evals.map((e) => e.scores.relevance)),
      depth: avg(evals.map((e) => e.scores.depth)),
      evidence: avg(evals.map((e) => e.scores.evidence)),
      communication: avg(evals.map((e) => e.scores.communication)),
    });
    setTopics((prev) => Array.from(new Set([...prev, turnWithAnswer.topic])));

    if (!nextTurn) {
      setPhase("done");
      updateSession(id, { complete: true });
      const report = await generateReport(id);
      setReport(id, report);
      setTimeout(() => nav(`/session/${id}/report`), 800);
      return;
    }

    setCurrentTurn(nextTurn);
    setPhase("answering");
    speakQuestion(nextTurn.question);
  };

  const turnNum = session.turns.length + (phase === "answering" ? 1 : 0);
  const timerColor = questionTimer > 120 ? "text-red-500" : questionTimer > 60 ? "text-accent-amber" : "text-accent-sage";
  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
          {/* LEFT — conversation */}
          <section>
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="aria-pill" data-active="true">{session.role}</span>
                <span className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
                  turn {Math.max(1, Math.min(turnNum, session.maxTurns))} of {session.maxTurns}
                </span>
                {session.interview_mode && (
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: "oklch(0.93 0.04 60)", color: "var(--accent-rust)" }}>
                    {session.interview_mode}
                  </span>
                )}
              </div>
              <DifficultyBadge difficulty={session.difficulty} />
            </header>

            {/* Previous turns */}
            <div className="space-y-4 mb-4">
              {session.turns.slice(0, -1).map((t, i) => (
                <TurnCard key={i} turn={t} index={i + 1} />
              ))}
            </div>

            {/* Current question card */}
            {currentTurn && (
              <motion.div
                key={currentTurn.question.slice(0, 24)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="aria-card p-6 mb-4 border-l-4 border-accent-rust"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-mahogany text-cream flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
                      ARIA · {currentTurn.questionType}
                      {currentTurn.isFollowup && " · follow-up"}
                    </span>
                  </div>
                  {phase === "answering" && (
                    <div className={`flex items-center gap-1.5 font-mono text-sm ${timerColor}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {formatTimer(questionTimer)}
                    </div>
                  )}
                </div>
                <p className={`font-display text-xl md:text-2xl text-mahogany leading-snug ${isStreaming ? "cursor-blink" : ""}`}>
                  {streamed}
                </p>
                {!isStreaming && currentTurn && (
                  <button
                    onClick={() => speakQuestion(currentTurn.question)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-warm-muted hover:text-mahogany transition-colors"
                  >
                    <Volume2 className="w-3 h-3" /> Read aloud
                  </button>
                )}
              </motion.div>
            )}

            {/* Answer area */}
            <div className="aria-card p-5">
              {session.interview_mode === "technical" && (
                <div className="border border-card-border rounded-xl overflow-hidden mb-4">
                  <div className="bg-warm-white px-4 py-2 border-b border-card-border flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-warm-muted" />
                    <span className="text-[0.65rem] font-mono uppercase tracking-wider text-warm-muted">Live Coding Environment</span>
                  </div>
                  <Editor
                    height="300px"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || "")}
                    options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: "on" }}
                  />
                </div>
              )}

              <label className="font-mono text-[0.7rem] uppercase tracking-wider text-mahogany">
                Your answer
              </label>

              {isListening && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center gap-2 mt-2 mb-1 text-xs text-red-500 font-mono"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <Wifi className="w-3 h-3" /> Streaming to Whisper AI…
                </motion.div>
              )}

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={phase !== "answering"}
                placeholder={
                  phase === "answering"
                    ? "Take your time. Structure helps. Specifics win.\n\nTip: Click Speak — your voice streams live to Whisper AI."
                    : "ARIA is evaluating and preparing the next question…"
                }
                rows={6}
                className="w-full mt-2 bg-transparent outline-none text-mahogany resize-none placeholder:text-warm-muted/70 disabled:opacity-60"
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
              />

              {micError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><WifiOff className="w-3 h-3" /> {micError}</p>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-card-border">
                <p className="text-xs text-warm-muted flex items-center gap-2">
                  {phase === "scoring" && (
                    <><Sparkles className="w-3.5 h-3.5 animate-pulse text-accent-rust" /> Evaluating…</>
                  )}
                  {phase === "answering" && (
                    <><kbd className="font-mono text-[0.65rem] px-1.5 py-0.5 rounded border border-card-border">⌘</kbd>
                    <kbd className="font-mono text-[0.65rem] px-1.5 py-0.5 rounded border border-card-border">↵</kbd> to submit</>
                  )}
                  {phase === "done" && (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-accent-sage" /> Session complete · generating report…</>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={toggleListen}
                    disabled={phase !== "answering"}
                    title={!wsSupported ? "Backend offline — voice unavailable" : undefined}
                    className={`inline-flex items-center gap-2 text-sm py-2.5 px-4 rounded-lg font-medium transition-all ${
                      isListening
                        ? "bg-red-500 text-white shadow-lg scale-105"
                        : "bg-warm-white text-mahogany hover:bg-card-border border border-card-border"
                    } disabled:opacity-40`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {isListening ? "Stop" : "Speak"}
                    {!wsSupported && <WifiOff className="w-3 h-3 text-warm-muted" />}
                  </button>
                  <button
                    onClick={submit}
                    disabled={!answer.trim() || phase !== "answering"}
                    className="aria-btn-primary inline-flex items-center gap-2 text-sm py-2.5 disabled:opacity-50"
                  >
                    Submit
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT — signals & camera */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            <div className="aria-card overflow-hidden">
              <header className="p-4 flex items-center justify-between border-b border-card-border">
                <span className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5" /> Camera Preview
                </span>
                {phase === "answering" && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                    className="flex items-center gap-1 text-[0.6rem] font-mono text-red-500"
                  >
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> REC
                  </motion.span>
                )}
              </header>
              <div className="bg-mahogany aspect-video relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {isListening && (
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 border-4 border-red-500 rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="aria-card p-5">
              <header className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">session signals</p>
                  <h3 className="font-display text-lg text-mahogany mt-0.5">Live Metrics</h3>
                </div>
                <span className="text-[0.65rem] font-mono uppercase tracking-wider text-accent-sage flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-sage animate-pulse" /> live
                </span>
              </header>
              <div className="flex gap-4 mb-4 pb-4 border-b border-card-border">
                <div className="flex-1 bg-warm-white rounded-lg p-3 text-center border border-card-border">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-warm-muted">WPM</p>
                  <p className={`font-display text-2xl ${wpm > 180 ? 'text-red-500' : wpm > 80 ? 'text-accent-sage' : 'text-mahogany'}`}>{wpm}</p>
                </div>
                <div className="flex-1 bg-warm-white rounded-lg p-3 text-center border border-card-border">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-warm-muted">Fillers</p>
                  <p className={`font-display text-2xl ${fillerWords > 5 ? 'text-red-500' : 'text-mahogany'}`}>{fillerWords}</p>
                </div>
                <div className="flex-1 bg-warm-white rounded-lg p-3 text-center border border-card-border">
                  <p className="font-mono text-[0.6rem] uppercase tracking-wider text-warm-muted">Time</p>
                  <p className={`font-display text-xl ${timerColor}`}>{formatTimer(questionTimer)}</p>
                </div>
              </div>
              <div className="space-y-3">
                <ScoreBar value={aggregated.clarity} label="Clarity" />
                <ScoreBar value={aggregated.relevance} label="Relevance" />
                <ScoreBar value={aggregated.depth} label="Depth" />
                <ScoreBar value={aggregated.evidence} label="Evidence" />
                <ScoreBar value={aggregated.communication} label="Communication" />
              </div>
            </div>

            <div className="aria-card p-5">
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted mb-3">topics covered</p>
              <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                <AnimatePresence>
                  {topics.length === 0 && <span className="text-xs text-warm-muted italic">None yet</span>}
                  {topics.map((t) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="aria-pill text-xs"
                    >
                      {t}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <p className="text-[0.7rem] text-warm-muted text-center px-4">
              Your answers are private. Sessions auto-delete in 24h.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function TurnCard({ turn, index }: { turn: Turn; index: number }) {
  return (
    <div className="space-y-2">
      <div className="aria-card p-4 opacity-70">
        <p className="font-mono text-[0.65rem] uppercase tracking-wider text-warm-muted mb-1">Turn {index} · ARIA</p>
        <p className="text-mahogany text-sm">{turn.question}</p>
      </div>
      {turn.answer && (
        <div className="rounded-xl border border-dashed border-card-border p-4 ml-6 bg-cream/40">
          <p className="font-mono text-[0.65rem] uppercase tracking-wider text-warm-muted mb-1">you</p>
          <p className="text-mahogany-soft text-sm whitespace-pre-wrap">{turn.answer}</p>
          {turn.eval && (
            <div className="mt-3 pt-3 border-t border-card-border flex items-center gap-3 flex-wrap">
              <span className="font-mono text-[0.7rem] text-mahogany">
                score {(turn.eval.overall * 10).toFixed(1)}/10
              </span>
              {turn.eval.notes && (
                <span className="text-[0.65rem] text-warm-muted italic">— {turn.eval.notes}</span>
              )}
              {turn.eval.flags.map((f) => (
                <span
                  key={f}
                  className="text-[0.65rem] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: "oklch(0.93 0.04 60)", color: "var(--accent-rust)" }}
                >
                  {f.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
