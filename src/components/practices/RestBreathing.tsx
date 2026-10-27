import { useState } from "react";
import { BreathingCircle, PATTERN_SIMPLE } from "./BreathingCircle";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import type { PracticeProps } from "@/types/practice";

// 90-second practice: simple 4-0-6 pattern, 4 cycles ≈ 40s, padded with pause
export default function RestBreathing({ onComplete, onSkip }: PracticeProps) {
  const [phase, setPhase] = useState<"intro" | "breathe" | "done">("intro");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-2">
      {phase === "intro" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отдых · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Дыхание 90 секунд</h2>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
            90 секунд. Ничего не нужно делать, решать, планировать. Просто быть.
          </p>
          <GlassCard className="w-full max-w-xs p-4">
            <p className="text-sm italic text-foreground/80 text-center">
              «Пауза — это не потеря времени. Это его обретение.»
            </p>
          </GlassCard>
          <GlowButton onClick={() => setPhase("breathe")}>Начать</GlowButton>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted-foreground/50 underline-offset-2 hover:underline"
          >
            Пропустить
          </button>
        </div>
      )}

      {phase === "breathe" && (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-sm text-muted-foreground text-center">
            Следуй за кругом. 4 цикла · ~90 секунд.
          </p>
          <BreathingCircle
            pattern={PATTERN_SIMPLE}
            onComplete={() => setPhase("done")}
          />
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-5xl">🌿</div>
          <p className="font-display text-2xl text-glow">Хорошо</p>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
            Ты только что дала себе 90 секунд. Замечаешь разницу?
            Это и есть отдых — не обязательно долгий.
          </p>
          <GlowButton onClick={onComplete}>Завершить</GlowButton>
        </div>
      )}
    </div>
  );
}
