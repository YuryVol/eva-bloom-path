import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlowButton } from "@/components/eva/GlowButton";

export interface WizardStep {
  key: string;
  content: ReactNode;
  /** Label for the "next" button on this step. Defaults to "Далее". */
  nextLabel?: string;
  /** If true, the next button is disabled (e.g. waiting for user input). */
  nextDisabled?: boolean;
  /** Called when user presses Next on this step. Return false to block advance. */
  onNext?: () => boolean | void;
}

interface Props {
  steps: WizardStep[];
  onComplete: () => void;
  onSkip?: () => void;
  completeLabel?: string;
  showProgress?: boolean;
}

export function StepWizard({
  steps,
  onComplete,
  onSkip,
  completeLabel = "Завершить",
  showProgress = true,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  const handleNext = () => {
    if (step.onNext) {
      const result = step.onNext();
      if (result === false) return;
    }
    if (isLast) {
      onComplete();
      return;
    }
    setDir(1);
    setIdx((i) => i + 1);
  };

  const handleBack = () => {
    if (idx === 0) return;
    setDir(-1);
    setIdx((i) => i - 1);
  };

  return (
    <div className="flex h-full flex-col">
      {showProgress && (
        <div className="mb-4 flex gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= idx ? "bg-primary" : "bg-border/50"
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step.key}
            custom={dir}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step.content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 pb-2">
        <GlowButton
          onClick={handleNext}
          disabled={step.nextDisabled}
        >
          {isLast ? completeLabel : (step.nextLabel ?? "Далее")}
        </GlowButton>

        <div className="flex items-center gap-4">
          {idx > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="text-xs text-muted-foreground/60 underline-offset-2 transition hover:text-muted-foreground hover:underline"
            >
              Назад
            </button>
          )}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground/60 underline-offset-2 transition hover:text-muted-foreground hover:underline"
            >
              Пропустить практику
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
