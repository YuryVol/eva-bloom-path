import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const SYMPTOM_EXAMPLES = [
  "Хроническая усталость",
  "Головные боли",
  "Напряжение в плечах",
  "Тяжесть в груди",
  "Бессонница",
  "Частые простуды",
  "Боль в спине",
  "Учащённое сердцебиение",
];

const DIALOGUE_PROMPTS = [
  "Когда ты появляешься чаще всего?",
  "О чём ты пытаешься меня предупредить?",
  "Что тебе нужно от меня?",
  "Что я делаю, из-за чего ты усиливаешься?",
  "Что мне нужно изменить, чтобы тебе стало меньше?",
];

export default function HealthSymptom({ onComplete, onSkip }: PracticeProps) {
  const [symptom, setSymptom] = useState("");
  const [location, setLocation] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [gift, setGift] = useState("");

  const updateAnswer = (i: number, val: string) =>
    setAnswers((a) => ({ ...a, [i]: val }));

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Здоровье · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Послание симптома</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Тело не ломается случайно. Симптом — это форма общения. Оно говорит
            с нами на языке ощущений, потому что мы перестали слушать тихие слова.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «У симптома есть послание. Когда мы его слышим — нужда в симптоме уменьшается.»
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
            Какой симптом или дискомфорт ты хочешь исследовать? Выбери один.
          </p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_EXAMPLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSymptom(s)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  symptom === s
                    ? "border-primary/60 bg-primary/10 font-medium text-foreground"
                    : "border-border/50 bg-card/40 text-muted-foreground hover:border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="Или напиши свой..."
            className="rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"
          />
          {symptom && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1">
              <p className="text-sm text-muted-foreground">Где именно ты его чувствуешь в теле?</p>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Например: за грудиной, в правом плече..."
                className="mt-2 w-full rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"
              />
            </motion.div>
          )}
        </div>
      ),
      nextDisabled: !symptom.trim(),
    },
    {
      key: "dialogue",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Представь, что{" "}
            <span className="font-medium text-foreground">«{symptom}»</span> — это
            живое существо. Оно хочет тебе что-то сказать. Ответь за него:
          </p>
          <div className="flex flex-col gap-3">
            {DIALOGUE_PROMPTS.map((prompt, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/70">{prompt}</label>
                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  placeholder="Ответь от имени симптома..."
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      ),
      nextDisabled: answeredCount < 2,
    },
    {
      key: "gift",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Симптом пришёл не навредить — он пришёл защитить или предупредить.
            Что ты получила из этого диалога? Что ты теперь знаешь?
          </p>
          <textarea
            value={gift}
            onChange={(e) => setGift(e.target.value)}
            placeholder="Я поняла, что моё тело говорит мне..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80 text-center">
              «Благодарю тебя за послание. Я слышу тебя.»
            </p>
          </GlassCard>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
