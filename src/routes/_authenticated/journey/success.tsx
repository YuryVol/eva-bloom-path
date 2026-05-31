import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useInterlude } from "@/lib/eva-interlude";
import { useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/journey/success")({
  component: SuccessStepScreen,
});

const WINDOWS = [
  { id: "today", label: "Сегодня", hint: "в ближайшие часы" },
  { id: "tomorrow", label: "Завтра", hint: "с утра" },
  { id: "week", label: "На этой неделе", hint: "до воскресенья" },
];

const HERO_SRC = "/assets/eva/actions/step-12-first-step.png";
const HERO_ALT =
  "Ева стоит на светящемся первом камне дорожки, рядом блокнот, свеча и молодой росток";

function SuccessStepScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [stepText, setStepText] = useState("");
  const [window, setWindow] = useState<string>("today");
  const [saving, setSaving] = useState(false);

  const ready = stepText.trim().length >= 3 && Boolean(window);
  const goal = state.desired_goal || "своей цели";

  const handleNext = async () => {
    if (!journeyId || !ready) return;
    setSaving(true);
    const firstStep = `${stepText.trim()} · ${WINDOWS.find((w) => w.id === window)?.label}`;
    const next = {
      ...state,
      first_step: firstStep,
      xp: (state.xp || 0) + 10,
      coins: (state.coins || 0) + 5,
    } as typeof state & { first_step: string };
    patch({ xp: next.xp, coins: next.coins } as never);
    setStep("summary");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "summary" },
      });
      await useInterlude.getState().play("success-to-summary", 6000);
      navigate({ to: "/journey/summary" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="success">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Маленький первый шаг
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:mt-4 md:text-5xl">
            Идём к цели
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-4 md:mx-0 mx-auto">
            К цели «{goal}». Один маленький, конкретный шаг — такой,
            к которому невозможно придумать отговорку.
          </p>
        </div>

        <div className="mt-5 md:mt-8">
          <GlassCard>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Первый шаг
            </label>
            <input
              type="text"
              value={stepText}
              onChange={(e) => setStepText(e.target.value.slice(0, 120))}
              placeholder="Например: написать одно сообщение"
              className="mt-3 w-full bg-transparent border-b border-border pb-2 font-display text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/70 transition-colors"
            />
            <p className="mt-2 text-right text-[10px] text-muted-foreground">
              {stepText.length}/120
            </p>
          </GlassCard>
        </div>

        <div className="mt-5 md:mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Когда
          </p>
          <div className="grid grid-cols-3 gap-3">
            {WINDOWS.map((w) => (
              <GlassCard
                key={w.id}
                interactive
                selected={window === w.id}
                onClick={() => setWindow(w.id)}
                className="p-3 text-center"
              >
                <p className="font-display text-sm">{w.label}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{w.hint}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "mt-6 transition-opacity duration-500",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <GlassCard className="border-primary/40">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Твой обет себе
            </p>
            <p className="mt-2 font-display text-lg text-foreground">
              {WINDOWS.find((w) => w.id === window)?.label}: {stepText || "…"}
            </p>
          </GlassCard>
        </div>

        <div className="mt-6 md:mt-8 flex flex-col items-center gap-2">
          <GlowButton onClick={handleNext} disabled={!ready || saving}>
            {saving ? "сохраняю…" : "Я сделаю это"}
          </GlowButton>
          <p className="text-xs text-muted-foreground">
            +10 XP · +5 монет за конкретное действие
          </p>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
