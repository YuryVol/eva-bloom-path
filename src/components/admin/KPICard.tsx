interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}

export function KPICard({ label, value, sub, highlight }: KPICardProps) {
  return (
    <div className={[
      "rounded-2xl border p-4 flex flex-col gap-1",
      highlight ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card",
    ].join(" ")}>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold font-display">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}
