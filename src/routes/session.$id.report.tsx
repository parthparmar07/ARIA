import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Download, Sparkles, Target, TrendingUp, UserCheck } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useSessionStore } from "@/store/session";
import { ScoreRing } from "@/components/ScoreRing";
import { generateReport } from "@/lib/api";

export default function Report() {
  const { id } = useParams() as { id: string };
  const session = useSessionStore((s) => s.sessions[id]);
  const storedReport = useSessionStore((s) => s.reports[id]);
  const setReport = useSessionStore((s) => s.setReport);
  const [report, setLocalReport] = useState(storedReport);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!session) return;
    if (storedReport) {
      setLocalReport(storedReport);
      return;
    }
    generateReport(id).then((r) => {
      setReport(id, r);
      setLocalReport(r);
    });
  }, [id, session, storedReport, setReport]);

  // animate overall score
  useEffect(() => {
    if (!report) return;
    const target = report.overall_score * 10;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(eased * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [report]);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <h1 className="font-display text-3xl text-mahogany">Session not found</h1>
            <Link to="/setup" className="aria-btn-primary mt-6 inline-flex">
              New session
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-6 h-6 mx-auto text-accent-rust animate-pulse" />
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-warm-muted">
              Coach synthesizing your session…
            </p>
          </div>
        </div>
      </div>
    );
  }

  const verdict =
    report.overall_score >= 0.75
      ? "Strong candidate — clear growth path ahead."
      : report.overall_score >= 0.5
        ? "Promising signal — sharpen the gaps and you'll shine."
        : "Foundational work needed — the plan below is your map.";

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="gradient-mahogany text-cream relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, var(--accent-amber) 0%, transparent 50%)",
            }}
          />
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 relative">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-cream/70">
              your coaching report · {session.role}
            </p>
            <h1 className="font-display text-[clamp(4rem,12vw,8rem)] leading-none mt-3">
              {animatedScore.toFixed(1)}
              <span className="text-cream/40 text-[0.4em] font-sans font-light ml-3">
                / 10
              </span>
            </h1>
            <p className="mt-2 text-lg text-cream/85 max-w-xl">{verdict}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-cream text-mahogany px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-warm-white transition"
              >
                <Download className="w-4 h-4" />
                Save as PDF
              </button>
              <Link
                to="/setup"
                className="inline-flex items-center gap-2 border border-cream/30 text-cream px-5 py-2.5 rounded-lg text-sm hover:bg-cream/10 transition"
              >
                Start another session
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Score breakdown */}
        <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
          <div className="aria-card p-8 grid grid-cols-2 md:grid-cols-5 gap-6">
            {(Object.keys(report.score_by_dimension) as (keyof typeof report.score_by_dimension)[]).map(
              (k) => (
                <ScoreRing
                  key={k}
                  value={report.score_by_dimension[k]}
                  label={k}
                />
              ),
            )}
          </div>
        </section>

        {/* Strengths & growth */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="aria-card p-7 mb-6 border-l-4 border-l-accent-sage">
            <header className="flex items-center gap-3 mb-3">
              <UserCheck className="w-5 h-5 text-accent-sage" />
              <h3 className="font-display text-2xl text-mahogany">Role Fit Assessment</h3>
            </header>
            {report.faang_signal && (
              <div className="mb-4 inline-block px-3 py-1 bg-mahogany text-cream font-mono text-sm uppercase tracking-widest rounded">
                FAANG Signal: {report.faang_signal}
              </div>
            )}
            <p className="text-mahogany-soft text-lg leading-relaxed">{report.role_fit || "Adequate fit based on current performance."}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PillarCard
              title="Strengths"
              accent="var(--accent-sage)"
              icon={TrendingUp}
              items={report.strengths}
            />
            <PillarCard
              title="Growth Areas"
              accent="var(--accent-rust)"
              icon={Target}
              items={report.growth_areas}
            />
          </div>
        </section>

        {/* Turn-by-turn */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="font-display text-3xl text-mahogany mb-6">Turn by turn</h2>
          <div className="aria-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-card-border bg-warm-white/60">
                  <th className="px-5 py-3 font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted w-12">
                    #
                  </th>
                  <th className="px-5 py-3 font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
                    Topic
                  </th>
                  <th className="px-5 py-3 font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted w-20">
                    Score
                  </th>
                  <th className="px-5 py-3 font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
                    Coach note
                  </th>
                </tr>
              </thead>
              <tbody>
                {session.turns.map((t, i) => {
                  const s = t.eval?.overall ?? 0;
                  const color =
                    s >= 0.75
                      ? "var(--accent-sage)"
                      : s >= 0.4
                        ? "var(--accent-amber)"
                        : "var(--accent-rust)";
                  return (
                    <tr key={i} className="border-b border-card-border last:border-0">
                      <td className="px-5 py-4 font-mono text-mahogany text-xs">{i + 1}</td>
                      <td className="px-5 py-4 text-mahogany">
                        {t.topic}
                        {t.isFollowup && (
                          <span className="ml-2 text-[0.65rem] font-mono uppercase tracking-wider text-warm-muted">
                            follow-up
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="font-mono text-sm px-2 py-0.5 rounded"
                          style={{ background: color, color: "var(--cream)" }}
                        >
                          {(s * 10).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-mahogany-soft">
                        {t.eval?.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 30-day plan */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust">
                personalized roadmap
              </p>
              <h2 className="font-display text-3xl text-mahogany mt-1">30-Day Practice Plan</h2>
            </div>
            <span className="hidden md:inline text-xs text-warm-muted font-mono">
              tailored to your gaps
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {report.practice_plan.map((w, idx) => (
              <WeekCard key={w.week} week={w} index={idx} />
            ))}
          </div>
        </section>

        {/* Post-Session Action */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="aria-card p-10 bg-cream/40 border-accent-rust text-center">
            <h2 className="font-display text-3xl text-mahogany mb-3">Fix Your Gaps Immediately</h2>
            <p className="text-mahogany-soft max-w-2xl mx-auto mb-8">
              Don't wait until your next interview. Use the built-in Resume Builder to instantly refine your experience bullets and incorporate the feedback you just received.
            </p>
            <Link to="/resume" className="aria-btn-primary !px-8 !py-4 text-lg inline-flex items-center gap-2">
              Improve Your Resume Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function PillarCard({
  title,
  accent,
  icon: Icon,
  items,
}: {
  title: string;
  accent: string;
  icon: typeof TrendingUp;
  items: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="aria-card p-7"
    >
      <header className="flex items-center gap-3 mb-5">
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}26`, color: accent }}
        >
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
        <h3 className="font-display text-2xl text-mahogany">{title}</h3>
      </header>
      <ul className="space-y-3">
        {items.map((s, i) => (
          <li key={i} className="flex gap-3 text-mahogany-soft text-sm leading-relaxed">
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: accent }}
            />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function WeekCard({
  week,
  index,
}: {
  week: { week: number; title: string; items: string[] };
  index: number;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="aria-card p-6"
    >
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust">
          Week {week.week}
        </p>
        <p className="text-xs text-warm-muted font-mono">
          {checked.size} / {week.items.length}
        </p>
      </div>
      <h3 className="font-display text-xl text-mahogany mb-4">{week.title}</h3>
      <ul className="space-y-2">
        {week.items.map((it, i) => {
          const done = checked.has(i);
          return (
            <li key={i}>
              <button
                onClick={() => toggle(i)}
                className="flex items-start gap-3 text-left w-full group py-1"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    done
                      ? "bg-mahogany border-mahogany text-cream"
                      : "border-card-border group-hover:border-mahogany-soft"
                  }`}
                >
                  {done && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span
                  className={`text-sm ${
                    done ? "text-warm-muted line-through" : "text-mahogany-soft"
                  }`}
                >
                  {it}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
