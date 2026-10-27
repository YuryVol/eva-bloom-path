import { useEffect, useRef, useState } from "react";
import { useJourneyStore } from "@/lib/journey-store";
import { getEstimatedLength } from "@/lib/sphere-journeys";
import { type SphereId, type StepId } from "@/lib/journey-types";

export function ProgressBar({ currentStep }: { currentStep: StepId }) {
  const steps = useJourneyStore((s) => s.steps);
  const sphere = useJourneyStore((s) => s.state.priority_sphere) as SphereId | "";
  const estimated = sphere ? getEstimatedLength(sphere) : 9;
  const pct = Math.min(100, (steps.length / estimated) * 100);
  const stepPct = 100 / estimated;

  // On each mount start one step behind, then animate to current pct
  const [displayPct, setDisplayPct] = useState(() => Math.max(0, pct - stepPct));
  const raf = useRef<number>(0);
  useEffect(() => {
    raf.current = requestAnimationFrame(() => setDisplayPct(pct));
    return () => cancelAnimationFrame(raf.current);
  }, [pct]);

  return (
    <div className="w-full">
      <div className="h-1 w-full overflow-hidden rounded-full bg-card/60">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-700 ease-out"
          style={{ width: `${displayPct}%`, boxShadow: "0 0 16px oklch(0.82 0.13 200 / 0.6)" }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Шаг {steps.length}</span>
        <span>из ~{estimated}</span>
      </div>
    </div>
  );
}
