import { STEPS, type StepId } from "@/lib/journey-types";

export function ProgressBar({ currentStep }: { currentStep: StepId }) {
  const idx = STEPS.indexOf(currentStep);
  const pct = ((idx + 1) / STEPS.length) * 100;
  return (
    <div className="w-full">
      <div className="h-1 w-full overflow-hidden rounded-full bg-card/60">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${pct}%`, boxShadow: "0 0 16px oklch(0.82 0.13 200 / 0.6)" }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Шаг {idx + 1}</span>
        <span>из {STEPS.length}</span>
      </div>
    </div>
  );
}
