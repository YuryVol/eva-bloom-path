import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene, type SceneVisual } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/journey/goal")({
  component: GoalScreen,
});

const presets: Record<SphereId, string[]> = {
  relationships: [
    "Хочу глубокой близости с партнёром",
    "Хочу спокойно говорить о трудном",
    "Хочу чувствовать, что меня слышат",
  ],
  health: [
    "Хочу вернуть энергию телу",
    "Хочу спать глубоко и просыпаться лёгким",
    "Хочу двигаться без боли",
  ],
  career: [
    "Хочу делать дело, в котором я живой",
    "Хочу признание за то, что мне важно",
    "Хочу спокойно идти в большее",
  ],
  growth: [
    "Хочу понять, куда расту",
    "Хочу научиться слышать себя",
    "Хочу выйти за привычные границы",
  ],
  family: [
    "Хочу тепла в моей семье",
    "Хочу принять своих такими, какие они есть",
    "Хочу быть собой рядом с близкими",
  ],
  finance: [
    "Хочу спокойствия с деньгами",
    "Хочу зарабатывать в согласии с собой",
    "Хочу выйти из тревоги о завтра",
  ],
  rest: [
    "Хочу разрешить себе остановиться",
    "Хочу настоящего восстановления",
    "Хочу тишины внутри",
  ],
  people: [
    "Хочу быть среди тех, кто меня питает",
    "Хочу мягко отпустить лишних",
    "Хочу честной близости с друзьями",
  ],
};

const DEFAULT_HERO: SceneVisual = {
  src: "/assets/eva/eva-listening-nearby.svg",
  alt: "Ева тихо слушает рядом с тобой",
  objectPosition: "center center",
};

const RELATIONSHIPS_DEFAULT: SceneVisual = {
  src: "/assets/eva/goals/goaldefault.png",
  alt: "Ева ждёт твою цель",
  objectPosition: "center 30%",
};

const RELATIONSHIPS_GOAL_IMAGES: Record<string, SceneVisual> = {
  "Хочу глубокой близости с партнёром": {
    src: "/assets/eva/goals/glubblizosti.png",
    alt: "Глубокая близость с партнёром",
    objectPosition: "center 30%",
  },
  "Хочу спокойно говорить о трудном": {
    src: "/assets/eva/goals/spokoinogovorit.png",
    alt: "Спокойный разговор",
    objectPosition: "center 30%",
  },
  "Хочу чувствовать, что меня слышат": {
    src: "/assets/eva/goals/Chtoslyshat.png",
    alt: "Чувствовать, что слышат",
    objectPosition: "center 30%",
  },
};

function GoalScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const labelOf = useMemo(
    () => Object.fromEntries(SPHERES.map((s) => [s.id, s.label])) as Record<SphereId, string>,
    [],
  );

  const sphere = (state.priority_sphere || state.selected_spheres[0]) as SphereId | undefined;

  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [selected, setSelected] = useState<string>("");
  const [custom, setCustom] = useState<string>("");
  const [saving, setSaving] = useState(false);

  if (!sphere) {
    return (
      <FadeTransition k="goal-empty">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Сначала выбери приоритетную сферу.</p>
          <div className="mt-4">
            <GlowButton onClick={() => navigate({ to: "/journey/spheres" as never })}>
              К началу
            </GlowButton>
          </div>
        </GlassCard>
      </FadeTransition>
    );
  }

  const options = presets[sphere];
  const goal = mode === "preset" ? selected : custom.trim();
  const canNext = goal.length > 0 && !saving;

  const handleNext = async () => {
    if (!journeyId || !canNext) return;
    setSaving(true);
    const xpGain = mode === "preset" ? 3 : 7;
    const coinGain = mode === "preset" ? 0 : 3;
    const next = {
      ...state,
      desired_goal: goal,
      xp: (state.xp || 0) + xpGain,
      coins: (state.coins || 0) + coinGain,
    };
    patch({ desired_goal: goal, xp: next.xp, coins: next.coins });
    setStep("fears");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "fears" } });
      navigate({ to: "/journey/fears" as never });
    } finally {
      setSaving(false);
    }
  };

  // Pick the visual to show
  const isRelationships = sphere === "relationships";
  const allVisuals: SceneVisual[] = isRelationships
    ? [RELATIONSHIPS_DEFAULT, ...Object.values(RELATIONSHIPS_GOAL_IMAGES)]
    : [DEFAULT_HERO];
  const current: SceneVisual = isRelationships
    ? mode === "preset" && selected && RELATIONSHIPS_GOAL_IMAGES[selected]
      ? RELATIONSHIPS_GOAL_IMAGES[selected]
      : RELATIONSHIPS_DEFAULT
    : DEFAULT_HERO;

  return (
    <FadeTransition k="goal">
      <JourneyScene current={current} all={allVisuals}>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Сфера: {labelOf[sphere]}
          </p>
          <h1 className="mt-4 font-display text-3xl text-glow md:text-4xl">
            Чего ты хочешь здесь?
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            Выбери близкое — или скажи своими словами. Слова, рождённые тобой, светят ярче.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={`rounded-full border px-4 py-2 transition ${
              mode === "preset"
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Подсказки
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`rounded-full border px-4 py-2 transition ${
              mode === "custom"
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Своими словами
          </button>
        </div>

        <div className="mt-5">
          {mode === "preset" ? (
            <div className="flex flex-col gap-3">
              {options.map((opt) => {
                const active = selected === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected(opt)}
                    className={`rounded-2xl border px-5 py-4 text-left backdrop-blur-sm transition ${
                      active
                        ? "border-primary/70 bg-primary/10 shadow-[0_6px_20px_-8px_oklch(0.74_0.13_70/0.4)]"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="font-display text-lg text-foreground/90">{opt}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <GlassCard>
              <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Твоя цель
              </label>
              <textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value.slice(0, 240))}
                placeholder="Напиши одной фразой, как для себя…"
                rows={4}
                autoFocus
                className="mt-3 w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 font-display text-lg text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>+7 XP · +3 монеты за свои слова</span>
                <span>{custom.length}/240</span>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 md:items-start">
          <GlowButton onClick={handleNext} disabled={!canNext}>
            {saving ? "сохраняю…" : "Это моя цель"}
          </GlowButton>
          {mode === "preset" && <p className="text-xs text-muted-foreground">+3 XP</p>}
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
