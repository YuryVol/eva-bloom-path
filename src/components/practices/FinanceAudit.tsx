import { useState } from "react";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const RESOURCE_CATEGORIES = [
  { id: "income", label: "Источник дохода", icon: "💼", example: "работа, фриланс, пассив" },
  { id: "savings", label: "Накопления", icon: "🏦", example: "подушка, вклад, инвестиции" },
  { id: "skills", label: "Навыки = потенциал", icon: "🧠", example: "чему ты умеешь учить других" },
  { id: "network", label: "Люди-ресурс", icon: "🤝", example: "кто может помочь или порекомендовать" },
  { id: "assets", label: "Материальные активы", icon: "🏠", example: "имущество, техника, авто" },
  { id: "health", label: "Здоровье = капитал", icon: "💚", example: "энергия, выносливость" },
];

export default function FinanceAudit({ onComplete, onSkip }: PracticeProps) {
  const [resources, setResources] = useState<Record<string, string>>({});
  const [feeling, setFeeling] = useState("");
  const [oneStep, setOneStep] = useState("");

  const update = (id: string, val: string) =>
    setResources((r) => ({ ...r, [id]: val }));

  const filledCount = Object.values(resources).filter((v) => v.trim().length > 0).length;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Финансы · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Аудит ресурсов</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Финансовая тревога часто питается туманом: «всё плохо, всё непонятно». Факты
            успокаивают. Посмотрим на то, что у тебя уже есть.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Ресурс — не только деньги. Это всё, на что можно опереться.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "fill",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Для каждой категории напиши хотя бы одно слово. Не оценивай — просто замечай.
          </p>
          {RESOURCE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground/80">
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </label>
              <input
                value={resources[cat.id] ?? ""}
                onChange={(e) => update(cat.id, e.target.value)}
                placeholder={cat.example}
                className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
      ),
      nextDisabled: filledCount < 2,
    },
    {
      key: "observe",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Посмотри на то, что ты написала. Что ты чувствуешь?
          </p>
          <div className="rounded-2xl border border-border/40 bg-card/40 p-4 flex flex-col gap-2">
            {RESOURCE_CATEGORIES.filter((c) => resources[c.id]?.trim()).map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <span>{c.icon}</span>
                <span className="text-muted-foreground">{c.label}:</span>
                <span className="text-foreground">{resources[c.id]}</span>
              </div>
            ))}
          </div>
          <textarea
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="Когда я смотрю на этот список, я чувствую..."
            rows={2}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
    },
    {
      key: "action",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Из этих ресурсов — какой один маленький шаг ты могла бы сделать на этой неделе?
            Не план, не стратегия — просто следующий шаг.
          </p>
          <textarea
            value={oneStep}
            onChange={(e) => setOneStep(e.target.value)}
            placeholder="Например: позвонить знакомому насчёт подработки..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Ты видишь больше, чем думала.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
