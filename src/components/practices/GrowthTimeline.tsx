import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

interface Milestone {
  id: string;
  text: string;
  year: string;
}

let nextId = 1;
const makeId = () => String(nextId++);

export default function GrowthTimeline({ onComplete, onSkip }: PracticeProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: makeId(), text: "", year: "" },
  ]);
  const [insight, setInsight] = useState("");

  const addRow = () =>
    setMilestones((m) => [...m, { id: makeId(), text: "", year: "" }]);

  const update = (id: string, field: keyof Milestone, value: string) =>
    setMilestones((m) => m.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const remove = (id: string) =>
    setMilestones((m) => m.filter((r) => r.id !== id));

  const filledCount = milestones.filter((m) => m.text.trim().length > 0).length;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Развитие · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Линия роста</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Мы часто замечаем, где не хватает. Но твоё развитие уже происходит — всегда
            происходило. Сейчас посмотрим на это вместе.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Ты уже не та, кем была год назад. Это и есть рост.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "milestones",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Вспомни 3–5 моментов своего роста — большие и маленькие. Первый шаг, преодоление,
            осознание, решение, которое изменило что-то.
          </p>
          <div className="flex flex-col gap-2">
            {milestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                  {i + 1}
                </div>
                <input
                  value={m.text}
                  onChange={(e) => update(m.id, "text", e.target.value)}
                  placeholder="Что произошло?"
                  className="flex-1 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                />
                <input
                  value={m.year}
                  onChange={(e) => update(m.id, "year", e.target.value)}
                  placeholder="Год"
                  className="w-16 rounded-xl border border-border/60 bg-card/60 px-2 py-2 text-center text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
                />
                {milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(m.id)}
                    className="text-muted-foreground/40 hover:text-muted-foreground text-lg leading-none"
                  >
                    ×
                  </button>
                )}
              </motion.div>
            ))}
          </div>
          {milestones.length < 8 && (
            <button
              type="button"
              onClick={addRow}
              className="self-start rounded-full border border-border/50 px-4 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              + ещё один
            </button>
          )}
        </div>
      ),
      nextDisabled: filledCount < 1,
    },
    {
      key: "reflect",
      content: (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            {milestones.filter((m) => m.text.trim()).map((m, i) => (
              <div key={m.id} className="flex items-start gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{m.text}</p>
                  {m.year && <p className="text-xs text-muted-foreground">{m.year}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Это твоя линия роста. Что ты видишь, глядя на неё?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="Я вижу, что даже в трудные периоды я..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
