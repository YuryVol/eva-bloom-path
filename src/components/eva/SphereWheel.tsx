import { SPHERES, type SphereId } from "@/lib/journey-types";

interface Props {
  mode: "select" | "score";
  selected: SphereId[];
  scores?: Record<string, number>;
  onToggle?: (id: SphereId) => void;
}

const SIZE = 320;
const CENTER = SIZE / 2;
const R = 130;

export function SphereWheel({ mode, selected, scores = {}, onToggle }: Props) {
  const slice = (Math.PI * 2) / SPHERES.length;
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-sm"
      aria-label="Колесо жизни"
    >
      <defs>
        <radialGradient id="wheel-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.74 0.13 70 / 0.45)" />
          <stop offset="100%" stopColor="oklch(0.96 0.018 85 / 0)" />
        </radialGradient>
      </defs>
      <circle cx={CENTER} cy={CENTER} r={R + 8} fill="url(#wheel-center)" />
      {SPHERES.map((s, i) => {
        const a0 = -Math.PI / 2 + i * slice;
        const a1 = a0 + slice;
        const isSel = selected.includes(s.id);
        const score = scores[s.id] ?? 0;
        const r = mode === "score" && score > 0 ? (R * score) / 10 : isSel ? R : R * 0.6;
        const x0 = CENTER + Math.cos(a0) * r;
        const y0 = CENTER + Math.sin(a0) * r;
        const x1 = CENTER + Math.cos(a1) * r;
        const y1 = CENTER + Math.sin(a1) * r;
        const path = `M ${CENTER} ${CENTER} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`;
        const am = (a0 + a1) / 2;
        const labelR = R + 22;
        const lx = CENTER + Math.cos(am) * labelR;
        const ly = CENTER + Math.sin(am) * labelR;
        return (
          <g key={s.id} onClick={() => onToggle?.(s.id)} className={mode === "select" ? "cursor-pointer" : ""}>
            <path
              d={path}
              fill={isSel ? "oklch(0.74 0.13 70 / 0.45)" : "oklch(0.55 0.04 60 / 0.06)"}
              stroke={isSel ? "oklch(0.74 0.13 70 / 0.85)" : "oklch(0.55 0.04 60 / 0.3)"}
              strokeWidth={1.5}
              style={{
                transition: "all 0.4s ease",
                filter: isSel ? "drop-shadow(0 4px 10px oklch(0.74 0.13 70 / 0.45))" : "none",
              }}
            />
            <text
              x={lx}
              y={ly}
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isSel ? "oklch(0.32 0.025 60)" : "oklch(0.5 0.025 70)"}
              style={{ pointerEvents: "none", letterSpacing: "0.05em" }}
            >
              {s.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
