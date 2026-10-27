import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import type { PracticeProps } from "@/types/practice";

const SCAN_STEPS = [
  { id: "feet", label: "Стопы и пальцы ног", hint: "Почувствуй их вес, тепло или прохладу. Можешь чуть пошевелить пальцами." },
  { id: "calves", label: "Голени и колени", hint: "Есть ли здесь напряжение? Просто замечай — не нужно менять." },
  { id: "thighs", label: "Бёдра и таз", hint: "Позволь им стать тяжелее. Отпусти любое сжатие." },
  { id: "belly", label: "Живот", hint: "Как ты дышишь? Поверхностно или глубоко? Просто наблюдай." },
  { id: "chest", label: "Грудь и сердце", hint: "Почувствуй удары сердца. Поблагодари его — оно работает без остановки." },
  { id: "hands", label: "Руки и ладони", hint: "Есть ли тепло в ладонях? Ощущение пульса в кончиках пальцев?" },
  { id: "shoulders", label: "Плечи и шея", hint: "Здесь часто живёт стресс. Позволь плечам опуститься чуть ниже." },
  { id: "face", label: "Лицо и голова", hint: "Расслабь лоб, веки, челюсть. Язык пусть лежит свободно." },
];

export default function RestBodyScan({ onComplete, onSkip }: PracticeProps) {
  const [phase, setPhase] = useState<"intro" | "scan" | "done">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [timer, setTimer] = useState(20);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = SCAN_STEPS[stepIdx];
  const isLastStep = stepIdx === SCAN_STEPS.length - 1;

  useEffect(() => {
    if (phase !== "scan") return;
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase, stepIdx]);

  const advance = () => {
    clearInterval(intervalRef.current!);
    if (isLastStep) {
      setPhase("done");
    } else {
      setStepIdx((i) => i + 1);
      setTimer(20);
    }
  };

  const startScan = () => {
    setPhase("scan");
    setTimer(20);
  };

  const progress = ((stepIdx + (timer === 0 ? 1 : (20 - timer) / 20)) / SCAN_STEPS.length) * 100;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-2">
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отдых · Расслабление</p>
            <h2 className="font-display text-3xl text-glow">Сканирование тела</h2>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              Ляг или сядь удобно. Закрой глаза, если хочется. Мы медленно пройдём по телу
              снизу вверх — замечая, не исправляя.
            </p>
            <GlassCard className="w-full max-w-xs p-4">
              <p className="text-sm italic text-foreground/80 text-center">
                «Внимание к телу — это уже забота о нём.»
              </p>
            </GlassCard>
            <p className="text-xs text-muted-foreground">~3–4 минуты · 8 зон · 20 с на каждую</p>
            <GlowButton onClick={startScan}>Начать</GlowButton>
            <button type="button" onClick={onSkip} className="text-xs text-muted-foreground/50 underline-offset-2 hover:underline">
              Пропустить
            </button>
          </motion.div>
        )}

        {phase === "scan" && (
          <motion.div
            key={`scan-${stepIdx}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex w-full flex-col items-center gap-6"
          >
            {/* progress bar */}
            <div className="w-full max-w-sm h-1 rounded-full bg-border/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              {stepIdx + 1} / {SCAN_STEPS.length}
            </p>

            <div className="flex flex-col items-center gap-2 text-center max-w-sm">
              <p className="font-display text-2xl text-foreground">{currentStep.label}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{currentStep.hint}</p>
            </div>

            {/* countdown ring */}
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="40" cy="40" r="34"
                  fill="none"
                  stroke="oklch(0.74 0.13 70)"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - timer / 20)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="font-display text-2xl text-foreground">{timer}</span>
            </div>

            <button
              type="button"
              onClick={advance}
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-[0_8px_28px_oklch(0.74_0.13_70/0.4)] transition hover:scale-105"
            >
              {isLastStep ? "Завершить" : "Далее →"}
            </button>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="text-5xl">🌙</div>
            <p className="font-display text-2xl text-glow">Хорошо сделано</p>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Ты только что дала телу полное внимание. Замечаешь, как изменилось дыхание?
              Как стало чуть тяжелее и спокойнее?
            </p>
            <GlowButton onClick={onComplete}>Завершить</GlowButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
