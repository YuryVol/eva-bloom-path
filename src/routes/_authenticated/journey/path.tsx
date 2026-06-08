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
  family: "/assets/eva/path-family.png",
  career: "/assets/eva/path-career.png",
  growth: "/assets/eva/path-growth.png",
  finance: "/assets/eva/path-finance.png",
  rest: "/assets/eva/path-rest.png",
  people: "/assets/eva/path-people.png",
  health: "/assets/eva/path-health.png",
};

const sphereCopy: Record<SphereId, { whisper: string; invite: string }> = {
  relationships: {
    whisper: "Связь с другим — самое тонкое зеркало. В ней мы видим себя.",
    invite: "Сегодня свет хочет лечь на твои отношения.",
  },
  health: {
    whisper: "Тело — не проект, который нужно улучшать. Это место, в котором ты живёшь.",
    invite: "Сегодня путь ведёт к телу и его тишине.",
  },
  career: {
    whisper: "Работа занимает треть жизни. Когда она не откликается — ощущение, будто треть тебя молчит.",
    invite: "Сегодня внимание идёт к твоему призванию.",
  },
  growth: {
    whisper: "Рост не всегда виден снаружи. Иногда он тихий, внутренний — как корень, уходящий глубже.",
    invite: "Сегодня ты смотришь, куда и как растёшь.",
  },
  family: {
    whisper: "Семья — это первый язык, на котором нас научили быть. Иногда этот язык устаревает.",
    invite: "Сегодня путь касается тех, кто ближе всего.",
  },
  finance: {
    whisper: "Деньги — это не только цифры. За ними скрываются страхи и то, как нас научили думать о себе.",
    invite: "Сегодня внимание идёт к финансам и тому, что за ними.",
  },
  rest: {
    whisper: "Отдых — это не слабость. Это та часть цикла, без которой всё остальное перестаёт работать.",
    invite: "Сегодня ты разрешаешь себе остановиться.",
  },
  people: {
    whisper: "Мы становимся похожи на тех, с кем проводим время. Иногда стоит спросить: кто эти люди?",
    invite: "Сегодня свет ложится на тех, кто вокруг тебя.",
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
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground/70 italic md:mx-0 mx-auto">
            {typeof score === "number" && score < 7
              ? "Здесь сейчас труднее всего — поэтому Ева идёт сюда с тобой."
              : "Ты выбрала эту сферу — Ева идёт туда, куда зовёт сердце."}
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
