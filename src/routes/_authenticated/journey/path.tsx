import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import {
  SPHERES,
  VARIANT_META,
  VARIANT_STEPS,
  getRecommendedVariant,
  type JourneyVariant,
  type SphereId,
} from "@/lib/journey-types";
import { useAddress } from "@/lib/use-address";

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

const VARIANT_ORDER: JourneyVariant[] = [
  "deep", "somatic", "creative", "quick",
  "narrative", "meditative", "dialogue",
  "gratitude", "polarity", "fear-lens",
];

function PathScreen() {
  const a = useAddress();
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

  const score = priority ? state.sphere_scores[priority] : undefined;

  const recommended = useMemo(
    () => getRecommendedVariant(score, null, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [priority],
  );

  const [selected, setSelected] = useState<JourneyVariant>(
    state.journey_variant ?? recommended,
  );

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
  const heroSrc = sphereImages[priority] || DEFAULT_HERO;

  const handleNext = async () => {
    if (!journeyId) return;
    const firstStep = VARIANT_STEPS[selected][0] as string;
    const next = { ...state, priority_sphere: priority, journey_variant: selected };
    patch({ priority_sphere: priority, journey_variant: selected });
    setStep(firstStep as never);
    save({ data: { id: journeyId, state: next as never, current_step: firstStep } }).catch(() => {});
    navigate({ to: `/journey/${firstStep}` as never });
  };

  return (
    <FadeTransition k="path">
      <JourneyScene
        current={{ src: heroSrc, alt: labelOf[priority], objectPosition: "center 30%" }}
      >
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {a.tvoy_put}
          </p>
          <h1 className="mt-3 font-display text-4xl text-glow md:text-5xl">
            {labelOf[priority]}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            {copy.invite}
          </p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground/70 italic md:mx-0 mx-auto">
            {typeof score === "number" && score < 7
              ? `Здесь сейчас труднее всего — поэтому Ева идёт сюда с ${a.toboj}.`
              : `${a.ty_vybrala} эту сферу — Ева идёт туда, куда зовёт сердце.`}
          </p>
        </div>

        {/* Quote card */}
        <div className="mt-5">
          <GlassCard className="text-center">
            <p className="font-display text-lg italic text-foreground/90">
              «{copy.whisper}»
            </p>
            {typeof score === "number" && (
              <div className="mt-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                <span>сейчас</span>
                <span className="font-display text-3xl not-italic text-foreground">{score}</span>
                <span>/ 10</span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Variant selection */}
        <div className="mt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground text-center md:text-left">
            Как {a.ty_khochesh_rabotat} сегодня?
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {VARIANT_ORDER.map((v) => {
              const meta = VARIANT_META[v];
              const isSelected = selected === v;
              const isRecommended = v === recommended;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setSelected(v)}
                  className={[
                    "relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-center transition-all",
                    isSelected
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_12px_rgba(255,220,140,0.25)]"
                      : "border-border/50 bg-card/40 hover:border-primary/30 hover:bg-card/70",
                  ].join(" ")}
                >
                  {isRecommended && !isSelected && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium text-background leading-none">
                      Ева
                    </span>
                  )}
                  <span className="text-2xl leading-none">{meta.icon}</span>
                  <span className="text-[11px] font-medium leading-tight text-foreground">
                    {meta.label}
                  </span>
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {meta.tagline}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 md:items-start">
          <GlowButton onClick={handleNext}>Начать путь</GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
