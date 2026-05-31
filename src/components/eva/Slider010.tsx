import { useId } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label?: string;
  variant?: "default" | "compact";
}

export function Slider010({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  variant = "default",
}: Props) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const compact = variant === "compact";
  return (
    <div className={cn("w-full", compact ? "space-y-2" : "space-y-3")}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={id} className={cn("text-sm text-foreground/85", compact && "text-[13px]")}>
            {label}
          </label>
          {compact && (
            <span className="font-display text-lg leading-none text-foreground">{value}</span>
          )}
        </div>
      )}
      <div className="relative">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
            style={{ width: `${pct}%`, boxShadow: `0 0 ${14 + pct / 4}px oklch(0.74 0.13 70 / 0.4)` }}
          />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          step={1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 size-6 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary shadow-[0_4px_18px_oklch(0.74_0.13_70/0.55)] transition-all"
          style={{ left: `${pct}%` }}
        />
      </div>
      {!compact && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{min}</span>
          <span className="text-lg font-display text-foreground">{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
