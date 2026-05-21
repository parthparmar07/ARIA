import { Link } from "react-router-dom";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="ARIA home">
      <span
        className="relative inline-flex items-center justify-center rounded-full text-cream font-display font-semibold transition-transform group-hover:scale-105"
        style={{
          width: size,
          height: size,
          background: "var(--mahogany)",
          fontSize: size * 0.5,
          letterSpacing: "-0.04em",
        }}
        aria-hidden
      >
        A
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px oklch(0.62 0.13 55 / 0.4)" }}
        />
      </span>
      <span className="font-display text-[1.35rem] tracking-tight text-mahogany font-semibold">
        ARIA
      </span>
    </Link>
  );
}
