import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Zap, Copy, CheckCircle2, BookOpen, AlertCircle, Target } from "lucide-react";
import { useSessionStore } from "@/store/session";
import { getLoops } from "@/lib/api";
import type { InterviewLoop } from "@/types";

// ─── Stealth Copilot ────────────────────────────────────────────────────────
// Designed to look like a Notion-like note-taking app on screen share.
// The real AI copilot floats invisibly in the bottom-right corner.

export default function StealthCopilot() {
  const stories = useSessionStore((s) => s.stories);
  const [interviewerSpeech, setInterviewerSpeech] = useState("");
  const [interimText, setInterimText] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [hasMicError, setHasMicError] = useState(false);
  const [firstTimeHint, setFirstTimeHint] = useState(true);
  const recognitionRef = useRef<any>(null);
  
  const [loops, setLoops] = useState<InterviewLoop[]>([]);
  const [activeLoopId, setActiveLoopId] = useState<string>("");

  const [notes, setNotes] = useState(
    "Meeting Notes — " + new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) +
    "\n\nAgenda:\n1. Team sync\n2. \n"
  );

  useEffect(() => {
    getLoops().then(res => setLoops(res)).catch(console.error);
  }, []);

  // Initialize continuous speech recognition with auto-restart
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setHasMicError(true); return; }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) { final += t + " "; }
        else { interim = t; }
      }
      setInterimText(interim);
      if (final) {
        setInterviewerSpeech(prev => (prev + " " + final).trim());
        setInterimText("");
      }
    };

    rec.onerror = (e: any) => {
      if (e.error === "not-allowed") setHasMicError(true);
      else if (e.error !== "aborted") {
        setTimeout(() => { if (rec._shouldRun) { try { rec.start(); } catch {} } }, 500);
      }
    };

    rec.onend = () => {
      if (rec._shouldRun) { try { rec.start(); } catch {} }
      else setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => { rec._shouldRun = false; rec.stop(); };
  }, []);

  const toggleListen = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (isListening) {
      rec._shouldRun = false;
      rec.stop();
      setIsListening(false);
    } else {
      setInterviewerSpeech("");
      setInterimText("");
      rec._shouldRun = true;
      try { rec.start(); } catch {}
      setIsListening(true);
      setShowPanel(true);
      setFirstTimeHint(false);
    }
  }, [isListening]);

  const requestHints = useCallback(async () => {
    if (!interviewerSpeech.trim()) return;
    setIsGenerating(true);
    setHints([]);
    try {
      const loop = loops.find(l => l.id === activeLoopId);
      const res = await fetch("http://localhost:8000/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewer_speech: interviewerSpeech,
          stories: Object.values(stories),
          job_description: loop?.job_description,
          resume_text: loop?.resume_text,
        }),
      });
      const data = await res.json();
      const clean = (data.hints || []).filter((h: string) => h.trim().length > 5);
      setHints(clean);
      setShowPanel(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [interviewerSpeech, stories]);

  // Cmd+Enter = generate hints
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); requestHints(); }
      if (e.key === "Escape") setShowPanel(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestHints]);

  const copyHint = (hint: string, idx: number) => {
    navigator.clipboard.writeText(hint);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const storyCount = Object.values(stories).length;

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100">
      {/* ── Fake OS-style top bar ── */}
      <div className="h-9 bg-[#f7f7f7] border-b border-[#e3e3e3] flex items-center px-4 justify-between select-none sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[11px] font-medium text-gray-500">Notes — Interview Prep</span>
        </div>
        <div className="flex items-center gap-4">
          {loops.length > 0 && (
            <select
              value={activeLoopId}
              onChange={e => setActiveLoopId(e.target.value)}
              className="text-[11px] bg-white border border-gray-200 rounded px-2 py-1 outline-none text-gray-600 max-w-[150px] truncate"
            >
              <option value="">No Active Pipeline</option>
              {loops.map(l => (
                <option key={l.id} value={l.id}>{l.target_company} - {l.target_role}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-2">
            {/* ARIA Copilot Controls — looks like editor toolbar */}
          <button
            onClick={toggleListen}
            title={isListening ? "Stop capturing (ARIA)" : "Start capturing interviewer's voice (ARIA)"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all
              ${isListening
                ? "bg-red-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {isListening
              ? <><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />{" "}Listening</>
              : <><Mic className="w-3 h-3" /> Capture</>}
          </button>
          <button
            onClick={requestHints}
            disabled={!interviewerSpeech.trim() || isGenerating}
            title="Generate hints (⌘ + Enter)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30 transition-all"
          >
            {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {isGenerating ? "Thinking…" : "Get Hints"}
          </button>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-[11px] text-gray-400 hover:text-gray-600 px-2"
          >
            {showPanel ? "Hide" : "Show"}
          </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-36px)]">
        {/* ── Fake sidebar ── */}
        <div className="w-56 bg-[#f9f9f9] border-r border-[#e3e3e3] p-4 hidden md:flex flex-col gap-1 shrink-0">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Workspace</p>
          {["📝 Interview Prep", "📋 System Design", "💡 Ideas", "🗂 Resources", "✅ Follow-ups"].map((item, i) => (
            <div
              key={item}
              className={`text-[13px] py-1 px-2 rounded cursor-default transition-colors
                ${i === 0 ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {item}
            </div>
          ))}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-[10px] text-gray-400 text-center">ARIA Copilot Active</p>
            <p className="text-[10px] text-gray-400 text-center mt-0.5">{storyCount} stories loaded</p>
          </div>
        </div>

        {/* ── Editor Area ── */}
        <div className="flex-1 relative flex flex-col overflow-hidden">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="flex-1 w-full px-16 py-10 resize-none outline-none bg-white text-[15px] leading-[1.8] font-['Georgia',serif] text-gray-800 placeholder-gray-300"
            spellCheck={true}
            placeholder="Start typing your notes…"
          />

          {/* Live transcription subtle display */}
          {(isListening && (interviewerSpeech || interimText)) && (
            <div className="px-16 pb-4 text-[12px] text-gray-400 italic font-mono border-t border-gray-100">
              <span className="text-gray-500">🎙 </span>
              {interviewerSpeech}
              {interimText && <span className="text-gray-300"> {interimText}</span>}
            </div>
          )}
        </div>
      </div>

      {/* ── ARIA Hints Panel (floating, feels invisible on screen share) ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-[380px] max-h-[70vh] overflow-y-auto bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl rounded-2xl z-50 font-sans"
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">ARIA Copilot</span>
              </div>
              <span className="text-[10px] text-gray-400">Press Esc to hide</span>
            </div>

            <div className="p-4 space-y-3">
              {/* Onboarding guide */}
              {firstTimeHint && hints.length === 0 && !isGenerating && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-[12px] font-semibold text-blue-700 mb-2">How to use Stealth Mode</p>
                    <ol className="text-[11px] text-blue-600 space-y-1.5 list-decimal ml-4">
                      <li>Click <strong>Capture</strong> in the top bar to start listening to your interviewer</li>
                      <li>After they ask a question, click <strong>Get Hints</strong> (or ⌘+Enter)</li>
                      <li>ARIA matches the question to your Story Vault and gives you talking points</li>
                      <li>You type your notes normally — this panel is invisible to screen shares if you move it</li>
                    </ol>
                  </div>
                  {storyCount === 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-semibold text-amber-700">Story Vault is empty</p>
                        <p className="text-[11px] text-amber-600 mt-0.5">Add your STAR stories in the Story Vault for best results. ARIA will match them to interview questions.</p>
                        <a href="/vault" className="text-[11px] font-semibold text-amber-700 underline mt-1 block">→ Go to Story Vault</a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Live transcription */}
              {isListening && (interviewerSpeech || interimText) && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Interviewer (Live)</p>
                  <p className="text-[13px] text-gray-700 leading-snug">
                    {interviewerSpeech}
                    {interimText && <span className="text-gray-400"> {interimText}▊</span>}
                  </p>
                </div>
              )}

              {/* Generating indicator */}
              {isGenerating && (
                <div className="flex items-center gap-2.5 py-3 px-1">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <p className="text-[13px] text-gray-500">Searching your stories + crafting hints…</p>
                </div>
              )}

              {/* Hints */}
              {hints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suggested Talking Points</p>
                  {hints.map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-2.5 items-start group bg-blue-50 hover:bg-blue-100 rounded-xl px-3 py-2.5 transition-colors cursor-pointer"
                      onClick={() => copyHint(h.replace(/^[-•*\s]+/, ""), i)}
                    >
                      <span className="text-blue-400 font-bold mt-0.5 shrink-0">
                        {copiedIdx === i ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <span className="text-[10px]">{i + 1}</span>}
                      </span>
                      <p className="text-[12.5px] text-gray-800 leading-snug flex-1">{h.replace(/^[-•*\s]+/, "")}</p>
                      <Copy className="w-3 h-3 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5" />
                    </motion.div>
                  ))}
                  <button
                    onClick={() => { setHints([]); setInterviewerSpeech(""); }}
                    className="w-full text-[11px] text-gray-400 hover:text-gray-600 py-1.5 text-center"
                  >
                    Clear · Ready for next question
                  </button>
                </div>
              )}

              {hasMicError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                  <p className="text-[12px] text-red-600 font-semibold">Microphone blocked</p>
                  <p className="text-[11px] text-red-500 mt-1">Please allow microphone access in your browser settings, then refresh. Use Chrome or Edge for best results.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle button when panel is hidden */}
      {!showPanel && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowPanel(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-500 text-white shadow-2xl flex items-center justify-center hover:bg-blue-600 transition-colors z-50"
          title="Show ARIA Copilot"
        >
          <Zap className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
