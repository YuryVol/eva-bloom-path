interface PremiumBadgeProps {
  onClick?: () => void;
  size?: "sm" | "md";
}

export function PremiumBadge({ onClick, size = "sm" }: PremiumBadgeProps) {
  const cls = size === "sm"
    ? "inline-flex items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 border border-amber-400/30"
    : "inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-1 text-xs font-medium text-amber-600 border border-amber-400/30";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cls} cursor-pointer hover:bg-amber-400/30 transition`}>
        ✨ Premium
      </button>
    );
  }
  return <span className={cls}>✨ Premium</span>;
}
