import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

interface Item {
  id: string;
  text: string;
  owner: string;
  returned: boolean;
}

let iid = 1;
const mkIid = () => String(iid++);

const BURDEN_EXAMPLES = [
  "Тревога мамы о моём будущем",
  "Разочарование партнёра в работе",
  "Чужое одиночество, которое я пытаюсь заполнить",
  "Критика, которую я ношу как правду о себе",
  "Чьи-то ожидания, которые я взяла на себя",
];

export default function PeopleBoundaries({ onComplete, onSkip }: PracticeProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [newText, setNewText] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [insight, setInsight] = useState("");

  const addItem = (text: string, owner: string) => {
    if (!text.trim()) return;
    setItems((i) => [...i, { id: mkIid(), text: text.trim(), owner: owner.trim() || "не мне", returned: false }]);
    setNewText("");
    setNewOwner("");
  };

  const returnItem = (id: string) =>
    setItems((i) => i.map((x) => (x.id === id ? { ...x, returned: true } : x)));

  const allReturned = items.length > 0 && items.every((x) => x.returned);
  const anyItems = items.length > 0;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Окружение · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Возврат чужого</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Мы часто несём то, что нам не принадлежит — чужую боль, тревогу,
            ожидания. Это не предательство — вернуть это. Это честность.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Граница — не стена. Это место, где заканчиваюсь я и начинается другой человек.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "identify",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Что ты несёшь прямо сейчас, что на самом деле принадлежит кому-то другому?
          </p>
          <div className="flex gap-2">
            <div className="flex flex-col gap-2 flex-1">
              <input
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Что именно?"
                className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              />
              <input
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Чьё это? (чьё имя)"
                className="rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => addItem(newText, newOwner)}
              disabled={!newText.trim()}
              className="rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-40 self-stretch"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {BURDEN_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => addItem(ex, "")}
                className="rounded-full border border-border/50 bg-card/40 px-3 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
              >
                {ex}
              </button>
            ))}
          </div>
          {items.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              {items.map((x) => (
                <div key={x.id} className="flex items-start gap-2 rounded-xl border border-border/40 bg-card/40 p-3 text-sm">
                  <span className="text-foreground flex-1">{x.text}</span>
                  {x.owner && <span className="text-muted-foreground text-xs shrink-0">→ {x.owner}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      nextDisabled: !anyItems,
    },
    {
      key: "return",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Нажми «Вернуть» рядом с каждым пунктом. Представь, как ты мягко кладёшь это
            обратно — без злости, просто возвращаешь на место.
          </p>
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {items.map((x) => (
                <motion.div
                  key={x.id}
                  layout
                  exit={{ opacity: 0, x: 60, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center gap-3 rounded-2xl border p-3 ${
                    x.returned ? "border-border/30 bg-muted/20 opacity-50" : "border-border/60 bg-card/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{x.text}</p>
                    {x.owner && <p className="text-xs text-muted-foreground">принадлежит: {x.owner}</p>}
                  </div>
                  {!x.returned ? (
                    <button
                      type="button"
                      onClick={() => returnItem(x.id)}
                      className="shrink-0 rounded-xl border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
                    >
                      Вернуть
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">✓ возвращено</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {allReturned && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm italic text-primary"
            >
              Ты стала немного легче.
            </motion.p>
          )}
        </div>
      ),
      nextDisabled: !anyItems,
    },
    {
      key: "feel",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Как ощущается тело сейчас? Что изменилось после того, как ты вернула чужое?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="Сейчас я чувствую..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Граница — это забота. О себе и о другом.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
