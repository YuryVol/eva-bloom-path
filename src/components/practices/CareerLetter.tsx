import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const FUTURE_QUESTIONS = [
  "Что ты делаешь каждый день и это наполняет тебя?",
  "Как ты себя чувствуешь утром, просыпаясь на работу?",
  "Что ты создала — что тебя радует?",
  "Что оказалось не так страшно, как думалось?",
  "Какой главный урок ты дашь себе нынешней?",
];

export default function CareerLetter({ onComplete, onSkip }: PracticeProps) {
  const [futureYear, setFutureYear] = useState("3");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [letter, setLetter] = useState("");
  const [sealed, setSealed] = useState(false);

  const updateAnswer = (i: number, val: string) =>
    setAnswers((a) => ({ ...a, [i]: val }));

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;
  const currentYear = new Date().getFullYear();
  const targetYear = currentYear + parseInt(futureYear || "3", 10);

  const buildLetter = () => {
    const parts = FUTURE_QUESTIONS.map((q, i) =>
      answers[i]?.trim() ? `${q}\n${answers[i]}` : null
    ).filter(Boolean);
    return parts.join("\n\n");
  };

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Призвание · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Письмо из будущего</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Та, которая нашла путь, уже существует — в возможном будущем. Она знает
            ответы. Сегодня она пишет тебе письмо.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Будущее — не то, что с нами случится. Это то, к чему мы движемся.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "timeline",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Через сколько лет ты пишешь из будущего?
          </p>
          <div className="flex justify-center gap-3">
            {["1", "3", "5", "10"].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setFutureYear(y)}
                className={`rounded-2xl border px-5 py-3 text-center transition-all ${
                  futureYear === y
                    ? "border-primary/60 bg-primary/10 font-medium text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground"
                }`}
              >
                <p className="font-display text-2xl">{y}</p>
                <p className="text-xs">лет</p>
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Ты пишешь из <span className="font-medium text-foreground">{targetYear} года</span>.
            Ты нашла путь. Ты спокойна и уверена.
          </p>
        </div>
      ),
    },
    {
      key: "questions",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Ответь на эти вопросы — от лица себя из {targetYear} года.
            Пиши в настоящем времени, как будто это уже случилось:
          </p>
          {FUTURE_QUESTIONS.map((q, i) => (
            <div key={i} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground/70">{q}</label>
              <textarea
                value={answers[i] ?? ""}
                onChange={(e) => updateAnswer(i, e.target.value)}
                placeholder="Пиши от первого лица..."
                rows={2}
                className="w-full resize-none rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
      ),
      nextDisabled: answeredCount < 2,
      nextLabel: "Составить письмо",
    },
    {
      key: "letter",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Письмо себе нынешней</p>
            <p className="text-xs text-muted-foreground">из {targetYear}</p>
          </div>
          <AnimatePresence>
            {!sealed ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <textarea
                  value={letter || buildLetter()}
                  onChange={(e) => setLetter(e.target.value)}
                  rows={10}
                  className="w-full resize-none rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => { setLetter((l) => l || buildLetter()); setSealed(true); }}
                  className="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground"
                >
                  Запечатать письмо ✉️
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="sealed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <div className="text-5xl">✉️</div>
                <p className="font-display text-xl text-glow">Письмо запечатано</p>
                <GlassCard className="w-full p-4">
                  <p className="text-sm italic text-foreground/80 leading-relaxed line-clamp-4">
                    {letter || buildLetter()}
                  </p>
                </GlassCard>
                <button
                  type="button"
                  onClick={() => setSealed(false)}
                  className="text-xs text-muted-foreground/50 underline-offset-2 hover:underline"
                >
                  Изменить письмо
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
      nextDisabled: !sealed,
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
