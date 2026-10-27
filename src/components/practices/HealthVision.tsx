import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const VISION_PROMPTS = [
  { q: "Как ты себя чувствуешь утром?", placeholder: "Я просыпаюсь и чувствую..." },
  { q: "Что ты делаешь для тела каждый день?", placeholder: "Каждый день я..." },
  { q: "Как выглядит твоя энергия?", placeholder: "У меня достаточно сил, чтобы..." },
  { q: "Что изменилось в отношениях с едой?", placeholder: "Я ем то, что..." },
  { q: "Как тело ощущает себя изнутри?", placeholder: "Внутри я чувствую..." },
];

const HEALTH_OBSTACLES = [
  "Нет времени",
  "Нет сил начинать",
  "Не знаю с чего начать",
  "Уже пробовала — не получилось",
  "Привычки сильнее намерений",
  "Боюсь разочароваться снова",
];

export default function HealthVision({ onComplete, onSkip }: PracticeProps) {
  const [currentState, setCurrentState] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [obstacles, setObstacles] = useState<string[]>([]);
  const [oneStep, setOneStep] = useState("");

  const updateAnswer = (i: number, val: string) =>
    setAnswers((a) => ({ ...a, [i]: val }));

  const toggleObstacle = (o: string) =>
    setObstacles((s) => (s.includes(o) ? s.filter((x) => x !== o) : [...s, o]));

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;
  const targetYear = new Date().getFullYear() + 1;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Здоровье · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Тело через год</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Воображение — самый мощный инструмент изменений. Мозг начинает двигаться
            к тому образу, который мы создаём внутри. Создадим его вместе.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Тело следует за образом. Образ создаёт намерение. Намерение — действие.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "now",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Прежде чем заглянуть в будущее — где ты сейчас? Как ощущается твоё тело
            прямо сейчас? Без оценки — просто честно.
          </p>
          <textarea
            value={currentState}
            onChange={(e) => setCurrentState(e.target.value)}
            placeholder="Сейчас моё тело чувствует себя..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Точка А — это не приговор. Это просто начало.
          </p>
        </div>
      ),
      nextDisabled: currentState.trim().length < 5,
    },
    {
      key: "vision",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Сейчас — <span className="font-medium text-foreground">{targetYear} год</span>.
            Твоё тело здоровое, отдохнувшее, живое. Ответь из этого места:
          </p>
          {VISION_PROMPTS.map((p, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground/70">{p.q}</label>
              <textarea
                value={answers[i] ?? ""}
                onChange={(e) => updateAnswer(i, e.target.value)}
                placeholder={p.placeholder}
                rows={2}
                className="w-full resize-none rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
      ),
      nextDisabled: answeredCount < 2,
      nextLabel: "Я вижу это",
    },
    {
      key: "obstacles",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Что обычно мешает тебе двигаться к этому образу? Отметь честно:
          </p>
          <div className="flex flex-col gap-2">
            {HEALTH_OBSTACLES.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => toggleObstacle(o)}
                className={`rounded-2xl border px-4 py-2.5 text-left text-sm transition-all ${
                  obstacles.includes(o)
                    ? "border-rose-300/50 bg-rose-50/30 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground"
                }`}
              >
                {obstacles.includes(o) ? "✓ " : ""}{o}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "bridge",
      content: (
        <div className="flex flex-col gap-5">
          <AnimatePresence>
            {answeredCount > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Твой образ здоровья:</p>
                  <p className="text-sm text-foreground/80 italic leading-relaxed">
                    {Object.values(answers).filter(Boolean).join(" · ")}
                  </p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="text-sm text-muted-foreground">
            Один маленький шаг, который ты можешь сделать на этой неделе — к этому образу:
          </p>
          <textarea
            value={oneStep}
            onChange={(e) => setOneStep(e.target.value)}
            placeholder="Например: лечь спать в 23:00 три дня подряд..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Тело меняется через маленькие, последовательные шаги.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
