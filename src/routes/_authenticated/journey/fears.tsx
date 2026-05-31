import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene, type SceneVisual } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/journey/fears")({
  component: FearsScreen,
});

const FEAR_OPTIONS = [
  "Что не получится",
  "Что осудят",
  "Что будет больно",
  "Что разочарую близких",
  "Что снова не хватит сил",
  "Что придётся менять слишком много",
  "Что окажусь одна",
  "Что это не моё",
];

const FEAR_VISUALS: Record<string, SceneVisual> = {
  default: {
    src: "/assets/eva/fears/Fears_default.png",
    alt: "Ева встречает страхи",
    objectPosition: "center 30%",
  },
  "Что не получится": {
    src: "/assets/eva/fears/Chto_ne_poluchitsya.png",
    alt: "Что не получится",
    objectPosition: "center 30%",
  },
  "Что осудят": {
    src: "/assets/eva/fears/Chto_osudyat.png",
    alt: "Что осудят",
    objectPosition: "center 30%",
  },
  "Что будет больно": {
    src: "/assets/eva/fears/Chto_budet_bolno.png",
    alt: "Что будет больно",
    objectPosition: "center 30%",
  },
  "Что разочарую близких": {
    src: "/assets/eva/fears/Chto_razocharuyu.png",
    alt: "Что разочарую близких",
    objectPosition: "center 30%",
  },
  "Что снова не хватит сил": {
    src: "/assets/eva/fears/Ne_hvatit_sil.png",
    alt: "Что не хватит сил",
    objectPosition: "center 30%",
  },
  "Что придётся менять слишком много": {
    src: "/assets/eva/fears/Pridetsya_menyat.png",
    alt: "Что придётся менять",
    objectPosition: "center 30%",
  },
  "Что окажусь одна": {
    src: "/assets/eva/fears/Ostanus_odin.png",
    alt: "Что окажусь одна",
    objectPosition: "center 30%",
  },
  "Что это не моё": {
    src: "/assets/eva/fears/Chto_ne_moe.png",
    alt: "Что это не моё",
    objectPosition: "center 30%",
  },
};

const MAX_PICK = 3;

function FearsScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [selected, setSelected] = useState<string[]>(state.selected_fears || []);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);

  const activeFearKey = useMemo(() => {
    for (let i = selected.length - 1; i >= 0; i--) {
      if (FEAR_VISUALS[selected[i]]) return selected[i];
    }
    return "default";
  }, [selected]);

  const currentFearVisual = FEAR_VISUALS[activeFearKey] || FEAR_VISUALS.default;
  const allVisuals = Object.values(FEAR_VISUALS);

  const toggle = (f: string) => {
    setSelected((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      if (prev.length >= MAX_PICK) return prev;
      return [...prev, f];
    });
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (selected.includes(v) || selected.length >= MAX_PICK) return;
    setSelected((prev) => [...prev, v]);
    setCustom("");
  };

  const canNext = selected.length > 0 && !saving;

  const handleNext = async () => {
    if (!journeyId || !canNext) return;
    setSaving(true);
    const hasCustom = selected.some((f) => !FEAR_OPTIONS.includes(f));
    const xpGain = hasCustom ? 6 : 3;
    const next = {
      ...state,
      selected_fears: selected,
      xp: (state.xp || 0) + xpGain,
    };
    patch({ selected_fears: selected, xp: next.xp });
    setStep("feeling");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "feeling" } });
      navigate({ to: "/journey/feeling" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="fears">
      <JourneyScene current={currentFearVisual} all={allVisuals}>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Тени на пути
          </p>
          <h1 className="mt-4 font-display text-3xl text-glow md:text-4xl">
            Что встаёт между тобой и этим?
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            Назови до {MAX_PICK} страхов. Их сила слабеет, когда мы зовём их по имени.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEAR_OPTIONS.map((f) => {
            const active = selected.includes(f);
            const disabled = !active && selected.length >= MAX_PICK;
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggle(f)}
                disabled={disabled}
                className={`rounded-2xl border px-4 py-3 text-left backdrop-blur-sm transition ${
                  active
                    ? "border-destructive/60 bg-destructive/10 text-foreground shadow-[0_6px_18px_-10px_oklch(0.65_0.16_30/0.5)]"
                    : disabled
                      ? "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/50"
                      : "border-border bg-card text-foreground/90 hover:border-destructive/40"
                }`}
              >
                <span className="font-display text-base">{f}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <GlassCard>
            <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Свой страх
            </label>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={custom}
                maxLength={120}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Назови своими словами…"
                className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!custom.trim() || selected.length >= MAX_PICK}
                className="rounded-xl border border-primary/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition hover:bg-primary/10 disabled:opacity-40"
              >
                Добавить
              </button>
            </div>
            {selected.filter((f) => !FEAR_OPTIONS.includes(f)).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selected
                  .filter((f) => !FEAR_OPTIONS.includes(f))
                  .map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggle(f)}
                      className="rounded-full border border-destructive/50 bg-destructive/10 px-3 py-1 text-xs text-foreground hover:bg-destructive/20"
                    >
                      {f} ×
                    </button>
                  ))}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">+6 XP за свой страх</p>
          </GlassCard>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 md:items-start">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            выбрано {selected.length} / {MAX_PICK}
          </p>
          <GlowButton onClick={handleNext} disabled={!canNext}>
            {saving ? "сохраняю…" : "Я их вижу"}
          </GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
