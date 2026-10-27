import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

interface Leaf {
  id: string;
  text: string;
  x: number;
  released: boolean;
}

let leafId = 1;
const mkLeafId = () => String(leafId++);

const SHOULD_PROMPTS = [
  "Я должна быть успешнее к этому возрасту",
  "Я должна знать, чего хочу",
  "Я должна зарабатывать больше",
  "Я должна не бояться",
  "Я должна уже определиться",
  "Я должна делать это с удовольствием",
];

export default function CareerLeaf({ onComplete, onSkip }: PracticeProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [newText, setNewText] = useState("");
  const [released, setReleased] = useState(false);
  const [relief, setRelief] = useState("");

  const addLeaf = (text: string) => {
    if (!text.trim()) return;
    setLeaves((l) => [
      ...l,
      { id: mkLeafId(), text: text.trim(), x: 20 + Math.random() * 60, released: false },
    ]);
    setNewText("");
  };

  const releaseAll = () => {
    setLeaves((l) => l.map((leaf) => ({ ...leaf, released: true })));
    setReleased(true);
  };

  const unreleasedCount = leaves.filter((l) => !l.released).length;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Призвание · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Листья на воде</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Слово «должна» — тяжёлое. Оно незаметно накапливается и создаёт давление,
            которое мешает слышать себя. Сегодня мы отпустим его — по одному листу.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Река не спрашивает, куда плыть. Отпусти лист — и смотри.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "collect",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Напиши на каждый «лист» одно требование к себе — то, что давит. Можно
            использовать подсказки ниже или своё.
          </p>
          <div className="flex gap-2">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLeaf(newText)}
              placeholder="Я должна..."
              className="flex-1 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addLeaf(newText)}
              disabled={!newText.trim()}
              className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SHOULD_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => addLeaf(p)}
                className="rounded-full border border-border/50 bg-card/40 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {p}
              </button>
            ))}
          </div>
          {leaves.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {leaves.map((l) => (
                <span key={l.id} className="rounded-full border border-amber-300/50 bg-amber-50/30 px-3 py-1 text-xs text-foreground">
                  🍂 {l.text}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
      nextDisabled: leaves.length === 0,
    },
    {
      key: "release",
      content: (
        <div className="flex flex-col items-center gap-5">
          <p className="text-sm text-muted-foreground text-center">
            Представь тихую реку. Положи каждый лист на воду — и смотри, как он уплывает.
            Ты не обязана нести это.
          </p>
          <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100/30 to-sky-200/20 border border-sky-200/30">
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-sky-300/20 to-transparent" />
            <AnimatePresence>
              {leaves.map((leaf) => (
                <motion.div
                  key={leaf.id}
                  initial={{ x: `${leaf.x}%`, y: 10, opacity: 1, rotate: -5 + Math.random() * 10 }}
                  animate={
                    leaf.released
                      ? { x: `${leaf.x + 120}%`, y: 60, opacity: 0, rotate: 20 }
                      : { x: `${leaf.x}%`, y: 10, opacity: 1 }
                  }
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, ease: "easeIn" }}
                  className="absolute text-xl select-none"
                  style={{ left: 0, top: 0 }}
                >
                  🍂
                </motion.div>
              ))}
            </AnimatePresence>
            {!released && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-sky-700/60 text-center px-4">Нажми «Отпустить» — листья поплывут</p>
              </div>
            )}
          </div>
          {!released ? (
            <button
              type="button"
              onClick={releaseAll}
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-[0_8px_28px_oklch(0.74_0.13_70/0.4)] transition hover:scale-105"
            >
              Отпустить
            </button>
          ) : (
            <p className="text-sm italic text-muted-foreground text-center">
              Листья уплыли. Требования остались — но уже не внутри тебя.
            </p>
          )}
        </div>
      ),
      nextDisabled: !released,
      nextLabel: "Далее",
    },
    {
      key: "after",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Когда убрать «должна» — что остаётся? Что ты на самом деле{" "}
            <span className="font-medium text-foreground">хочешь</span> или{" "}
            <span className="font-medium text-foreground">выбираешь</span>?
          </p>
          <textarea
            value={relief}
            onChange={(e) => setRelief(e.target.value)}
            placeholder="Без «должна» я чувствую / хочу / выбираю..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Это и есть твой голос — без давления.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
