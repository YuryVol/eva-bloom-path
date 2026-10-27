import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

export default function FamilyRewrite({ onComplete, onSkip }: PracticeProps) {
  const [scene, setScene] = useState("");
  const [wound, setWound] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [bodyFeel, setBodyFeel] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Семья · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Переписать финал</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Воображение меняет нейронные следы. Это не фантазия ради побега —
            это перепрошивка болезненного воспоминания через новый опыт внутри.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Мозг не всегда отличает пережитое от воображаемого. Это его дар — и наш инструмент.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "original",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Вспомни семейную сцену, которая оставила след. Не самую тяжёлую — среднюю по
            интенсивности. Опиши её кратко — что произошло, кто был там.
          </p>
          <textarea
            value={scene}
            onChange={(e) => setScene(e.target.value)}
            placeholder="Мне было лет 10. Папа вернулся домой и..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-sm text-muted-foreground mt-1">Что осталось болеть после этого?</p>
          <textarea
            value={wound}
            onChange={(e) => setWound(e.target.value)}
            placeholder="После этого я решила, что я..."
            rows={2}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
      nextDisabled: scene.trim().length < 10,
    },
    {
      key: "rewrite",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Теперь перепиши эту сцену так, как ты хотела бы, чтобы она произошла.
            Можно изменить слова, действия, исход — что угодно.
            Воображение здесь — не ложь, а исцеление.
          </p>
          <button
            type="button"
            onClick={() => setShowOriginal((v) => !v)}
            className="self-start text-xs text-muted-foreground/60 underline-offset-2 hover:underline"
          >
            {showOriginal ? "Скрыть оригинал" : "Показать оригинал"}
          </button>
          <AnimatePresence>
            {showOriginal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <GlassCard className="p-3 border-border/30">
                  <p className="text-xs text-muted-foreground italic">{scene}</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
          <textarea
            value={rewritten}
            onChange={(e) => setRewritten(e.target.value)}
            placeholder="В этой версии папа открыл дверь и..."
            rows={6}
            className="w-full resize-none rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
      nextDisabled: rewritten.trim().length < 10,
      nextLabel: "Я написала",
    },
    {
      key: "embody",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Прочитай новую сцену медленно. Закрой глаза и представь её — как будто
            это случилось на самом деле. Почувствуй телом: что изменилось?
          </p>
          <GlassCard className="p-4">
            <p className="text-sm text-foreground/80 italic leading-relaxed">{rewritten}</p>
          </GlassCard>
          <textarea
            value={bodyFeel}
            onChange={(e) => setBodyFeel(e.target.value)}
            placeholder="Когда я читаю это, я чувствую в теле..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Новый опыт уже существует — внутри тебя.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
