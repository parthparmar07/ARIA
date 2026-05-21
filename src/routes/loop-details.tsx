import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, CheckCircle2, AlertTriangle, Play, ChevronRight, Check, FileText, Copy, Mail, Linkedin } from "lucide-react";
import { Nav } from "@/components/Nav";
import { getLoop, startSession } from "@/lib/api";
import { useSessionStore } from "@/store/session";
import { useToast } from "@/hooks/use-toast";
import type { InterviewLoop, InterviewRound } from "@/types";

export default function LoopDetails() {
  const { id } = useParams() as { id: string };
  const nav = useNavigate();
  const { toast } = useToast();
  const create = useSessionStore((s) => s.createSession);
  
  const [loop, setLoop] = useState<InterviewLoop | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rounds' | 'docs'>('rounds');

  useEffect(() => {
    getLoop(id).then(res => {
      setLoop(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-mahogany">Loading Pipeline...</div>;
  }

  if (!loop) {
    return <div className="min-h-screen flex items-center justify-center text-mahogany">Pipeline not found.</div>;
  }

  const handleStartRound = async (round: InterviewRound) => {
    if (round.status === "completed") return;
    
    if (round.session_id) {
      nav(`/session/${round.session_id}`);
      return;
    }

    const sid = create({
      role: loop.target_role,
      background: loop.resume_text,
      focus: "mixed",
      interview_mode: round.round_type === "technical" || round.round_type === "system_design" ? "technical" : "behavioral",
      loop_id: loop.id,
      round_type: round.round_type,
    });
    nav(`/session/${sid}`);
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: `${title} has been copied.` });
  };

  const fit = loop.fit_analysis;
  const docs = loop.documents;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Nav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <header className="mb-10 flex items-start justify-between">
          <div>
            <p className="font-mono text-[0.75rem] uppercase tracking-wider text-accent-rust mb-2">
              Pipeline Command Center
            </p>
            <h1 className="font-display text-4xl text-mahogany">
              {loop.target_company} · {loop.target_role}
            </h1>
            <p className="mt-2 text-mahogany-soft text-sm">
              Created {new Date(loop.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted mb-1">Overall Fit</p>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-accent-sage text-2xl font-display text-mahogany">
              {fit?.overall_score || 0}
            </div>
          </div>
        </header>

        <div className="flex bg-warm-white rounded-xl p-1 border border-card-border w-fit mb-8">
          <button 
            onClick={() => setActiveTab('rounds')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'rounds' ? 'bg-white shadow-sm text-mahogany' : 'text-warm-muted hover:text-mahogany'}`}
          >
            Interview Rounds
          </button>
          <button 
            onClick={() => setActiveTab('docs')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'docs' ? 'bg-white shadow-sm text-mahogany' : 'text-warm-muted hover:text-mahogany'}`}
          >
            Tailored Outbound Package
          </button>
        </div>

        {activeTab === 'rounds' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <section className="lg:col-span-2 space-y-6">
              
              {fit?.project_rationale && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
                  <h3 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Target className="w-4 h-4" /> Interview Strategy Cheat Sheet
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {fit.project_rationale}
                  </p>
                </div>
              )}

              <h2 className="font-display text-2xl text-mahogany">Interview Rounds</h2>
              <div className="space-y-4">
                {loop.rounds.map((round) => (
                  <div key={round.id} className="aria-card p-6 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {round.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-accent-sage" />
                        ) : round.status === "in_progress" ? (
                          <div className="w-5 h-5 rounded-full border-2 border-accent-amber border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-card-border" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-mahogany">{round.title}</h3>
                        <p className="text-sm text-warm-muted mt-1 max-w-md">{round.description}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleStartRound(round)}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                        ${round.status === "completed" ? 'bg-accent-sage/10 text-accent-sage' 
                        : round.status === "in_progress" ? 'bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/20'
                        : 'bg-mahogany text-cream hover:bg-mahogany/90'}`}
                    >
                      {round.status === "completed" ? (
                        <>Done <Check className="w-4 h-4" /></>
                      ) : round.status === "in_progress" ? (
                        <>Resume <ChevronRight className="w-4 h-4" /></>
                      ) : (
                        <>Start Round <Play className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <aside className="lg:col-span-1 space-y-6">
              <div className="aria-card p-6">
                <h3 className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-sage" />
                  Fit Ranking
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-mahogany">Stack Coverage</span>
                      <span className="text-warm-muted">{fit?.stack_coverage.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-sage rounded-full" style={{ width: `${fit?.stack_coverage.score}%` }} />
                    </div>
                    <p className="text-[11px] text-warm-muted mt-2 leading-relaxed">{fit?.stack_coverage.reasoning}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-mahogany">Project Evidence</span>
                      <span className="text-warm-muted">{fit?.project_evidence.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-sage rounded-full" style={{ width: `${fit?.project_evidence.score}%` }} />
                    </div>
                    <p className="text-[11px] text-warm-muted mt-2 leading-relaxed">{fit?.project_evidence.reasoning}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-mahogany">Seniority Match</span>
                      <span className="text-warm-muted">{fit?.seniority_fit.score}/100</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-sage rounded-full" style={{ width: `${fit?.seniority_fit.score}%` }} />
                    </div>
                    <p className="text-[11px] text-warm-muted mt-2 leading-relaxed">{fit?.seniority_fit.reasoning}</p>
                  </div>
                </div>
              </div>

              {fit?.red_flags && fit.red_flags.length > 0 && (
                <div className="aria-card p-6 border-l-4 border-l-accent-rust">
                  <h3 className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-accent-rust" />
                    Quality Gate Flags
                  </h3>
                  <ul className="space-y-3">
                    {fit.red_flags.map((g, i) => (
                      <li key={i} className="text-sm text-mahogany-soft flex items-start gap-2">
                        <span className="text-accent-rust mt-0.5">•</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4">
            <h2 className="font-display text-2xl text-mahogany mb-2">Tailored Outbound Package</h2>
            <p className="text-mahogany-soft text-sm mb-8">
              Based on your resume and the target JD, ARIA has drafted highly personalized outbound materials for you to use.
            </p>

            <div className="space-y-8">
              <div className="aria-card p-6">
                <div className="flex items-center justify-between mb-4 border-b border-card-border pb-4">
                  <h3 className="font-display text-lg text-mahogany flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent-sage" /> Cover Letter
                  </h3>
                  <button onClick={() => copyToClipboard(docs?.cover_letter || "", "Cover Letter")} className="text-xs flex items-center gap-1.5 text-warm-muted hover:text-mahogany transition-colors bg-warm-white px-3 py-1.5 rounded-lg">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-serif">
                  {docs?.cover_letter || "Generating..."}
                </div>
              </div>

              <div className="aria-card p-6">
                <div className="flex items-center justify-between mb-4 border-b border-card-border pb-4">
                  <h3 className="font-display text-lg text-mahogany flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent-amber" /> Cold Email (Hiring Manager)
                  </h3>
                  <button onClick={() => copyToClipboard(docs?.cold_email || "", "Cold Email")} className="text-xs flex items-center gap-1.5 text-warm-muted hover:text-mahogany transition-colors bg-warm-white px-3 py-1.5 rounded-lg">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {docs?.cold_email || "Generating..."}
                </div>
              </div>

              <div className="aria-card p-6">
                <div className="flex items-center justify-between mb-4 border-b border-card-border pb-4">
                  <h3 className="font-display text-lg text-mahogany flex items-center gap-2">
                    <Linkedin className="w-5 h-5 text-blue-600" /> LinkedIn Connection Note
                  </h3>
                  <button onClick={() => copyToClipboard(docs?.linkedin_note || "", "LinkedIn Note")} className="text-xs flex items-center gap-1.5 text-warm-muted hover:text-mahogany transition-colors bg-warm-white px-3 py-1.5 rounded-lg">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {docs?.linkedin_note || "Generating..."}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
