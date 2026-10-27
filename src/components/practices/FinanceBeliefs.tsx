import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const COMMON_BELIEFS = [
  "Деньги — это грязно / зло",
  "Богатые люди — плохие",
  "Мы не из таких, кто много зарабатывает",
  "Деньги нужно беречь — иначе их не будет",
  "Просить деньги — стыдно",
  "Я недостаточно умна / образована, чтобы зарабатывать больше",
  "Нельзя говорить о деньгах",
  "Деньги нужно заработать страданием",
];

interface Belief {
  id: string;
  text: string;
  source: string;
  reframe: string;
}

let bid = 1;
const mkBid = () => String(bid++);

export default function FinanceBeliefs({ onComplete, onSkip }: PracticeProps) {
  const [beliefs, setBeliefs] = useState<Belief[]>([]);
  const [custom, setCustom] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBelief, setNewBelief] = useState<Omit<Belief, "id">>({ text: "", source: "", reframe: "" });
  const [commitment, setCommitment] = useState("");

  const addBelief = (text: string) => {
    setBeliefs((b) => [
      ...b,
      { id: mkBid(), text, source: "", reframe: "" },
    ]);
  };

  const updateBelief = (id: string, field: keyof Omit<Belief, "id">, val: string) =>
    setBeliefs((b) => b.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  const remove = (id: string) => setBeliefs((b) => b.filter((x) => x.id !== id));

  const anyBeliefs = beliefs.length > 0;
  const anyReframed = beliefs.some((b) => b.reframe.trim().length > 0);

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Финансы · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Переписать убеждения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Убеждения о деньгах формируются до 7 лет — из семьи, фраз взрослых, атмосферы дома.
            Они не приговор. Их можно увидеть и переписать.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Деньги приходят туда, где им рады. Начнём с твоего отношения к ним.»
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
            Выбери убеждения, которые ты слышала в детстве или несёшь сейчас:
          </p>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {COMMON_BELIEFS.map((b) => {
              const alreadyAdded = beliefs.some((x) => x.text === b);
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => !alreadyAdded && addBelief(b)}
                  disabled={alreadyAdded}
                  className={`rounded-2xl border px-4 py-2.5 text-left text-sm transition-all ${
                    alreadyAdded
                      ? "border-primary/40 bg-primary/10 text-muted-foreground cursor-default"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {alreadyAdded ? "✓ " : "+ "}{b}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-1">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Своё убеждение..."
              className="flex-1 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => { if (custom.trim()) { addBelief(custom.trim()); setCustom(""); } }}
              disabled={!custom.trim()}
              className="rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      ),
      nextDisabled: !anyBeliefs,
    },
    {
      key: "excavate",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Для каждого убеждения — откуда оно пришло? Кто это говорил?
          </p>
          {beliefs.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/50 bg-card/40 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{b.text}</p>
                <button type="button" onClick={() => remove(b.id)} className="text-muted-foreground/40 hover:text-muted-foreground text-lg shrink-0">×</button>
              </div>
              <input
                value={b.source}
                onChange={(e) => updateBelief(b.id, "source", e.target.value)}
                placeholder="Откуда это? (мама, папа, общество...)"
                className="mt-2 w-full rounded-xl border border-border/40 bg-card/60 px-3 py-1.5 text-xs focus:border-primary/50 focus:outline-none"
              />
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      key: "reframe",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Теперь перепиши каждое убеждение в поддерживающее. Начни со слов «Я выбираю верить, что...»
          </p>
          {beliefs.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border/50 bg-card/40 p-3 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground italic">«{b.text}»</p>
              <textarea
                value={b.reframe}
                onChange={(e) => updateBelief(b.id, "reframe", e.target.value)}
                placeholder="Я выбираю верить, что..."
                rows={2}
                className="w-full resize-none rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
      ),
      nextDisabled: !anyReframed,
      nextLabel: "Принять новые убеждения",
    },
    {
      key: "commit",
      content: (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {beliefs.filter((b) => b.reframe.trim()).map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3"
              >
                <p className="text-sm font-medium text-foreground">{b.reframe}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Что ты готова изменить в своём поведении, опираясь на новые убеждения?
          </p>
          <textarea
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            placeholder="Я начну... / Я перестану..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Убеждения меняются через действие, а действие — через убеждения.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
