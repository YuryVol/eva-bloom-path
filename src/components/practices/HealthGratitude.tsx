import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const BODY_PARTS = [
  { id: "heart", label: "Сердце", icon: "❤️", note: "бьётся ~100 000 раз в день без остановки" },
  { id: "lungs", label: "Лёгкие", icon: "🫁", note: "дышат даже когда ты об этом не думаешь" },
  { id: "hands", label: "Руки", icon: "🤲", note: "создают, обнимают, помогают" },
  { id: "eyes", label: "Глаза", icon: "👁️", note: "различают миллионы оттенков" },
  { id: "legs", label: "Ноги", icon: "🦶", note: "несут тебя вперёд каждый день" },
  { id: "brain", label: "Мозг", icon: "🧠", note: "обрабатывает 11 миллионов битов в секунду" },
  { id: "gut", label: "Живот", icon: "🌀", note: "второй мозг, хранит интуицию" },
  { id: "skin", label: "Кожа", icon: "✨", note: "граница между мной и миром, защищает" },
];

export default function HealthGratitude({ onComplete, onSkip }: PracticeProps) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  const toggle = (id: string) => {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    setRevealed(id);
    setTimeout(() => setRevealed(null), 2000);
  };

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Здоровье · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Благодарность телу</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Мы замечаем тело, когда оно болит. Но прямо сейчас оно делает для тебя
            невероятно много — без вопросов и без выходных.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Тело — не враг. Это первый союзник.»
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
            Нажимай на части тела, которые сейчас работают для тебя:
          </p>
          <div className="grid grid-cols-2 gap-2 relative">
            {BODY_PARTS.map((p) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all ${
                  chosen.includes(p.id)
                    ? "border-primary/60 bg-primary/10"
                    : "border-border/60 bg-card/40 hover:border-border"
                }`}
              >
                <span className="text-xl">{p.icon}</span>
                <span className="text-sm font-medium text-foreground">{p.label}</span>
                <AnimatePresence>
                  {revealed === p.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-muted-foreground overflow-hidden"
                    >
                      {p.note}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
      ),
      nextDisabled: chosen.length === 0,
    },
    {
      key: "breathe",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Положи руки на то место тела, которое ты выбрала первым. Почувствуй тепло
            ладоней. Скажи внутренне: «Спасибо. Я чувствую тебя.»
          </p>
          <div className="flex flex-wrap justify-center gap-3 py-2">
            {BODY_PARTS.filter((p) => chosen.includes(p.id)).map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 1 }}
                  className="text-3xl"
                >
                  {p.icon}
                </motion.span>
                <span className="text-xs text-muted-foreground">{p.label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs italic text-muted-foreground/60">
            Задержись здесь 20–30 секунд.
          </p>
        </div>
      ),
      nextLabel: "Я почувствовала",
    },
    {
      key: "letter",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Напиши своему телу несколько слов. Не обязательно красиво — просто честно.
          </p>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Дорогое тело, сегодня я хочу сказать тебе..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Отношения с телом меняются через внимание.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
