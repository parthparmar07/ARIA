import { motion } from "framer-motion";

interface Props {
  value: number; // 0..1
  label: string;
  size?: number;
}

export function ScoreRing({ value, label, size = 96 }: Props) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - Math.max(0, Math.min(1, value)));

  const color =
    value >= 0.75
      ? "var(--accent-sage)"
      : value >= 0.4
        ? "var(--accent-amber)"
        : "var(--accent-rust)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--card-border)"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl text-mahogany">
            {(value * 10).toFixed(1)}
          </span>
        </div>
      </div>
      <span className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
        {label}
      </span>
    </div>
  );
}

export function ScoreBar({ value, label }: { value: number; label: string }) {
  const color =
    value >= 0.75
      ? "var(--accent-sage)"
      : value >= 0.4
        ? "var(--accent-amber)"
        : "var(--accent-rust)";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-warm-muted">
          {label}
        </span>
        <span className="font-mono text-xs text-mahogany">{(value * 10).toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
