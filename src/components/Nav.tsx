import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { MODE } from "@/lib/api";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/loops/new", label: "New Pipeline" },
  { to: "/stealth", label: "Stealth Copilot" },
  { to: "/vault", label: "Story Vault" },
  { to: "/resume", label: "Resume Builder" },
  { to: "/setup", label: "Quick Session" },
] as const;

export function Nav() {
  const location = useLocation();
  const path = location.pathname;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream/75 border-b border-card-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className="relative px-3 py-1.5 text-sm text-mahogany-soft hover:text-mahogany transition-colors"
                >
                  {n.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-accent-rust" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border border-card-border text-warm-muted"
            title={MODE === "mock" ? "Frontend mock orchestrator" : "Connected to FastAPI backend"}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: MODE === "mock" ? "var(--accent-amber)" : "var(--accent-sage)" }}
            />
            {MODE === "mock" ? "" : "live backend"}
          </span>
          <Link to="/loops/new" className="aria-btn-primary text-sm py-2 px-4">
            Create Pipeline →
          </Link>
        </div>
      </div>
    </header>
  );
}
