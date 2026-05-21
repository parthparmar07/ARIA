import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, BarChart3, GraduationCap, ArrowRight, Sparkles, Activity, Layers } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AgentCard } from "@/components/AgentCard";

const ROLE_TABS = ["HR", "Product", "Engineering", "Design", "Sales", "Data"] as const;

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <RoleStrip />
        <Agents />
        <Architecture />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 aria-grain opacity-60" />
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 mb-6"
        >
          <span className="aria-pill">
            <Sparkles className="w-3.5 h-3.5" />
            Multi-agent interview simulation
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-[clamp(2.6rem,6.5vw,5.25rem)] leading-[1.02] text-mahogany max-w-4xl"
        >
          Mock interviews that{" "}
          <span className="italic" style={{ color: "var(--accent-rust)" }}>
            think
          </span>{" "}
          alongside you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-mahogany-soft max-w-2xl leading-relaxed"
        >
          ARIA runs three specialist agents in concert — an{" "}
          <em>Interviewer</em> that adapts in real time, an <em>Evaluator</em> that
          scores every answer silently across five dimensions, and a{" "}
          <em>Coach</em> that synthesizes the full arc into a 30-day growth plan.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link to="/loops/new" className="aria-btn-primary inline-flex items-center gap-2 text-base">
            Create a Pipeline
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/setup"
            className="px-5 py-3 rounded-lg text-mahogany hover:bg-warm-white border border-transparent hover:border-card-border transition-colors inline-flex items-center gap-1.5"
          >
            Quick Session
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-card-border rounded-2xl overflow-hidden border border-card-border"
        >
          {[
            { label: "scraped job boards", value: "40+" },
            { label: "fit dimensions", value: "5" },
            { label: "tailored documents", value: "3" },
            { label: "adaptive turns", value: "6" },
          ].map((s) => (
            <div key={s.label} className="bg-warm-white px-6 py-5">
              <p className="font-display text-3xl text-mahogany">{s.value}</p>
              <p className="font-mono text-[0.65rem] uppercase tracking-wider text-warm-muted mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function RoleStrip() {
  return (
    <section className="border-y border-card-border bg-warm-white/60">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
          calibrated for
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLE_TABS.map((r, i) => (
            <span key={r} className="aria-pill" data-active={i === 2}>
              {r}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Agents() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="max-w-2xl mb-12">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust mb-3">
          the system
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-mahogany">
          An End-to-End Career Copilot.
        </h2>
        <p className="mt-4 text-mahogany-soft leading-relaxed">
          ARIA doesn't just run mock interviews. It builds your entire pipeline from lead discovery to final debrief using a suite of specialized AI agents.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <AgentCard
          icon={Activity}
          name="Automated Scraper & Gate"
          role="agent · discovery"
          description="Scrapes HackerNews and Greenhouse for leads, running them through a Quality Gate to reject bad matches before you even see them."
          index={0}
          active
        />
        <AgentCard
          icon={Layers}
          name="Fit Engine & Packager"
          role="agent · strategy"
          description="Analyzes your resume against the JD across multi-dimensional criteria. Instantly generates a Cover Letter, Cold Email, and Cheat Sheet."
          index={1}
        />
        <AgentCard
          icon={Mic}
          name="Hyper-Specific Interviewer"
          role="agent · execution"
          description="Runs your mock loop. Cross-references your actual resume with the JD to ask brutally specific questions. No generic 'tell me a time' prompts."
          index={2}
        />
      </div>
    </section>
  );
}

function Architecture() {
  return (
    <section className="bg-warm-white/60 border-y border-card-border">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust mb-3">
              what makes it different
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-mahogany">
              Mock sessions that actually adapt.
            </h2>
            <p className="mt-4 text-mahogany-soft leading-relaxed">
              Binary easy/hard creates jarring transitions. ARIA tracks{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 bg-secondary rounded">
                difficulty: 0.0 → 1.0
              </code>{" "}
              and smooths it across turns with exponential moving average — the
              same way a real interviewer recalibrates as you talk.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: Activity,
                  title: "Concurrent agent execution",
                  body: "The Packager and Fit Engine run in parallel to generate your pipeline instantly.",
                },
                {
                  icon: Layers,
                  title: "Strict Project Diversity",
                  body: "The Interviewer tracks what you've talked about and forces you to discuss different projects.",
                },
                {
                  icon: Sparkles,
                  title: "FAANG Bar Raiser Debrief",
                  body: "Get explicit 'Hire / No Hire' signals based on top-tier tech company rubrics.",
                },
              ].map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-warm-white border border-card-border">
                    <f.icon className="w-4 h-4 text-mahogany" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-medium text-mahogany">{f.title}</p>
                    <p className="text-sm text-mahogany-soft">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="aria-card p-6 font-mono text-[0.78rem] leading-relaxed text-mahogany overflow-hidden">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-rust" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent-sage" />
              <span className="ml-auto text-warm-muted text-[0.7rem]">
                models.py
              </span>
            </div>
            <pre className="text-[0.78rem] whitespace-pre-wrap">
              <span style={{ color: "var(--accent-rust)" }}>class</span>{" "}
              <span style={{ color: "var(--mahogany)" }}>DetailedFit</span>(BaseModel):
              {"\n"}
              {"  "}overall_score: int{"\n"}
              {"  "}stack_coverage: MetricFit{"\n"}
              {"  "}project_evidence: MetricFit{"\n"}
              {"  "}seniority_fit: MetricFit{"\n"}
              {"  "}red_flags: list[str]{"\n"}
              {"  "}project_rationale: str{"\n\n"}
              <span style={{ color: "var(--accent-rust)" }}>class</span>{" "}
              <span style={{ color: "var(--mahogany)" }}>TailoredDocuments</span>(BaseModel):
              {"\n"}
              {"  "}cover_letter: str{"\n"}
              {"  "}cold_email: str{"\n"}
              {"  "}linkedin_note: str{"\n"}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl gradient-mahogany p-12 md:p-16 text-cream">
        <div className="relative z-10 max-w-2xl">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-cream/70 mb-3">
            ready when you are
          </p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            Stop guessing. Start practicing.
          </h2>
          <p className="mt-4 text-cream/80 max-w-lg">
            Upload your resume, find a lead, get tailored outbound documents, and run a hyper-specific mock loop.
          </p>
          <div className="mt-8">
            <Link
              to="/loops/new"
              className="inline-flex items-center gap-2 bg-cream text-mahogany px-6 py-3.5 rounded-lg font-medium hover:bg-warm-white transition"
            >
              Build your pipeline
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div
          className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, var(--accent-amber) 0%, transparent 70%)",
          }}
        />
      </div>
    </section>
  );
}
