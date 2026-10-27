import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const UNKNOWNS = [
  "Я не знаю, правильно ли я выбрала путь",
  "Я не знаю, что будет через год",
  "Я не знаю, хватит ли мне сил",
  "Я не знаю, стоит ли продолжать",
  "Я не знаю, что я на самом деле хочу",
];

const REFRAMES: Record<string, string> = {
  "Я не знаю, правильно ли я выбрала путь":
    "Это означает: я открыта к нескольким версиям себя.",
  "Я не знаю, что будет через год":
    "Это означает: будущее ещё не закрыто. Я участвую в его создании.",
  "Я не знаю, хватит ли мне сил":
    "Это означает: я достаточно честна, чтобы не притворяться неуязвимой.",
  "Я не знаю, стоит ли продолжать":
    "Это означает: я задаю важные вопросы — это признак зрелости, не слабости.",
  "Я не знаю, что я на самом деле хочу":
    "Это означает: я ещё в процессе открытия себя. Это нормально.",
};

export default function GrowthNotKnow({ onComplete, onSkip }: PracticeProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [permission, setPermission] = useState("");

  const all = [...chosen, ...(custom.trim() ? [custom.trim()] : [])];

  const toggle = (s: string) =>
    setChosen((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]));

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Развитие · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Право не знать</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Мы тратим огромно энергии, притворяясь, что знаем. «Я должна знать, чего хочу».
            «Я должна уже разобраться». Но не-знание — не провал. Это честность.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Мудрость начинается с признания: я не знаю — и это нормально.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "name",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Выбери утверждения, которые резонируют с тобой прямо сейчас, или напиши своё:
          </p>
          <div className="flex flex-col gap-2">
            {UNKNOWNS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggle(s)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                  chosen.includes(s)
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border"
                }`}
              >
                {chosen.includes(s) ? "✓ " : ""}{s}
              </button>
            ))}
          </div>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Своё: Я не знаю..."
            className="rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
      nextDisabled: all.length === 0,
    },
    {
      key: "reframe",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Попробуем увидеть не-знание иначе:
          </p>
          <div className="flex flex-col gap-3">
            {all.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/40 bg-card/40 p-4"
              >
                <p className="text-sm text-muted-foreground italic">«{s}»</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {REFRAMES[s] ?? "Это означает: я в процессе — и это честно."}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
      nextLabel: "Принимаю",
    },
    {
      key: "permission",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Напиши себе разрешение. Начни со слов «Я разрешаю себе не знать...»
          </p>
          <textarea
            value={permission}
            onChange={(e) => setPermission(e.target.value)}
            placeholder="Я разрешаю себе не знать..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Разрешение себе — это акт зрелости.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
