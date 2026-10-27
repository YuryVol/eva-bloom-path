import { useState } from "react";
import { StepWizard } from "./StepWizard";
import { BreathingCircle, PATTERN_478 } from "./BreathingCircle";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

export default function RelBreathing({ onComplete, onSkip }: PracticeProps) {
  const [breathDone, setBreathDone] = useState(false);
  const [intention, setIntention] = useState("");

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отношения · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Дыхание перед встречей</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Прежде чем встретиться с другим — встреться с собой. Это дыхание помогает
            прийти в контакт присутствующей, а не тревожащейся.
          </p>
          <GlassCard className="p-4">
            <div className="flex justify-around text-center">
              {[["4", "вдох"], ["7", "задержка"], ["8", "выдох"]].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl text-primary">{n}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "breathe",
      content: (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center mb-2">
            3 цикла · ~1.5 минуты
          </p>
          <BreathingCircle
            pattern={PATTERN_478}
            onComplete={() => setBreathDone(true)}
          />
        </div>
      ),
      nextDisabled: !breathDone,
      nextLabel: "Я дышала",
    },
    {
      key: "intention",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Хорошо. Почувствуй: ты стала чуть ближе к себе. Теперь — с кем или с чем
            ты хочешь встретиться из этого состояния?
          </p>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Например: с мамой, без защиты..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Настоящий контакт начинается с присутствия — ты уже здесь.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
