import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

export interface JoyEntry {
  id: string;
  text: string;
  category: JoyCategory;
  emoji: string;
}

export type JoyCategory = "activity" | "place" | "person" | "sense" | "memory" | "small";

const CATEGORIES: Record<JoyCategory, { label: string; icon: string; placeholder: string }> = {
  activity: { label: "Занятие", icon: "🎨", placeholder: "Что делать — и время летит" },
  place: { label: "Место", icon: "🌿", placeholder: "Где тебе особенно хорошо" },
  person: { label: "Человек", icon: "💛", placeholder: "Рядом с кем ты расцветаешь" },
  sense: { label: "Ощущение", icon: "✨", placeholder: "Запах, звук, вкус, текстура" },
  memory: { label: "Воспоминание", icon: "🌸", placeholder: "Момент, который всегда греет" },
  small: { label: "Мелочь", icon: "☕", placeholder: "Маленькое, но настоящее" },
};

const EMOJIS = ["🌸", "✨", "💛", "🌿", "☕", "🎨", "🌊", "🦋", "🌙", "🍃", "🌻", "⭐"];

let jid = 1;
const mkJid = () => String(jid++);

export default function RestJoyArchive({ onComplete, onSkip }: PracticeProps) {
  const [entries, setEntries] = useState<JoyEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<JoyCategory>("activity");
  const [text, setText] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("✨");
  const [archiveName, setArchiveName] = useState("");

  const addEntry = () => {
    if (!text.trim()) return;
    setEntries((e) => [
      ...e,
      { id: mkJid(), text: text.trim(), category: activeCategory, emoji: selectedEmoji },
    ]);
    setText("");
  };

  const remove = (id: string) => setEntries((e) => e.filter((x) => x.id !== id));

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отдых · Гармонизация</p>
          <h2 className="font-display text-3xl text-glow">Архив радости</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Когда мир тускнеет, мы забываем, что нас восстанавливает. Архив радости —
            это личная карта: что именно наполняет именно тебя.
            Ева напомнит о нём, когда понадобится.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Радость не нужно заслуживать. Её нужно замечать.»
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
            Добавляй то, что по-настоящему восстанавливает тебя — не то, что «должно»:
          </p>
          {/* category tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {(Object.entries(CATEGORIES) as [JoyCategory, typeof CATEGORIES[JoyCategory]][]).map(([key, val]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  activeCategory === key
                    ? "border-primary/60 bg-primary/10 font-medium text-foreground"
                    : "border-border/50 bg-card/40 text-muted-foreground"
                }`}
              >
                {val.icon} {val.label}
              </button>
            ))}
          </div>
          {/* emoji picker */}
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setSelectedEmoji(e)}
                className={`text-xl rounded-xl border p-1.5 transition ${
                  selectedEmoji === e ? "border-primary/60 bg-primary/10" : "border-border/30 bg-card/30"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          {/* input */}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEntry()}
              placeholder={CATEGORIES[activeCategory].placeholder}
              className="flex-1 rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={addEntry}
              disabled={!text.trim()}
              className="rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
          {/* entries */}
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            <AnimatePresence>
              {entries.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 px-3 py-2"
                >
                  <span>{e.emoji}</span>
                  <span className="flex-1 text-sm text-foreground">{e.text}</span>
                  <span className="text-xs text-muted-foreground">{CATEGORIES[e.category].label}</span>
                  <button type="button" onClick={() => remove(e.id)} className="text-muted-foreground/40 hover:text-muted-foreground">×</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ),
      nextDisabled: entries.length < 3,
    },
    {
      key: "name",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-muted-foreground">
            Ты собрала {entries.length} источника радости. Дай своему архиву имя:
          </p>
          <input
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            placeholder="Например: «Мои настоящие да» или «Живое»..."
            className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            {entries.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/30 px-3 py-2">
                <span>{e.emoji}</span>
                <span className="text-sm text-foreground truncate">{e.text}</span>
              </div>
            ))}
            {entries.length > 6 && (
              <div className="flex items-center justify-center rounded-xl border border-border/30 bg-card/30 px-3 py-2">
                <span className="text-sm text-muted-foreground">+{entries.length - 6} ещё</span>
              </div>
            )}
          </div>
        </div>
      ),
      nextLabel: "Сохранить архив",
    },
    {
      key: "saved",
      content: (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="text-5xl">🗂️</div>
          <p className="font-display text-2xl text-glow">
            {archiveName || "Архив сохранён"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
            Ева запомнила твой архив. Когда мир начнёт тускнеть, она напомнит тебе,
            что восстанавливает именно тебя.
          </p>
          <GlassCard className="w-full max-w-xs p-4">
            <p className="text-sm italic text-foreground/80">
              «Радость — не вознаграждение. Это топливо.»
            </p>
          </GlassCard>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
