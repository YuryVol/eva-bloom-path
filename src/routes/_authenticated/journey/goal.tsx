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
    "Хочу чтобы меня слышали — не угадывали, а именно слышали",
  ],
  health: [
    "Хочу начать слышать сигналы своего тела",
    "Хочу добавить движение, которое приносит радость",
    "Хочу отдохнуть по-настоящему — физически",
  ],
  career: [
    "Хочу понять — это выгорание или это просто не моё",
    "Хочу сказать «нет» тому, что не моё",
    "Хочу сделать первый шаг к своему делу",
  ],
  growth: [
    "Хочу начать то, что давно откладываю",
    "Хочу выработать привычку, которая меняет день",
    "Хочу выйти за привычные границы",
  ],
  family: [
    "Хочу почувствовать себя ближе с кем-то из семьи",
    "Хочу спокойно выдерживать семейное напряжение",
    "Хочу сказать что-то важное, что давно молчу",
  ],
  finance: [
    "Хочу разобраться, куда уходят деньги",
    "Хочу перестать бояться смотреть на счёт",
    "Хочу сделать первый шаг к финансовой подушке",
  ],
  rest: [
    "Хочу остановиться без ощущения что я что-то должна",
    "Хочу найти то, что по-настоящему восстанавливает",
    "Хочу защитить время для себя",
  ],
  people: [
    "Хочу быть среди тех, кто меня видит",
    "Хочу выйти из отношений, которые забирают силы",
    "Хочу открыться кому-то новому",
  ],
};

const DEFAULT_HERO: SceneVisual = {
  src: "/assets/eva/eva-close.png",
  alt: "Ева тихо слушает рядом с тобой",
  objectPosition: "center center",
};

// These use the same hero images as path.tsx — once path-*.png files are in public/assets/eva/, they appear here too
const SPHERE_DEFAULT_VISUALS: Partial<Record<SphereId, SceneVisual>> = {
  relationships: {
    src: "/assets/eva/path-relationships.png",
    alt: "Ева слушает тебя",
    objectPosition: "center 30%",
  },
  family: {
    src: "/assets/eva/path-family.png",
    alt: "Семья",
    objectPosition: "center 30%",
  },
  career: {
    src: "/assets/eva/path-career.png",
    alt: "Призвание",
    objectPosition: "center 30%",
  },
  growth: {
    src: "/assets/eva/path-growth.png",
    alt: "Развитие",
    objectPosition: "center 30%",
  },
  finance: {
    src: "/assets/eva/path-finance.png",
    alt: "Финансы",
    objectPosition: "center 30%",
  },
  rest: {
    src: "/assets/eva/path-rest.png",
    alt: "Отдых",
    objectPosition: "center 30%",
  },
  people: {
    src: "/assets/eva/path-people.png",
    alt: "Окружение",
    objectPosition: "center 30%",
  },
  health: {
    src: "/assets/eva/path-health.png",
    alt: "Здоровье",
    objectPosition: "center 30%",
  },
};

const GOAL_IMAGES: Record<string, SceneVisual> = {
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
    navigate({ to: "/journey/fears" as never });
    save({ data: { id: journeyId, state: next as never, current_step: "fears" } })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  // Pick the visual to show
  const sphereDefault = (sphere && SPHERE_DEFAULT_VISUALS[sphere]) || DEFAULT_HERO;
  const goalVisual = mode === "preset" && selected ? GOAL_IMAGES[selected] : undefined;
  const current: SceneVisual = goalVisual ?? sphereDefault;
  const allVisuals: SceneVisual[] = [sphereDefault, ...Object.values(GOAL_IMAGES)];

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
