export function Footer() {
  return (
    <footer className="border-t border-card-border mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="font-display text-mahogany text-lg">ARIA</p>
          <p className="text-sm text-warm-muted mt-1">
            Adaptive Role Intelligence for Interviews · A multi-agent simulation system
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-warm-muted font-mono uppercase tracking-wider">
          <span>v1.0</span>
          <span>·</span>
          <span></span>
        </div>
      </div>
    </footer>
  );
}
