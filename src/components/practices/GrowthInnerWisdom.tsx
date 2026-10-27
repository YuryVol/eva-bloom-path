import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const WISDOM_QUESTIONS = [
  "Что мне сейчас важно понять?",
  "Чего я на самом деле боюсь?",
  "Что я уже знаю, но не решаюсь признать?",
  "Что мне нужно отпустить?",
  "Что мне стоит начать делать?",
];

const WISE_FORMS = [
  { id: "elder", label: "Мудрая старшая я", icon: "🌙", desc: "Ты сама через 20 лет — спокойная, всё принявшая" },
  { id: "nature", label: "Голос природы", icon: "🌳", desc: "Древнее дерево, которое видело многое" },
  { id: "light", label: "Внутренний свет", icon: "✨", desc: "Та часть тебя, которая всегда знала правду" },
  { id: "mentor", label: "Идеальный наставник", icon: "🕯️", desc: "Человек, которому ты доверяешь безусловно" },
];

export default function GrowthInnerWisdom({ onComplete, onSkip }: PracticeProps) {
  const [question, setQuestion] = useState("");
  const [wisdomForm, setWisdomForm] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [gift, setGift] = useState("");

  const updateAnswer = (i: number, val: string) =>
    setAnswers((a) => ({ ...a, [i]: val }));

  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;
  const selectedForm = WISE_FORMS.find((f) => f.id === wisdomForm);

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Развитие · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Внутренний мудрец</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Внутри тебя есть часть, которая знает больше, чем тревожный ум.
            Она говорит тихо — через интуицию, сны, внезапные озарения.
            Сегодня мы дадим ей слово.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Ответы уже внутри — нужен только тихий вопрос.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "form",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            В каком образе появится твой внутренний мудрец сегодня?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {WISE_FORMS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setWisdomForm(f.id)}
                className={`flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-all ${
                  wisdomForm === f.id
                    ? "border-primary/60 bg-primary/10"
                    : "border-border/60 bg-card/40 hover:border-border"
                }`}
              >
                <span className="text-2xl">{f.icon}</span>
                <span className="text-sm font-medium text-foreground">{f.label}</span>
                <span className="text-xs text-muted-foreground">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ),
      nextDisabled: !wisdomForm,
    },
    {
      key: "question",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Выбери главный вопрос, с которым ты хочешь обратиться к{" "}
            <span className="font-medium text-foreground">
              {selectedForm?.label ?? "мудрецу"}
            </span>:
          </p>
          <div className="flex flex-col gap-2">
            {WISDOM_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuestion(q)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                  question === q
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground"
                }`}
              >
                {question === q ? "✓ " : ""}{q}
              </button>
            ))}
          </div>
          <input
            value={question.startsWith("Что") || question.startsWith("Чего") || question.startsWith("Как") ? "" : question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Или свой вопрос..."
            className="rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
      nextDisabled: !question.trim(),
    },
    {
      key: "dialogue",
      content: (
        <div className="flex flex-col gap-4">
          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{selectedForm?.icon}</span>
              <p className="text-sm italic text-foreground/80">
                Представь {selectedForm?.label ?? "мудреца"}. Почувствуй его присутствие.
                Задай вопрос: «{question}» — и напиши ответ, который приходит первым.
                Не думай — пиши.
              </p>
            </div>
          </GlassCard>
          <div className="flex flex-col gap-3">
            {[
              "Что он / она / оно отвечает?",
              "Что ты чувствуешь в теле, слыша это?",
              "Что ты хочешь сказать в ответ?",
            ].map((q, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-foreground/70">{q}</label>
                <textarea
                  value={answers[i] ?? ""}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      ),
      nextDisabled: answeredCount < 1,
      nextLabel: "Завершить диалог",
    },
    {
      key: "gift",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Перед уходом — мудрец оставляет тебе подарок. Одно слово или образ.
            Что это?
          </p>
          <textarea
            value={gift}
            onChange={(e) => setGift(e.target.value)}
            placeholder="Слово, образ или ощущение, которое остаётся..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <AnimatePresence>
            {gift.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-4 text-center">
                  <p className="text-xl">{selectedForm?.icon}</p>
                  <p className="mt-2 font-display text-lg text-foreground italic">{gift}</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
