import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type BreathingPattern = {
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
};

export const PATTERN_478: BreathingPattern = { inhale: 4, hold: 7, exhale: 8, cycles: 3 };
export const PATTERN_BOX: BreathingPattern = { inhale: 4, hold: 4, exhale: 4, cycles: 4 };
export const PATTERN_SIMPLE: BreathingPattern = { inhale: 4, hold: 0, exhale: 6, cycles: 4 };

type Phase = "idle" | "inhale" | "hold" | "exhale" | "done";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "Нажми, чтобы начать",
  inhale: "Вдох",
  hold: "Задержка",
  exhale: "Выдох",
  done: "Хорошо",
};

interface Props {
  pattern?: BreathingPattern;
  onComplete: () => void;
}

export function BreathingCircle({ pattern = PATTERN_478, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const runPhase = (p: Phase, duration: number, next: () => void) => {
    setPhase(p);
    setCount(duration);
    const tick = (remaining: number) => {
      if (remaining <= 0) {
        next();
        return;
      }
      timerRef.current = setTimeout(() => {
        setCount(remaining - 1);
        tick(remaining - 1);
      }, 1000);
    };
    timerRef.current = setTimeout(() => tick(duration - 1), 1000);
  };

  const runCycle = (cycleIdx: number) => {
    runPhase("inhale", pattern.inhale, () => {
      const afterHold = () =>
        runPhase("exhale", pattern.exhale, () => {
          const nextCycle = cycleIdx + 1;
          if (nextCycle >= pattern.cycles) {
            setPhase("done");
            onComplete();
          } else {
            runCycle(nextCycle);
          }
        });
      if (pattern.hold > 0) {
        runPhase("hold", pattern.hold, afterHold);
      } else {
        afterHold();
      }
    });
  };

  const start = () => {
    clear();
    setCycle(0);
    runCycle(0);
  };

  useEffect(() => () => clear(), []);

  const circleScale =
    phase === "inhale" ? 1.35 : phase === "hold" ? 1.35 : phase === "exhale" ? 1 : 1;
  const cycleDuration =
    phase === "inhale"
      ? pattern.inhale
      : phase === "hold"
        ? pattern.hold
        : phase === "exhale"
          ? pattern.exhale
          : 0.3;

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="relative flex h-48 w-48 items-center justify-center">
        {/* outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: circleScale, opacity: phase === "idle" ? 0.3 : 0.6 }}
          transition={{ duration: cycleDuration, ease: "easeInOut" }}
        />
        {/* main circle */}
        <motion.div
          className="absolute inset-4 rounded-full bg-primary/20"
          style={{ boxShadow: "0 0 40px oklch(0.74 0.13 70 / 0.25)" }}
          animate={{ scale: circleScale }}
          transition={{ duration: cycleDuration, ease: "easeInOut" }}
        />
        {/* inner glow */}
        <motion.div
          className="absolute inset-10 rounded-full bg-primary/40"
          animate={{ scale: circleScale, opacity: phase === "hold" ? 1 : 0.6 }}
          transition={{ duration: cycleDuration, ease: "easeInOut" }}
        />
        {/* counter */}
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              {PHASE_LABELS[phase]}
            </motion.p>
          </AnimatePresence>
          {phase !== "idle" && phase !== "done" && (
            <p className="mt-1 font-display text-4xl text-foreground">{count}</p>
          )}
        </div>
      </div>

      <div className="text-center">
        {phase === "idle" && (
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-[0_8px_28px_oklch(0.74_0.13_70/0.4)] transition hover:scale-105"
          >
            Начать
          </button>
        )}
        {(phase === "inhale" || phase === "hold" || phase === "exhale") && (
          <p className="text-xs text-muted-foreground">
            Цикл {cycle + 1} / {pattern.cycles}
          </p>
        )}
        {phase === "done" && (
          <p className="text-sm text-muted-foreground italic">
            Сделай паузу — почувствуй результат.
          </p>
        )}
      </div>
    </div>
  );
}
