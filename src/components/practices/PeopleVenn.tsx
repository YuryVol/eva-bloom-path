import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

interface Trait {
  id: string;
  text: string;
  zone: "self" | "overlap" | "other";
}

let tid = 1;
const mkTid = () => String(tid++);

const TRAIT_PROMPTS = {
  self: ["Любопытная", "Чувствительная", "Перфекционист", "Творческая", "Сильная", "Заботливая"],
  other: ["Надёжная", "Весёлая", "Мудрая", "Добрая", "Честная", "Тёплая"],
};

const ZONE_META = {
  self: { label: "Как я вижу себя", color: "bg-sky-100/40 border-sky-300/40", textColor: "text-sky-700" },
  overlap: { label: "Совпадение", color: "bg-primary/10 border-primary/40", textColor: "text-primary" },
  other: { label: "Как меня видят другие", color: "bg-violet-100/40 border-violet-300/40", textColor: "text-violet-700" },
};

export default function PeopleVenn({ onComplete, onSkip }: PracticeProps) {
  const [traits, setTraits] = useState<Trait[]>([]);
  const [newText, setNewText] = useState("");
  const [newZone, setNewZone] = useState<"self" | "overlap" | "other">("self");
  const [insight, setInsight] = useState("");
  const [chosen, setChosen] = useState("");

  const addTrait = (text: string, zone: typeof newZone) => {
    if (!text.trim()) return;
    setTraits((t) => [...t, { id: mkTid(), text: text.trim(), zone }]);
    setNewText("");
  };

  const remove = (id: string) => setTraits((t) => t.filter((x) => x.id !== id));

  const byZone = (z: Trait["zone"]) => traits.filter((t) => t.zone === z);
  const overlapTraits = byZone("overlap");
  const anyTraits = traits.length >= 2;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Окружение · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Диаграмма Венна</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Как ты видишь себя? Как тебя видят близкие? Пересечение этих двух кругов —
            место, где живёт твоя настоящая идентичность.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Мы узнаём себя через отражение — но только если смотрим честно.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "fill",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Добавь черты в каждый раздел. Зона «Совпадение» — когда ты согласна с тем,
            как тебя видят другие.
          </p>
          {/* zone selector */}
          <div className="flex gap-2">
            {(["self", "overlap", "other"] as const).map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setNewZone(z)}
                className={`flex-1 rounded-xl border py-2 text-xs font-medium transition ${
                  newZone === z
                    ? `${ZONE_META[z].color} ${ZONE_META[z].textColor} border-current`
                    : "border-border/50 bg-card/40 text-muted-foreground"
                }`}
              >
                {z === "self" ? "Я о себе" : z === "overlap" ? "Совпадение" : "Другие обо мне"}
              </button>
            ))}
          </div>
          {/* quick prompts */}
          <div className="flex flex-wrap gap-1.5">
            {(TRAIT_PROMPTS[newZone === "overlap" ? "self" : newZone] ?? []).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => addTrait(p, newZone)}
                className="rounded-full border border-border/40 bg-card/30 px-2.5 py-1 text-xs text-muted-foreground hover:border-border hover:text-foreground transition"
              >
                {p}
              </button>
            ))}
          </div>
          {/* input */}
          <div className="flex gap-2">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTrait(newText, newZone)}
              placeholder="Черта характера..."
              className="flex-1 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => addTrait(newText, newZone)}
              disabled={!newText.trim()}
              className="rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
          {/* current traits by zone */}
          {(["self", "overlap", "other"] as const).map((z) => byZone(z).length > 0 && (
            <div key={z} className={`rounded-xl border p-3 ${ZONE_META[z].color}`}>
              <p className={`text-xs font-medium mb-1 ${ZONE_META[z].textColor}`}>{ZONE_META[z].label}</p>
              <div className="flex flex-wrap gap-1.5">
                {byZone(z).map((t) => (
                  <span key={t.id} className="flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-0.5 text-xs text-foreground">
                    {t.text}
                    <button type="button" onClick={() => remove(t.id)} className="text-muted-foreground/50 hover:text-muted-foreground ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
      nextDisabled: !anyTraits,
    },
    {
      key: "diagram",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">Твоя диаграмма Венна:</p>
          {/* SVG Venn */}
          <div className="relative flex justify-center">
            <svg viewBox="0 0 260 140" className="w-full max-w-xs">
              <ellipse cx="95" cy="70" rx="75" ry="55" fill="oklch(0.95 0.03 220 / 0.5)" stroke="oklch(0.7 0.1 220)" strokeWidth="1.5" />
              <ellipse cx="165" cy="70" rx="75" ry="55" fill="oklch(0.95 0.05 290 / 0.5)" stroke="oklch(0.7 0.08 290)" strokeWidth="1.5" />
              <text x="58" y="30" textAnchor="middle" fontSize="7" fill="oklch(0.5 0.1 220)">Я о себе</text>
              <text x="200" y="30" textAnchor="middle" fontSize="7" fill="oklch(0.5 0.08 290)">Другие</text>
              <text x="130" y="20" textAnchor="middle" fontSize="7" fill="oklch(0.55 0.1 70)">Совпадение</text>
            </svg>
          </div>
          {/* text summary */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {(["self", "overlap", "other"] as const).map((z) => (
              <div key={z} className={`rounded-xl border p-2 ${ZONE_META[z].color}`}>
                <p className={`font-medium mb-1 ${ZONE_META[z].textColor}`}>{ZONE_META[z].label}</p>
                {byZone(z).map((t) => <p key={t.id} className="text-foreground">{t.text}</p>)}
                {byZone(z).length === 0 && <p className="text-muted-foreground/50 italic">пусто</p>}
              </div>
            ))}
          </div>
        </div>
      ),
      nextLabel: "Исследовать совпадение",
    },
    {
      key: "insight",
      content: (
        <div className="flex flex-col gap-5">
          {overlapTraits.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-medium text-primary mb-2">Место, где ты узнаваема:</p>
              <div className="flex flex-wrap gap-2">
                {overlapTraits.map((t) => (
                  <span key={t.id} className="rounded-full border border-primary/40 bg-white/60 px-3 py-1 text-sm text-foreground font-medium">
                    {t.text}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Что тебя удивляет в этой картине? Что ты хочешь развить в себе — и что принять?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="Я вижу, что другие замечают во мне то, что я..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Идентичность — не статика. Это живой диалог.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
