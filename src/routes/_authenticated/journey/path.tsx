import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/journey/path")({
  component: PathScreen,
});

const DEFAULT_HERO = "/assets/eva/eva-close.png";

const sphereImages: Partial<Record<SphereId, string>> = {
  relationships: "/assets/eva/path-relationships.png",
};

const sphereCopy: Record<SphereId, { whisper: string; invite: string }> = {
  relationships: {
    whisper: "Связь с другим — самое тонкое зеркало.",
    invite: "Сегодня свет хочет лечь на твои отношения.",
  },
  health: {
    whisper: "Тело — твой первый дом.",
    invite: "Сегодня путь ведёт к телу и его тишине.",
  },
  career: {
    whisper: "Призвание — это то, что выбирает тебя.",
    invite: "Сегодня внимание идёт к твоему делу.",
  },
  growth: {
    whisper: "Развитие — это не гонка, это движение внутрь.",
    invite: "Сегодня ты смотришь, куда растёшь.",
  },
  family: {
    whisper: "Семья живёт в нас раньше нас.",
    invite: "Сегодня путь касается семьи.",
  },
  finance: {
    whisper: "Деньги — это поток, а не цифра.",
    invite: "Сегодня внимание идёт к финансам.",
  },
  rest: {
    whisper: "Отдых — это не пауза, это возвращение.",
    invite: "Сегодня ты разрешаешь себе остановиться.",
  },
  people: {
    whisper: "Окружение — это тихая сила, которая лепит тебя.",
    invite: "Сегодня свет ложится на тех, кто рядом.",
  },
};

function PathScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const labelOf = useMemo(
    () => Object.fromEntries(SPHERES.map((s) => [s.id, s.label])) as Record<SphereId, string>,
    [],
  );

  const priority =
    (state.priority_sphere as SphereId) ||
    (state.selected_spheres[0] as SphereId | undefined);

  if (!priority) {
    return (
      <FadeTransition k="path-empty">
        <GlassCard>
          <p className="text-sm text-muted-foreground">Сначала пройди оценку сфер.</p>
          <div className="mt-4">
            <GlowButton onClick={() => navigate({ to: "/journey/spheres" as never })}>
              К началу
            </GlowButton>
          </div>
        </GlassCard>
      </FadeTransition>
    );
  }

  const copy = sphereCopy[priority];
  const score = state.sphere_scores[priority];
  const heroSrc = sphereImages[priority] || DEFAULT_HERO;

  const handleNext = async () => {
    if (!journeyId) return;
    const next = { ...state, priority_sphere: priority };
    patch({ priority_sphere: priority });
    setStep("goal");
    await save({ data: { id: journeyId, state: next as never, current_step: "goal" } });
    navigate({ to: "/journey/goal" as never });
  };

  return (
    <FadeTransition k="path">
      <JourneyScene
        current={{ src: heroSrc, alt: labelOf[priority], objectPosition: "center 30%" }}
      >
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Твой путь сегодня
          </p>
          <h1 className="mt-3 font-display text-4xl text-glow md:text-5xl">
            {labelOf[priority]}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            {copy.invite}
          </p>
        </div>

        <div className="mt-5">
          <GlassCard className="text-center">
            <p className="font-display text-lg italic text-foreground/90">
              «{copy.whisper}»
            </p>
            {typeof score === "number" && (
              <div className="mt-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <span>сейчас</span>
                <span className="font-display text-3xl not-italic text-foreground">
                  {score}
                </span>
                <span>/ 10</span>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          <GlowButton onClick={handleNext}>Идти в эту сферу</GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
