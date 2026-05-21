import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, BrainCircuit, Activity, Database, Sparkles, Code2, Target, Mic, BarChart3, GraduationCap, Workflow } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";


const FLOW = [
  {
    step: "01",
    title: "Setup",
    body: "You provide role, background, and focus. The Orchestrator seeds a SessionState object with difficulty=0.5.",
  },
  {
    step: "02",
    title: "Interviewer asks",
    body: "Reads SessionState. Picks a question calibrated to role, focus, difficulty, and topics-not-yet-covered.",
  },
  {
    step: "03",
    title: "You answer",
    body: "Free-form text. ARIA respects silence — no rush, no time pressure unless you set it.",
  },
  {
    step: "04",
    title: "Evaluator scores (silently)",
    body: "Runs concurrently with next-question prep. Outputs structured JSON across 5 dimensions plus flags.",
  },
  {
    step: "05",
    title: "Orchestrator adapts",
    body: "difficulty adjusts via exponential moving average. Flags drive follow-up vs pivot decisions.",
  },
  {
    step: "06",
    title: "Coach synthesizes",
    body: "After 6 turns, the Coach reads the full eval trace and produces strengths, gaps, and a 30-day plan.",
  },
];

const DIMENSIONS = [
  { name: "Clarity", weight: 20, body: "Is the answer logically structured and easy to follow?" },
  { name: "Relevance", weight: 25, body: "Does it directly address what was asked?" },
  { name: "Depth", weight: 25, body: "Is there genuine insight, or is it surface-level?" },
  { name: "Evidence", weight: 20, body: "Are there concrete examples, numbers, outcomes?" },
  { name: "Communication", weight: 10, body: "Does language convey confidence and professionalism?" },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust mb-3">
            architecture
          </p>
          <h1 className="font-display text-4xl md:text-6xl text-mahogany max-w-3xl leading-[1.05]">
            Three agents. One living session state. Adaptive by construction.
          </h1>
          <p className="mt-6 text-mahogany-soft text-lg max-w-2xl leading-relaxed">
            Most "AI interviewers" are a single LLM with a long prompt. ARIA is
            a system: each agent has one job, shared state binds them, and the
            Coach reads structured data — not summaries.
          </p>
        </section>

        {/* Agent cards */}
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="grid md:grid-cols-3 gap-5">
            <AgentDetail
              icon={Mic}
              name="Interviewer"
              role="driver"
              points={[
                "Reads difficulty (float) and adjusts question hardness",
                "Issues follow-up probes when answers stay shallow",
                "Pivots gracefully on 'I don't know' — no penalty",
                "Tracks topics covered, avoids repeats",
              ]}
            />
            <AgentDetail
              icon={BarChart3}
              name="Evaluator"
              role="silent shadow"
              points={[
                "Scores 5 dimensions: clarity, relevance, depth, evidence, comms",
                "Emits structured JSON via Pydantic validation",
                "Flags edge cases: knowledge_gap, vague_response, no_metrics",
                "Runs concurrently with next-question prep",
              ]}
            />
            <AgentDetail
              icon={GraduationCap}
              name="Coach"
              role="synthesizer"
              points={[
                "Reads raw eval trace, not summaries",
                "Identifies cross-turn patterns",
                "Produces a 30-day plan tied to detected gaps",
                "Output: structured markdown + JSON for dashboard",
              ]}
            />
          </div>
        </section>

        {/* Flow */}
        <section className="bg-warm-white/60 border-y border-card-border">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center gap-2 mb-8">
              <Workflow className="w-4 h-4 text-accent-rust" />
              <h2 className="font-display text-3xl text-mahogany">Data flow per turn</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {FLOW.map((f, i) => (
                <motion.div
                  key={f.step}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 p-5 aria-card"
                >
                  <span className="font-display text-3xl text-accent-rust shrink-0 leading-none">
                    {f.step}
                  </span>
                  <div>
                    <h3 className="font-medium text-mahogany">{f.title}</h3>
                    <p className="text-sm text-mahogany-soft mt-1 leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dimensions */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="w-4 h-4 text-accent-rust" />
            <h2 className="font-display text-3xl text-mahogany">Scoring dimensions</h2>
          </div>
          <div className="aria-card overflow-hidden">
            {DIMENSIONS.map((d, i) => (
              <div
                key={d.name}
                className={`flex items-center gap-6 p-5 ${
                  i !== DIMENSIONS.length - 1 ? "border-b border-card-border" : ""
                }`}
              >
                <div className="w-16 shrink-0">
                  <p className="font-display text-3xl text-mahogany">{d.weight}%</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-mahogany">{d.name}</p>
                  <p className="text-sm text-mahogany-soft mt-0.5">{d.body}</p>
                </div>
                <div className="hidden md:block w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-rust"
                    style={{ width: `${d.weight * 4}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stack */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="font-display text-3xl text-mahogany mb-6">The stack</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <StackCard
              title="Frontend"
              rows={[
                ["Framework", "React 19 + TanStack Start"],
                ["Styling", "Tailwind v4 + CSS variables"],
                ["Animations", "Framer Motion"],
                ["State", "Zustand (persisted)"],
                ["Streaming", "Fetch + SSE"],
              ]}
            />
            <StackCard
              title="Backend"
              rows={[
                ["Runtime", "Python 3.11 + FastAPI"],
                ["LLM", "Claude Sonnet 4 (Anthropic)"],
                ["Orchestration", "Custom AgentOrchestrator"],
                ["Session store", "Redis (Upstash)"],
                ["Validation", "Pydantic v2"],
              ]}
            />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="aria-card p-10 text-center">
            <h3 className="font-display text-3xl text-mahogany">Ready to try it?</h3>
            <p className="mt-3 text-mahogany-soft max-w-lg mx-auto">
              The architecture is interesting. The output is what changes how
              you prepare.
            </p>
            <Link to="/setup" className="aria-btn-primary inline-flex mt-6 items-center gap-2">
              Start a session
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function AgentDetail({
  icon: Icon,
  name,
  role,
  points,
}: {
  icon: typeof Mic;
  name: string;
  role: string;
  points: string[];
}) {
  return (
    <div className="aria-card p-6">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-4 text-mahogany">
        <Icon className="w-4 h-4" />
      </div>
      <p className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">{role}</p>
      <h3 className="font-display text-2xl text-mahogany mt-0.5 mb-4">{name}</h3>
      <ul className="space-y-2">
        {points.map((p) => (
          <li key={p} className="flex gap-2 text-sm text-mahogany-soft">
            <span className="text-accent-rust mt-1 leading-none">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StackCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="aria-card p-6">
      <h3 className="font-display text-xl text-mahogany mb-4">{title}</h3>
      <dl className="divide-y divide-card-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-2.5 text-sm">
            <dt className="text-warm-muted">{k}</dt>
            <dd className="font-mono text-mahogany text-xs">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
