import { useState } from "react";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const FLOW_CLUES = [
  "Забывала поесть или посмотреть на часы",
  "Делала это, даже когда никто не просил",
  "Время летело незаметно",
  "Чувствовала лёгкость, а не усилие",
  "Хотела рассказывать об этом другим",
];

export default function CareerFlow({ onComplete, onSkip }: PracticeProps) {
  const [memory, setMemory] = useState("");
  const [clues, setClues] = useState<string[]>([]);
  const [sphere, setSphere] = useState("");

  const toggleClue = (c: string) =>
    setClues((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Призвание · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Момент потока</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Поток — состояние, когда ты полностью поглощена делом. Это не случайность.
            Это сигнал от твоей природы о том, где твоя сила.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Призвание — не профессия. Это то, где время исчезает.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "recall",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Вспомни момент, когда ты была полностью в потоке. Это могло быть в детстве,
            на работе, в хобби — что угодно. Опиши его кратко:
          </p>
          <textarea
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            placeholder="Я рисовала всю ночь и не заметила, как рассвело..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
      nextDisabled: memory.trim().length < 5,
    },
    {
      key: "clues",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Что было верно в тот момент? Отметь всё подходящее:
          </p>
          <div className="flex flex-col gap-2">
            {FLOW_CLUES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleClue(c)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                  clues.includes(c)
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground"
                }`}
              >
                {clues.includes(c) ? "✓ " : ""}{c}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "sphere",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ты описала момент: <span className="font-medium text-foreground italic">«{memory}»</span>
          </p>
          <p className="text-sm text-muted-foreground">
            В какой сфере жизни это происходило? Это подсказка о направлении.
          </p>
          <textarea
            value={sphere}
            onChange={(e) => setSphere(e.target.value)}
            placeholder="Например: творчество, общение с людьми, анализ данных..."
            rows={2}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80 text-center">
              Запомни это место. Оно — маркер.
            </p>
          </GlassCard>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
