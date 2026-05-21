import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, Trash2, Plus, ArrowRight, Star, Download, ChevronDown, ChevronUp, Zap, Tag } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useSessionStore } from "@/store/session";
import type { Story } from "@/types";

// 3 pre-built example stories for quick-start
const EXAMPLE_STORIES: Story[] = [
  {
    id: "example-1",
    title: "Shipped a Feature Under Deadline Pressure",
    situation: "Our team had a critical product launch in 5 days, but our lead developer got sick. We had 3 unfinished features and needed all of them to ship.",
    task: "I was assigned as the interim tech lead to prioritize, delegate, and personally build the most complex feature — a real-time notification system.",
    action: "I ran a 30-minute triage meeting, cut one feature to scope-down, paired with our junior dev on the second, and worked two 14-hour days on the notification system myself. I also wrote tests before deploying to avoid last-minute regressions.",
    result: "We shipped on time. The notification system had zero bugs in the first week. Our launch hit 1,200 signups on day one — 40% above forecast.",
    raw_text: "",
    quality_score: 9.2,
    tags: ["leadership", "execution", "deadline"],
  },
  {
    id: "example-2",
    title: "Resolved a Cross-Team Conflict",
    situation: "The product and engineering teams were clashing over a feature's definition. Product wanted infinite scroll; engineering said it would break accessibility compliance.",
    task: "I was the only PM attending both standups. I needed to broker a solution that satisfied both sides without delaying the sprint.",
    action: "I scheduled a 45-minute working session with both leads, presented data showing that 23% of our users relied on assistive technology, proposed a paginated alternative with smooth loading animations, and created a shared Figma prototype in 2 hours to get visual alignment.",
    result: "Both teams agreed on the paginated approach. We shipped 2 days ahead of schedule. Accessibility score improved from 74 to 91. No complaints from users.",
    raw_text: "",
    quality_score: 8.8,
    tags: ["conflict", "communication", "product"],
  },
  {
    id: "example-3",
    title: "Cut Costs by Optimising Infra",
    situation: "Our AWS bill ballooned to $18,000/month after a traffic spike. We had no budget approval for this overage.",
    task: "I was asked to reduce cloud spend by at least 30% without degrading system performance.",
    action: "I audited our EC2 instances and found 60% were over-provisioned. I moved 4 services to spot instances, enabled S3 intelligent tiering, and implemented aggressive caching on our CDN edge.",
    result: "Monthly AWS cost dropped from $18k to $9,400 in 6 weeks — a 48% reduction. Latency actually improved by 12ms due to better caching.",
    raw_text: "",
    quality_score: 9.5,
    tags: ["cost", "technical", "ownership"],
  },
];

function qualityColor(score?: number) {
  if (!score) return "text-gray-400";
  if (score >= 9) return "text-emerald-600";
  if (score >= 7) return "text-amber-500";
  return "text-red-500";
}

function qualityLabel(score?: number) {
  if (!score) return "Unscored";
  if (score >= 9) return "Excellent";
  if (score >= 7) return "Good";
  return "Needs Work";
}

export default function StoryVault() {
  const stories = useSessionStore((s) => s.stories);
  const addStory = useSessionStore((s) => s.addStory);
  const removeStory = useSessionStore((s) => s.removeStory);

  const [isAdding, setIsAdding] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const loadExamples = () => {
    EXAMPLE_STORIES.forEach(s => addStory(s));
  };

  const handleProcess = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch("http://localhost:8000/vault/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawText }),
      });
      const data = await res.json();
      const newStory: Story = {
        id: crypto.randomUUID().slice(0, 8),
        title: data.title || "Untitled Story",
        situation: data.situation || "",
        task: data.task || "",
        action: data.action || "",
        result: data.result || "",
        raw_text: rawText,
        quality_score: data.quality_score,
        tags: data.tags || [],
      };
      addStory(newStory);
      setRawText("");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert("Failed to process story. Make sure the backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportVault = () => {
    const json = JSON.stringify(Object.values(stories), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aria_story_vault.json";
    a.click();
  };

  const allStories = Object.values(stories);
  const allTags = Array.from(new Set(allStories.flatMap(s => s.tags || [])));
  const filtered = filterTag ? allStories.filter(s => s.tags?.includes(filterTag)) : allStories;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-10 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust mb-2">
              Behavioral Arsenal
            </p>
            <h1 className="font-display text-4xl text-mahogany flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-mahogany-soft" />
              Story Vault
            </h1>
            <p className="text-mahogany-soft mt-2 max-w-xl text-sm leading-relaxed">
              Brain-dump your career experiences. ARIA extracts STAR format, scores quality, and injects them into your Stealth Copilot during live interviews.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {allStories.length === 0 && (
              <button
                onClick={loadExamples}
                className="aria-btn-secondary flex items-center gap-2 text-sm"
              >
                <Sparkles className="w-4 h-4" /> Load Examples
              </button>
            )}
            {allStories.length > 0 && (
              <button onClick={exportVault} className="aria-btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" /> Export Vault
              </button>
            )}
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="aria-btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Story
            </button>
          </div>
        </header>

        {/* How it works */}
        {allStories.length === 0 && !isAdding && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: "", title: "Dump Your Experience", desc: "Write a messy, unformatted brain-dump of something that happened at work. No STAR needed yet." },
              { icon: "", title: "AI Extracts STAR", desc: "ARIA automatically extracts the Situation, Task, Action, and Result, and scores how compelling the story is." },
              { icon: "", title: "Live Interview Hints", desc: "In Stealth Mode, ARIA listens to the interviewer and suggests which of your stories to use." },
            ].map(item => (
              <div key={item.title} className="aria-card p-5">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-display text-lg text-mahogany mb-1">{item.title}</h3>
                <p className="text-sm text-mahogany-soft">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add story panel */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="aria-card p-6 border-amber-300/60">
                <h3 className="font-display text-xl text-mahogany mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-amber" /> Brain-dump a story
                </h3>
                <p className="text-sm text-mahogany-soft mb-4">
                  Just ramble in plain English. Don't worry about formatting — ARIA will extract the STAR structure, give it a title, score it, and tag it automatically.
                </p>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="e.g. 'At my last job, our database kept crashing every time marketing sent an email blast. I had to figure out why without disrupting the team and then fix it permanently. I stayed up until 3am two nights in a row analyzing the query logs and found...' "
                  className="w-full p-4 rounded-xl border border-card-border focus:border-accent-amber outline-none min-h-[160px] mb-4 text-sm resize-y bg-white text-mahogany"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-warm-muted">{rawText.split(/\s+/).filter(Boolean).length} words</p>
                  <div className="flex gap-3">
                    <button onClick={() => setIsAdding(false)} className="aria-btn-secondary">Cancel</button>
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing || rawText.trim().split(/\s+/).length < 30}
                      className="aria-btn-primary flex items-center gap-2 disabled:opacity-50"
                      style={{ background: "var(--accent-amber)", color: "white" }}
                    >
                      {isProcessing ? "Extracting STAR…" : "Process with AI"}
                      {!isProcessing && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {rawText.trim().split(/\s+/).length < 30 && rawText.length > 5 && (
                  <p className="text-xs text-amber-500 mt-2">Add at least 30 words for ARIA to extract a meaningful story.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all
                ${!filterTag ? "bg-mahogany text-cream border-mahogany" : "bg-warm-white border-card-border text-mahogany hover:border-mahogany"}`}
            >
              All ({allStories.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1
                  ${filterTag === tag ? "bg-accent-rust text-white border-accent-rust" : "bg-warm-white border-card-border text-mahogany hover:border-accent-rust"}`}
              >
                <Tag className="w-2.5 h-2.5" /> {tag}
              </button>
            ))}
          </div>
        )}

        {/* Stories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.length === 0 && !isAdding && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-card-border rounded-2xl">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-warm-muted opacity-40" />
              <p className="text-mahogany-soft">Your vault is empty.</p>
              <p className="text-sm text-warm-muted mt-1">Add a story or load examples to get started.</p>
              <button onClick={loadExamples} className="aria-btn-secondary flex items-center gap-2 mx-auto mt-4">
                <Sparkles className="w-4 h-4" /> Load Example Stories
              </button>
            </div>
          )}

          {filtered.map(story => (
            <motion.div
              key={story.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="aria-card overflow-hidden flex flex-col"
            >
              <header className="p-4 bg-warm-white border-b border-card-border flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base text-mahogany leading-tight">{story.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {story.quality_score && (
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${qualityColor(story.quality_score)}`}>
                        <Star className="w-2.5 h-2.5" />
                        {story.quality_score?.toFixed(1)} · {qualityLabel(story.quality_score)}
                      </span>
                    )}
                    {(story.tags || []).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-cream border border-card-border text-mahogany-soft font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === story.id ? null : story.id)}
                    className="p-1.5 text-warm-muted hover:text-mahogany transition-colors"
                  >
                    {expandedId === story.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => removeStory(story.id)}
                    className="p-1.5 text-warm-muted hover:text-accent-rust transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </header>

              <AnimatePresence>
                {expandedId === story.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 space-y-4 text-sm">
                      {[
                        { key: "S", label: "Situation", value: story.situation, color: "text-blue-600" },
                        { key: "T", label: "Task", value: story.task, color: "text-purple-600" },
                        { key: "A", label: "Action", value: story.action, color: "text-amber-600" },
                        { key: "R", label: "Result", value: story.result, color: "text-emerald-600" },
                      ].map(({ key, label, value, color }) => (
                        <div key={key}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`font-bold text-xs uppercase tracking-widest ${color}`}>{key}</span>
                            <span className="text-[10px] text-warm-muted font-medium">{label}</span>
                          </div>
                          <p className="text-mahogany-soft leading-relaxed">{value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick preview when collapsed */}
              {expandedId !== story.id && (
                <div className="px-5 py-3 text-xs text-warm-muted line-clamp-2 italic">
                  {story.result || story.situation}
                </div>
              )}

              <div className="mt-auto px-4 py-3 border-t border-card-border bg-warm-white/60 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-accent-amber" />
                <p className="text-[11px] text-warm-muted">Used in Stealth Copilot automatically</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
