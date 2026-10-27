import { useState } from "react";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

interface Need {
  id: string;
  label: string;
  icon: string;
}

const NEEDS: Need[] = [
  { id: "safety", label: "Безопасность", icon: "🛡️" },
  { id: "love", label: "Любовь", icon: "❤️" },
  { id: "respect", label: "Уважение", icon: "🌟" },
  { id: "autonomy", label: "Автономия", icon: "🦋" },
  { id: "connection", label: "Близость", icon: "🤝" },
  { id: "understanding", label: "Понимание", icon: "💬" },
  { id: "rest", label: "Отдых", icon: "🌙" },
  { id: "play", label: "Радость / игра", icon: "✨" },
  { id: "growth", label: "Развитие", icon: "🌱" },
  { id: "meaning", label: "Смысл", icon: "🔮" },
  { id: "recognition", label: "Признание", icon: "🏅" },
  { id: "support", label: "Поддержка", icon: "🫂" },
];

type NeedStatus = "satisfied" | "partial" | "unmet";

const STATUS_META: Record<NeedStatus, { label: string; color: string }> = {
  satisfied: { label: "Удовлетворена", color: "border-emerald-400/60 bg-emerald-50/30" },
  partial: { label: "Частично", color: "border-amber-400/60 bg-amber-50/30" },
  unmet: { label: "Не удовлетворена", color: "border-rose-400/60 bg-rose-50/30" },
};

export default function RelNeeds({ onComplete, onSkip }: PracticeProps) {
  const [statuses, setStatuses] = useState<Partial<Record<string, NeedStatus>>>({});
  const [insight, setInsight] = useState("");
  const [oneAsk, setOneAsk] = useState("");

  const cycle = (id: string) => {
    const order: NeedStatus[] = ["satisfied", "partial", "unmet"];
    const cur = statuses[id];
    const idx = cur ? order.indexOf(cur) : -1;
    const next = order[(idx + 1) % order.length];
    setStatuses((s) => ({ ...s, [id]: next }));
  };

  const unmetNeeds = NEEDS.filter((n) => statuses[n.id] === "unmet");
  const ratedCount = Object.keys(statuses).length;

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отношения · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Карта потребностей</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            В основе любого конфликта — неудовлетворённая потребность. Прежде чем говорить
            с другими о том, что нужно, — посмотрим, что нужно тебе.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Нельзя попросить о том, чего сам не видишь.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "rate",
      content: (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Нажимай на потребность, чтобы переключить её статус:{" "}
            <span className="text-emerald-600">зелёный</span> → удовлетворена,{" "}
            <span className="text-amber-600">жёлтый</span> → частично,{" "}
            <span className="text-rose-500">красный</span> → не удовлетворена.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {NEEDS.map((n) => {
              const st = statuses[n.id];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => cycle(n.id)}
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition-all ${
                    st ? STATUS_META[st].color : "border-border/50 bg-card/40 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg">{n.icon}</span>
                  <span className={st ? "font-medium text-foreground" : ""}>{n.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ),
      nextDisabled: ratedCount < 3,
    },
    {
      key: "reflect",
      content: (
        <div className="flex flex-col gap-5">
          {unmetNeeds.length > 0 && (
            <div className="rounded-2xl border border-rose-300/40 bg-rose-50/20 p-4">
              <p className="text-xs font-medium text-rose-600/80 mb-2">Ждут внимания:</p>
              <div className="flex flex-wrap gap-2">
                {unmetNeeds.map((n) => (
                  <span key={n.id} className="flex items-center gap-1 rounded-full border border-rose-300/50 bg-white/50 px-3 py-1 text-xs text-foreground">
                    {n.icon} {n.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Что ты замечаешь? Какие потребности труднее всего признавать?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="Я вижу, что мне сейчас особенно важно..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
        </div>
      ),
    },
    {
      key: "action",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Выбери одну неудовлетворённую потребность. Как ты могла бы попросить о ней
            одного человека — конкретно и без обвинений?
          </p>
          <textarea
            value={oneAsk}
            onChange={(e) => setOneAsk(e.target.value)}
            placeholder="Например: «Мне нужно полчаса тишины после работы — можешь поговорить чуть позже?»"
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Просить о нужде — не слабость. Это честность.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
