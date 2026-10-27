import { useState } from "react";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const FIGURES = [
  { id: "mom", label: "Мама", icon: "🌸" },
  { id: "dad", label: "Папа", icon: "🌿" },
  { id: "partner", label: "Партнёр", icon: "💛" },
  { id: "friend", label: "Друг / подруга", icon: "🌻" },
  { id: "mentor", label: "Наставник", icon: "🕯️" },
  { id: "ancestor", label: "Ушедший близкий", icon: "⭐" },
  { id: "child", label: "Ребёнок", icon: "🍃" },
  { id: "pet", label: "Питомец", icon: "🐾" },
];

export default function FamilyAnchor({ onComplete, onSkip }: PracticeProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [focus, setFocus] = useState("");

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const chosenLabels = FIGURES.filter((f) => selected.includes(f.id))
    .map((f) => f.label)
    .join(", ");

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Семья · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Семейный якорь</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Рядом с тобой — невидимая сеть поддержки. Живые и ушедшие. Те, кто верил в тебя.
            Сейчас мы сделаем эту сеть ощутимой.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm leading-relaxed text-foreground/80 italic">
              «Опора существует — даже когда её не видно.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "choose",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Выбери тех, кто приходит в память первыми. Не думай долго.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FIGURES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                  selected.includes(f.id)
                    ? "border-primary/60 bg-primary/10 font-medium text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      ),
      nextDisabled: selected.length === 0,
    },
    {
      key: "visualize",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Закрой глаза. Представь:{" "}
            <span className="font-medium text-foreground">{chosenLabels}</span>{" "}
            стоят рядом с тобой. Почувствуй тепло их присутствия — не слова, а именно
            ощущение. Дай этому 30 секунд.
          </p>
          <GlassCard className="p-5">
            <div className="flex flex-wrap gap-4 justify-center">
              {FIGURES.filter((f) => selected.includes(f.id)).map((f) => (
                <div key={f.id} className="flex flex-col items-center gap-1">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                </div>
              ))}
            </div>
          </GlassCard>
          <p className="text-center text-xs italic text-muted-foreground/70">
            Они здесь. Ты не одна.
          </p>
        </div>
      ),
      nextLabel: "Я почувствовала",
    },
    {
      key: "anchor",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Это ощущение — твой якорь. Когда станет тяжело, достаточно вспомнить один образ.
            Напиши, кого ты хочешь держать ближе всего:
          </p>
          <textarea
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Например: мама, когда смеётся..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs text-muted-foreground/50 text-center">
            Это останется только для тебя.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
