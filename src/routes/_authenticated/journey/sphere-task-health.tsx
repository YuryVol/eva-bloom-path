import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/sphere-task-health")({
  component: SphereTaskHealthScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";
const HERO_ALT = "Ева у тихого места";

function SphereTaskHealthScreen() {
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [place, setPlace] = useState<string>(state.sphere_safe_place ?? "");
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state, sphere_safe_place: place.trim() || undefined };
    patch({ sphere_safe_place: place.trim() || undefined });
    setStep("goal");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "goal" } });
      navigate({ to: "/journey/goal" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="sphere-task-health">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Здоровье</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Безопасное место</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {a.vy
              ? "Найдите место в 5–10 минутах от дома, где вам спокойнее всего. Дайте ему название."
              : "Найди место в 5–10 минутах от дома, где тебе спокойнее всего. Дай ему название."}
          </p>
        </div>

        <div className="mt-6">
          <textarea
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder={a.vy ? "Например: лавочка у пруда..." : "Например: лавочка у пруда..."}
            rows={4}
            className="w-full resize-none rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/60 focus:outline-none"
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <GlowButton onClick={handleNext} disabled={saving} className="w-full md:w-auto">
            {saving ? "сохраняю…" : "Продолжить"}
          </GlowButton>
          {!place.trim() && (
            <button
              type="button"
              onClick={handleNext}
              className="text-xs text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline"
            >
              Пропустить
            </button>
          )}
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
