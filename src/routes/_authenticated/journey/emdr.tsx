import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { EmdrAnimation } from "@/components/eva/EmdrAnimation";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { useAmbientTrack } from "@/lib/use-ambient-track";

export const Route = createFileRoute("/_authenticated/journey/emdr")({
  component: EmdrScreen,
});

const SHAPE_LABELS: Record<string, string> = {
  stone: "камень",
  knot: "узел",
  wall: "стену",
  fog: "туман",
  ice: "лёд",
  thorn: "шипы",
  void: "пустоту",
  shadow: "тень",
};



function EmdrScreen() {
  useAmbientTrack("bowls");
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const shapeLabel = SHAPE_LABELS[state.resistance_shape] || "это";
  const goal = state.desired_goal || "своей цели";

  const handleComplete = () => {
    setDone(true);
    patch({ emdr_cycles: 3 });
  };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = {
      ...state,
      emdr_cycles: 3,
      xp: (state.xp || 0) + 15,
      coins: (state.coins || 0) + 5,
    };
    patch({ emdr_cycles: 3, xp: next.xp, coins: next.coins });
    pushStep("reassess");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "reassess" },
      });
      navigate({ to: "/journey/reassess" as never });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = {
      ...state,
      emdr_cycles: 0,
      xp: (state.xp || 1) + 1,
      coins: (state.coins || 1) + 1,
    };
    patch({ emdr_cycles: 0, xp: next.xp, coins: next.coins });
    pushStep("reassess");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "reassess" },
      });
      navigate({ to: "/journey/reassess" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="emdr">
      <div className="relative flex h-full min-h-0 w-full flex-col px-6 py-6 md:px-10 md:py-8">

        {/* Eva — decorative presence on desktop */}
        <div className="pointer-events-none absolute bottom-0 right-0 hidden w-36 opacity-20 md:block lg:w-48">
          <img src="/assets/eva/eva-butterfly-pose.svg" alt="" className="h-auto w-full" />
        </div>

        {/* TOP — title + description */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Практика
          </p>
          <h1 className="mt-3 font-display text-3xl text-glow md:text-5xl">
            Сейчас мы мягко растворим это
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {a.uderzhivaj} образ, который {a.pochuvstvovala}. {a.sledi} глазами за светом:{" "}
            {a.nedvigaj} головой. {a.daj} телу самостоятельно справиться с этим дискомфортом.
          </p>
        </div>

        {/* MIDDLE — full-width animation */}
        <div className="mt-8 flex flex-1 items-center">
          <GlassCard className="w-full p-6 md:p-10">
            <EmdrAnimation cycles={3} onComplete={handleComplete} />
          </GlassCard>
        </div>

        {/* DONE state */}
        {done && (
          <div className="mt-6 text-center">
            <p className="font-display text-base italic text-foreground/80">
              {a.sdelajte} глубокий вдох. {a.zameti}, что изменилось внутри.
            </p>
            <div className="mt-4 flex flex-col items-center gap-2">
              <GlowButton onClick={handleNext} disabled={saving}>
                {saving ? "сохраняю…" : "Я готова проверить"}
              </GlowButton>
              <p className="text-xs text-muted-foreground">
                +15 XP · +5 монет за прохождение цикла
              </p>
            </div>
          </div>
        )}

        {/* BOTTOM — skip */}
        <div className="mt-4 pb-2 text-center">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-xs tracking-wide text-muted-foreground/60 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline disabled:opacity-40"
          >
            Пропустить
          </button>
        </div>

      </div>
    </FadeTransition>
  );
}
