import { useState } from "react";
import { motion } from "framer-motion";
import { StepWizard } from "./StepWizard";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

interface BodyZone {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
}

const ZONES: BodyZone[] = [
  { id: "head", label: "Голова", cx: 50, cy: 8, r: 7 },
  { id: "throat", label: "Горло", cx: 50, cy: 18, r: 5 },
  { id: "chest", label: "Грудь", cx: 50, cy: 30, r: 8 },
  { id: "solar", label: "Солнечное сплетение", cx: 50, cy: 42, r: 7 },
  { id: "belly", label: "Живот", cx: 50, cy: 53, r: 7 },
  { id: "hips", label: "Бёдра", cx: 50, cy: 65, r: 6 },
  { id: "lhand", label: "Левая рука", cx: 25, cy: 38, r: 5 },
  { id: "rhand", label: "Правая рука", cx: 75, cy: 38, r: 5 },
];

type Intensity = 0 | 1 | 2 | 3;

const INTENSITY_COLORS: Record<Intensity, string> = {
  0: "#e5e7eb",
  1: "#fde68a",
  2: "#fb923c",
  3: "#ef4444",
};

const INTENSITY_LABELS: Record<Intensity, string> = {
  0: "нет",
  1: "лёгкое",
  2: "среднее",
  3: "сильное",
};

export default function FinanceBodyMap({ onComplete, onSkip }: PracticeProps) {
  const [tensions, setTensions] = useState<Partial<Record<string, Intensity>>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [insight, setInsight] = useState("");

  const setIntensity = (id: string, val: Intensity) => {
    setTensions((t) => ({ ...t, [id]: val }));
    setSelected(null);
  };

  const topZone = ZONES.find(
    (z) =>
      (tensions[z.id] ?? 0) ===
      Math.max(...ZONES.map((z2) => tensions[z2.id] ?? 0)),
  );

  const anySet = Object.values(tensions).some((v) => v && v > 0);

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Финансы · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Карта тела и денег</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Деньги живут в теле раньше, чем в кошельке. Тревога о финансах — это всегда
            телесное ощущение. Найдём, где именно оно прячется у тебя.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Чтобы изменить отношение с деньгами, сначала нужно почувствовать его в теле.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "trigger",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Подумай о деньгах прямо сейчас — о счетах, доходе, будущем. Просто позволь
            мыслям прийти. Что ты чувствуешь в теле?
          </p>
          <p className="text-sm text-muted-foreground">
            Нажми на зону — и отметь интенсивность напряжения:
          </p>
          <div className="flex gap-4 items-start">
            <svg viewBox="0 0 100 80" className="w-36 shrink-0" style={{ height: 200 }}>
              {/* simple body outline */}
              <ellipse cx="50" cy="8" rx="7" ry="7" fill="none" stroke="#d1d5db" strokeWidth="1" />
              <line x1="50" y1="15" x2="50" y2="60" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="50" y1="22" x2="25" y2="45" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="50" y1="22" x2="75" y2="45" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="50" y1="60" x2="38" y2="78" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="50" y1="60" x2="62" y2="78" stroke="#d1d5db" strokeWidth="1.5" />
              {ZONES.map((z) => (
                <circle
                  key={z.id}
                  cx={z.cx}
                  cy={z.cy}
                  r={z.r}
                  fill={INTENSITY_COLORS[(tensions[z.id] ?? 0) as Intensity]}
                  stroke={selected === z.id ? "#6366f1" : "#9ca3af"}
                  strokeWidth={selected === z.id ? 2 : 0.5}
                  className="cursor-pointer transition-all"
                  onClick={() => setSelected(selected === z.id ? null : z.id)}
                />
              ))}
            </svg>

            <div className="flex-1 flex flex-col gap-1.5">
              {selected ? (
                <>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {ZONES.find((z) => z.id === selected)?.label}
                  </p>
                  {([0, 1, 2, 3] as Intensity[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setIntensity(selected, v)}
                      className={`rounded-xl border px-3 py-2 text-sm text-left transition ${
                        (tensions[selected] ?? 0) === v
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border/50 bg-card/40 text-muted-foreground"
                      }`}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full mr-2"
                        style={{ background: INTENSITY_COLORS[v] }}
                      />
                      {INTENSITY_LABELS[v]}
                    </button>
                  ))}
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {ZONES.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSelected(z.id)}
                      className="flex items-center gap-2 rounded-xl border border-border/40 bg-card/40 px-3 py-2 text-xs text-left text-muted-foreground hover:border-border"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: INTENSITY_COLORS[(tensions[z.id] ?? 0) as Intensity] }}
                      />
                      {z.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      nextDisabled: !anySet,
    },
    {
      key: "dialogue",
      content: (
        <div className="flex flex-col gap-5">
          {topZone && (
            <p className="text-sm text-muted-foreground">
              Больше всего напряжения — в области{" "}
              <span className="font-medium text-foreground">«{topZone.label}»</span>.
              Положи туда руку. Почувствуй тепло. Спроси внутри: «Что ты хочешь мне сказать?»
            </p>
          )}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Это напряжение говорит мне: «...»"
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs text-muted-foreground/60 text-center italic">
            Тело всегда знает что-то важное.
          </p>
        </div>
      ),
    },
    {
      key: "release",
      content: (
        <div className="flex flex-col gap-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Сделай 3 медленных выдоха — немного длиннее вдоха. Представь, как с каждым
            выдохом напряжение чуть рассеивается. Что меняется?
          </p>
          <textarea
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="После дыхания я замечаю..."
            rows={3}
            className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-xs italic text-muted-foreground/60 text-center">
            Осознание — уже половина работы.
          </p>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
