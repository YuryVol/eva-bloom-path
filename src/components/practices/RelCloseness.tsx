import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { BreathingCircle, PATTERN_BOX } from "./BreathingCircle";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const CLOSENESS_BARRIERS = [
  "Боюсь показаться слабой",
  "Не умею принимать заботу",
  "Боюсь потерять человека, если стану ближе",
  "Не знаю, как начать",
  "Привыкла всё держать в себе",
  "Боюсь отвержения",
];

const CLOSENESS_STEPS_DESC = [
  { label: "Дыхание вместе", desc: "Сядьте рядом. Попробуйте дышать в одном ритме — просто замечая друг друга." },
  { label: "Взгляд без слов", desc: "30 секунд смотрите в глаза. Не нужно ничего говорить. Просто быть видимой." },
  { label: "Прикосновение", desc: "Положите руку на руку другого человека. Почувствуйте тепло." },
  { label: "Одно честное слово", desc: "Скажите одно слово о том, как вы себя чувствуете прямо сейчас. Без объяснений." },
];

export default function RelCloseness({ onComplete, onSkip }: PracticeProps) {
  const [barriers, setBarriers] = useState<string[]>([]);
  const [breathDone, setBreathDone] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [integration, setIntegration] = useState("");

  const toggleBarrier = (b: string) =>
    setBarriers((s) => (s.includes(b) ? s.filter((x) => x !== b) : [...s, b]));

  const toggleStep = (i: number) =>
    setCompletedSteps((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отношения · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Телесная близость</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Близость — не случайность, это навык. Он живёт в теле — в дыхании,
            взгляде, прикосновении. Сегодня мы закрепим его через маленькие шаги.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Настоящая близость — это когда тебя видят и ты не убегаешь.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "barriers",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Что мешает тебе быть ближе к людям, которых ты любишь?
            Отметь то, что резонирует:
          </p>
          <div className="flex flex-col gap-2">
            {CLOSENESS_BARRIERS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBarrier(b)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                  barriers.includes(b)
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground"
                }`}
              >
                {barriers.includes(b) ? "✓ " : ""}{b}
              </button>
            ))}
          </div>
          {barriers.length > 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs italic text-muted-foreground/70 text-center">
              Видеть барьер — первый шаг к тому, чтобы он уменьшился.
            </motion.p>
          )}
        </div>
      ),
    },
    {
      key: "breathe",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground text-center">
            Начнём с тела. Дыхание «квадрат» — это способ синхронизироваться с собой
            перед тем, как открыться другому.
          </p>
          <BreathingCircle pattern={PATTERN_BOX} onComplete={() => setBreathDone(true)} />
          {breathDone && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-sm italic text-primary">
              Ты в контакте с собой. Теперь — с другим.
            </motion.p>
          )}
        </div>
      ),
      nextDisabled: !breathDone,
      nextLabel: "Я дышала",
    },
    {
      key: "practice",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Эти упражнения можно делать с близким человеком — или только представить их.
            Отметь те, что ты готова попробовать:
          </p>
          {CLOSENESS_STEPS_DESC.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleStep(i)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                completedSteps.includes(i)
                  ? "border-primary/60 bg-primary/10"
                  : "border-border/60 bg-card/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                  completedSteps.includes(i) ? "border-primary bg-primary text-white" : "border-border/60"
                }`}>
                  {completedSteps.includes(i) ? "✓" : (i + 1)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      key: "integrate",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Что ты замечаешь в себе после этой практики? Что стало чуть ближе —
            к себе или к другим?
          </p>
          <textarea
            value={integration}
            onChange={(e) => setIntegration(e.target.value)}
            placeholder="Я почувствовала, что близость — это..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Навык близости растёт через маленькие шаги.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
