type Risk = "low" | "medium" | "high";

const CONFIG: Record<Risk, { label: string; cls: string }> = {
  low:    { label: "Активен", cls: "bg-emerald-500/15 text-emerald-600" },
  medium: { label: "Риск",   cls: "bg-amber-500/15 text-amber-600" },
  high:   { label: "Отток",  cls: "bg-rose-500/15 text-rose-600" },
};

export function ChurnBadge({ risk }: { risk: Risk }) {
  const c = CONFIG[risk];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.cls}`}>
      {c.label}
    </span>
  );
}
