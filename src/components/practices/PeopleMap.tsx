import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

type Ring = "core" | "close" | "circle";

const RING_META: Record<Ring, { label: string; desc: string; color: string; size: string }> = {
  core: {
    label: "Ядро",
    desc: "1–3 человека, которым ты доверяешь безусловно",
    color: "bg-primary/30 border-primary/50",
    size: "h-28 w-28",
  },
  close: {
    label: "Близкий круг",
    desc: "Люди, с которыми тебе спокойно",
    color: "bg-primary/10 border-primary/30",
    size: "h-44 w-44",
  },
  circle: {
    label: "Окружение",
    desc: "Знакомые, коллеги, соседи — кто присутствует в жизни",
    color: "bg-muted/30 border-border/40",
    size: "h-60 w-60",
  },
};

interface Person {
  id: string;
  name: string;
  ring: Ring;
}

let pid = 1;
const makePid = () => String(pid++);

export default function PeopleMap({ onComplete, onSkip }: PracticeProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [newRing, setNewRing] = useState<Ring>("close");
  const [observation, setObservation] = useState("");

  const addPerson = () => {
    if (!newName.trim()) return;
    setPeople((p) => [...p, { id: makePid(), name: newName.trim(), ring: newRing }]);
    setNewName("");
  };

  const remove = (id: string) => setPeople((p) => p.filter((x) => x.id !== id));

  const byRing = (r: Ring) => people.filter((p) => p.ring === r);

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Окружение · Заземление</p>
          <h2 className="font-display text-3xl text-glow">Карта окружения</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Одиночество — часто иллюзия. Мы забываем, кто есть рядом. Посмотрим на твой
            круг — живой и реальный.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Ты не одна. Просто иногда нужно вспомнить, кто рядом.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "add",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Добавь людей из своей жизни. Не оценивай — просто кто приходит в голову.
          </p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
              placeholder="Имя..."
              className="flex-1 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
            <select
              value={newRing}
              onChange={(e) => setNewRing(e.target.value as Ring)}
              className="rounded-xl border border-border/60 bg-card/60 px-2 py-2 text-xs text-foreground focus:outline-none"
            >
              <option value="core">Ядро</option>
              <option value="close">Близкий</option>
              <option value="circle">Окружение</option>
            </select>
            <button
              type="button"
              onClick={addPerson}
              disabled={!newName.trim()}
              className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {people.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {RING_META[p.ring].label}
                  </span>
                  <span className="text-sm text-foreground">{p.name}</span>
                </div>
                <button type="button" onClick={() => remove(p.id)} className="text-muted-foreground/40 hover:text-muted-foreground">×</button>
              </div>
            ))}
          </div>
        </div>
      ),
      nextDisabled: people.length === 0,
    },
    {
      key: "map",
      content: (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground text-center">Вот твой круг:</p>
          <div className="relative flex items-center justify-center">
            {(["circle", "close", "core"] as Ring[]).map((r) => (
              <div
                key={r}
                className={`absolute flex flex-col items-center justify-center rounded-full border-2 ${RING_META[r].color} ${RING_META[r].size}`}
              />
            ))}
            {/* labels overlay */}
            <div className="relative z-10 flex flex-col items-center gap-1 py-4">
              {(["core", "close", "circle"] as Ring[]).map((r) =>
                byRing(r).length > 0 ? (
                  <div key={r} className="flex flex-wrap justify-center gap-1 px-2">
                    {byRing(r).map((p) => (
                      <span key={p.id} className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm">
                        {p.name}
                      </span>
                    ))}
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      ),
      nextLabel: "Далее",
    },
    {
      key: "observe",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Глядя на свой круг — что ты замечаешь? Что удивляет? Чего хотелось бы больше?
          </p>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Я вижу, что рядом со мной есть..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Ты не одна. Это факт.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
