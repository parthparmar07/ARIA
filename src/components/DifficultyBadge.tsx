import { difficultyLabel } from "@/lib/mock-orchestrator";

export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const label = difficultyLabel(difficulty);
  const filled = Math.round(difficulty * 5);
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-card-border bg-warm-white">
      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-warm-muted">
        difficulty
      </span>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="w-1 h-3 rounded-full"
            style={{
              background:
                i < filled ? "var(--accent-rust)" : "var(--card-border)",
            }}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-mahogany">{label}</span>
    </span>
  );
}
