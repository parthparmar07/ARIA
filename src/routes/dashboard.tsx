import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, BookOpen, MicOff, Target, Briefcase, Zap } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getLoops } from "@/lib/api";
import type { InterviewLoop } from "@/types";

export default function Dashboard() {
  const [loops, setLoops] = useState<InterviewLoop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLoops().then(res => {
      setLoops(res);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
      <Nav />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="font-mono text-[0.75rem] uppercase tracking-wider text-accent-rust mb-2">
            Welcome back
          </p>
          <h1 className="font-display text-4xl text-mahogany">
            Candidate Pipeline
          </h1>
          <p className="mt-2 text-mahogany-soft text-sm">
            Manage your active job applications and prepare for specific roles.
          </p>
        </header>

        {/* Primary Call to Action */}
        <section className="mb-12">
          <Link 
            to="/loops/new" 
            className="group relative aria-card p-8 overflow-hidden flex items-center justify-between min-h-[140px] border-2 border-transparent hover:border-mahogany transition-colors bg-mahogany text-cream"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-rust opacity-20 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-110 transition-transform" />
            <div className="relative z-10 max-w-lg">
              <h3 className="font-display text-3xl mb-2">Create New Interview Loop</h3>
              <p className="text-cream/80 text-sm">Upload your resume and a target Job Description. ARIA will analyze the fit and build a custom multi-round mock interview pipeline.</p>
            </div>
            <div className="relative z-10 w-14 h-14 rounded-full bg-cream/10 flex items-center justify-center text-cream border border-cream/20">
              <Plus className="w-6 h-6" />
            </div>
          </Link>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Loops */}
          <section className="lg:col-span-2">
            <h2 className="font-display text-2xl text-mahogany flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-accent-rust" />
              Active Job Pipelines
            </h2>

            <div className="space-y-4">
              {loading ? (
                <div className="aria-card p-10 text-center border-dashed">
                  <p className="text-mahogany-soft animate-pulse">Loading pipelines...</p>
                </div>
              ) : loops.length === 0 ? (
                <div className="aria-card p-10 text-center border-dashed">
                  <p className="text-mahogany-soft mb-4">No active interview loops.</p>
                </div>
              ) : (
                loops.map((loop, i) => (
                  <motion.div
                    key={loop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/loops/${loop.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-card-border rounded-xl hover:border-mahogany/30 hover:shadow-md transition-all gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-warm-white border border-card-border flex items-center justify-center text-mahogany">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-mahogany text-lg">{loop.target_role}</h3>
                          <p className="text-sm text-warm-muted">{loop.target_company}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[0.65rem] font-mono uppercase text-warm-muted">JD Match</p>
                          <p className={`font-display text-xl ${loop.match_score >= 80 ? 'text-accent-sage' : loop.match_score >= 50 ? 'text-accent-amber' : 'text-accent-rust'}`}>
                            {loop.match_score}%
                          </p>
                        </div>
                        <div className="text-sm text-accent-rust font-medium group-hover:translate-x-1 transition-transform">
                          Command Center →
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Tools Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <h2 className="font-display text-xl text-mahogany mb-4">Toolkit</h2>
            
            <Link to="/setup" className="group relative aria-card p-5 overflow-hidden flex items-center gap-4 border-2 border-transparent hover:border-accent-amber transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-amber/10 text-accent-amber flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg text-mahogany">Quick Session</h3>
                <p className="text-xs text-mahogany-soft mt-0.5">Generic mock interview</p>
              </div>
            </Link>

            <Link to="/stealth" className="group relative aria-card p-5 overflow-hidden flex items-center gap-4 border-2 border-transparent hover:border-mahogany transition-colors">
              <div className="w-10 h-10 rounded-xl bg-mahogany/10 text-mahogany flex items-center justify-center shrink-0">
                <MicOff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg text-mahogany">Stealth Copilot</h3>
                <p className="text-xs text-mahogany-soft mt-0.5">Live hints for real interviews</p>
              </div>
            </Link>

            <Link to="/resume" className="group relative aria-card p-5 overflow-hidden flex items-center gap-4 border-2 border-transparent hover:border-accent-rust transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent-rust/10 text-accent-rust flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg text-mahogany">Resume Builder</h3>
                <p className="text-xs text-mahogany-soft mt-0.5">Edit based on feedback</p>
              </div>
            </Link>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
