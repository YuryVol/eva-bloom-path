import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useInterlude } from "@/lib/eva-interlude";
import { useMemo, useEffect } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { Slider010 } from "@/components/eva/Slider010";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";
import { getEntryStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/assess")({
  component: AssessScreen,
});

const HERO_SRC = "/assets/eva/eva-main-portrait.png";
const HERO_ALT = "Ева рядом с тобой, тёплый свет вокруг";

function AssessScreen() {
  const { state, patch, journeyId, pushStep, loaded } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  // Preload next transition video while user fills in scores
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = "/assets/eva/assess-to-path.mp4";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const spheres = state.selected_spheres;
  const labelOf = useMemo(
    () => Object.fromEntries(SPHERES.map((s) => [s.id, s.label])) as Record<SphereId, string>,
    [],
  );

  const setScore = (id: SphereId, v: number) => {
    patch({ sphere_scores: { ...state.sphere_scores, [id]: v } });
  };

  const allScored = spheres.length > 0;

  const handleNext = async () => {
    if (!journeyId || !allScored) return;
    const priority = spheres.reduce<SphereId>((acc, s) => {
      const a = state.sphere_scores[acc] ?? 10;
      const b = state.sphere_scores[s] ?? 10;
      return b < a ? s : acc;
    }, spheres[0]);

    const next = { ...state, priority_sphere: priority };
    patch({ priority_sphere: priority });
    const entryStep = getEntryStep(priority, next);
    pushStep(entryStep);
    await save({ data: { id: journeyId, state: next as never, current_step: entryStep } });
    await useInterlude.getState().play("assess-to-path", Infinity);
    navigate({ to: `/journey/${entryStep}` as never });
  };

  if (spheres.length === 0) {
    if (!loaded) {
      return <FadeTransition k="assess-loading"><div /></FadeTransition>;
    }
    return (
      <FadeTransition k="assess-empty">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Сначала выбери сферы.</p>
          <div className="mt-4">
            <GlowButton onClick={() => navigate({ to: "/journey/spheres" as never })}>
              К выбору сфер
            </GlowButton>
          </div>
        </GlassCard>
      </FadeTransition>
    );
  }

  return (
    <FadeTransition k="assess">
      <JourneyScene
        current={{
          src: HERO_SRC,
          alt: HERO_ALT,
          objectPosition: "center 15%",
          scale: 1.35,
        }}
      >
        <div className="text-center md:text-left">
          <h1 className="font-display text-3xl text-glow md:text-4xl">
            Как сейчас в каждой?
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground md:mx-0">
            От 0 до 10 — насколько хорошо в этой сфере прямо сейчас.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {spheres.map((id) => {
            const score = state.sphere_scores[id] ?? 5;
            const emoji = score <= 3 ? "🍂" : score <= 6 ? "🌿" : "🌱";
            const hint = score <= 3 ? "Сейчас сложно" : score <= 6 ? "Держится" : "Прорастает";
            return (
              <GlassCard key={id} className="p-4">
                <Slider010
                  variant="compact"
                  label={labelOf[id]}
                  value={score}
                  onChange={(v) => setScore(id, v)}
                />
                <p className="mt-2 text-center text-xs text-muted-foreground/70">
                  {emoji} {hint}
                </p>
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-6 flex justify-center md:justify-start">
          <GlowButton onClick={handleNext} disabled={!allScored}>
            Продолжить
          </GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
