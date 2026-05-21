import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Trash2, FileText, Calendar, Clock, BarChart2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useSessionStore } from "@/store/session";
import { DifficultyBadge } from "@/components/DifficultyBadge";

export default function SessionsPage() {
  const sessions = useSessionStore((s) => s.sessions);
  const reports = useSessionStore((s) => s.reports);
  const remove = useSessionStore((s) => s.remove);
  const list = Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-14">
        <header className="flex items-end justify-between mb-10">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-wider text-accent-rust mb-2">
              your work
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-mahogany">
              Sessions
            </h1>
            <p className="mt-2 text-mahogany-soft">
              Stored locally on this device. {list.length} total.
            </p>
          </div>
          <Link to="/setup" className="aria-btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New session
          </Link>
        </header>

        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {list.map((s, i) => {
              const r = reports[s.id];
              const done = s.complete && r;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="aria-card p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl shrink-0"
                      style={{
                        background: done
                          ? "var(--mahogany)"
                          : "oklch(0.93 0.018 65)",
                        color: done ? "var(--cream)" : "var(--mahogany)",
                      }}
                    >
                      {done ? (r.overall_score * 10).toFixed(1) : "—"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-mahogany truncate">{s.role}</p>
                      <p className="text-xs text-warm-muted font-mono mt-0.5">
                        {new Date(s.createdAt).toLocaleString()} ·{" "}
                        {s.focus} · turn {s.turns.length}/{s.maxTurns}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {done ? (
                      <Link
                        to={`/session/${s.id}/report`}
                        className="px-3 py-2 rounded-lg text-sm border border-card-border hover:border-mahogany-soft text-mahogany inline-flex items-center gap-1.5 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Report
                      </Link>
                    ) : (
                      <Link to={`/session/${s.id}`} className="aria-btn-primary py-2 px-4 text-xs inline-flex items-center gap-2">
                        Resume Session
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    <button
                      onClick={() => remove(s.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-warm-muted hover:text-accent-rust hover:bg-warm-white transition"
                      aria-label="Delete session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="aria-card p-16 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
        <FileText className="w-6 h-6 text-mahogany-soft" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-2xl text-mahogany mt-5">
        No sessions yet
      </h3>
      <p className="mt-2 text-mahogany-soft max-w-md mx-auto text-sm">
        Your first session is the most valuable — it sets a baseline you can
        measure every future practice run against.
      </p>
      <Link to="/setup" className="aria-btn-primary inline-flex mt-6 items-center gap-2">
        Start your first session
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
