import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  name: string;
  role: string;
  description: string;
  index?: number;
  active?: boolean;
}

export function AgentCard({ icon: Icon, name, role, description, index = 0, active }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="aria-card p-6 flex flex-col h-full relative overflow-hidden group"
    >
      {active && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-[0.65rem] font-mono uppercase tracking-wider text-accent-sage">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-sage animate-pulse" />
          active
        </span>
      )}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ background: "oklch(0.92 0.025 60)", color: "var(--mahogany)" }}
      >
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-warm-muted mb-1">
        {role}
      </p>
      <h3 className="font-display text-xl text-mahogany mb-2">{name}</h3>
      <p className="text-sm text-mahogany-soft leading-relaxed">{description}</p>
      <div
        className="absolute -bottom-px left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-rust), transparent)",
          opacity: 0,
          transition: "opacity 240ms ease",
        }}
      />
      <style>{`.group:hover > div:last-child { opacity: 1; }`}</style>
    </motion.div>
  );
}
