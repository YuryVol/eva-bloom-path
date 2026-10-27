import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { Slider010 } from "@/components/eva/Slider010";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/resistance")({
  component: ResistanceScreen,
});

const HERO_SRC = "/assets/eva/step-08-resistance.png";
const HERO_ALT = "Ева рядом с камнем сопротивления на тёплой светящейся площадке";

function resistanceCopy(v: number) {
  if (v <= 2) return "Почти ничего не держит. Тело свободно идёт вперёд.";
  if (v <= 4) return "Что-то лёгкое тянет назад — но ты сильнее этого.";
  if (v <= 6) return "Сопротивление ощутимое. Это нормально — у силы есть тень.";
  if (v <= 8) return "Внутри плотно. Хорошо, что ты это назвала.";
  return "Очень тяжело. Здесь нужна особая мягкость к себе.";
}

function ResistanceScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  // Preload EMDR loop video while user rates resistance
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = "/assets/eva/video/step-10-emdr-butterfly-pose-loop.mp4";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const [value, setValue] = useState<number>(
    typeof state.resistance_score_before === "number" ? state.resistance_score_before : 5,
  );
  const [saving, setSaving] = useState(false);

  const goal = state.desired_goal || "к этой цели";

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = {
      ...state,
      resistance_score_before: value,
      xp: (state.xp || 0) + 3,
    };
    patch({ resistance_score_before: value, xp: next.xp });
    pushStep("resistance-shape");
    navigate({ to: "/journey/resistance-shape" as never });
    save({ data: { id: journeyId, state: next as never, current_step: "resistance-shape" } })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  return (
    <FadeTransition k="resistance">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Появилось препятствие
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:mt-4 md:text-5xl">
            Что-то внутри сопротивляется этому пути?
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-4 md:mx-0 mx-auto">
            {a.podumaj} о цели: «{goal}». {a.prislushajs} к телу — что мешает внутри? Насколько сильно?
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            0 — свободно. 10 — будто стена.
          </p>
        </div>

        <div className="mt-5 md:mt-8">
          <GlassCard>
            <Slider010 value={value} onChange={setValue} />
            <p className="mt-6 text-center font-display text-base italic text-foreground/80">
              {resistanceCopy(value)}
            </p>
          </GlassCard>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 md:mt-8">
          <GlowButton onClick={handleNext} disabled={saving}>
            {saving ? "сохраняю…" : "Я это чувствую"}
          </GlowButton>
          <p className="text-xs text-muted-foreground">+3 XP за внимание к себе</p>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
