import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { EmdrAnimation } from "@/components/eva/EmdrAnimation";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";

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
  const { state, journeyId, setStep, patch } = useJourneyStore();
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
    setStep("reassess");
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
    setStep("reassess");
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
      <div className="step-10-screen">
        <div className="step-10-content">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Практика
            </p>
            <h1 className="step-10-title mt-4 font-display text-4xl text-glow md:text-5xl">
              Сейчас мы мягко растворим это
            </h1>
            <p className="step-10-description mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Удерживай образ, который ты почувствовала. Следи глазами за светом:
              не двигай головой. Дай телу самостоятельно справиться с этим дискомфортом.
            </p>
          </div>


          <div className="emdr-practice-card mt-8 w-full max-w-2xl">
            <GlassCard className="p-4 md:p-8">
              <EmdrAnimation cycles={3} onComplete={handleComplete} />
            </GlassCard>
          </div>

          {done && (
            <div className="mt-8 w-full max-w-2xl text-center">
              <p className="font-display text-base italic text-foreground/80">
                Сделай глубокий вдох. Заметь, что изменилось внутри.
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                <GlowButton onClick={handleNext} disabled={saving}>
                  {saving ? "сохраняю…" : "Я готова проверить"}
                </GlowButton>
                <p className="text-xs text-muted-foreground">
                  +15 XP · +5 монет за прохождение цикла
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSkip}
            disabled={saving}
            className="mt-6 mb-2 text-xs tracking-wide text-muted-foreground/60 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline disabled:opacity-40"
          >
            Пропустить
          </button>
        </div>
      </div>
    </FadeTransition>
  );
}
