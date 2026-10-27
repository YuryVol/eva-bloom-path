import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { type SphereId } from "@/lib/journey-types";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/polarity-map")({
  component: PolarityMapScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";

const COLUMNS = [
  { key: "worst" as const,     label: "Если всё пойдёт плохо...",    placeholder: "Что тогда произойдёт?", color: "text-rose-400/70" },
  { key: "realistic" as const, label: "Реалистичный сценарий",         placeholder: "Как скорее всего будет?", color: "text-primary/80" },
  { key: "best" as const,      label: "Если всё будет хорошо...",      placeholder: "Как это выглядит?", color: "text-emerald-400/70" },
];

function PolarityMapScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [worst, setWorst] = useState(state.polarity_worst ?? "");
  const [realistic, setRealistic] = useState(state.polarity_realistic ?? "");
  const [best, setBest] = useState(state.polarity_best ?? "");
  const [saving, setSaving] = useState(false);

  const setters = { worst: setWorst, realistic: setRealistic, best: setBest };
  const values = { worst, realistic, best };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state,
      polarity_worst: worst.trim() || undefined,
      polarity_realistic: realistic.trim() || undefined,
      polarity_best: best.trim() || undefined,
    };
    patch({ polarity_worst: next.polarity_worst, polarity_realistic: next.polarity_realistic, polarity_best: next.polarity_best });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "polarity-map", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="polarity-map">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и полярность" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Полярность</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Лучшее и худшее</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Посмотри на ситуацию с трёх сторон. Это помогает увидеть реальность чётче.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <p className={`mb-1.5 text-xs font-medium ${col.color}`}>{col.label}</p>
              <textarea
                rows={4}
                value={values[col.key]}
                onChange={(e) => setters[col.key](e.target.value)}
                placeholder={col.placeholder}
                className="w-full resize-none rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <GlowButton onClick={handleNext} disabled={saving}>
            {saving ? "сохраняю…" : "Продолжить"}
          </GlowButton>
          {!worst && !realistic && !best && (
            <button type="button" onClick={handleNext}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground hover:underline underline-offset-2">
              Пропустить
            </button>
          )}
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
