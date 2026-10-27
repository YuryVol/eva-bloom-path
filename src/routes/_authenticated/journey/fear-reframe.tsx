import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { GlassCard } from "@/components/eva/GlassCard";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { type SphereId } from "@/lib/journey-types";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/fear-reframe")({
  component: FearReframeScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";

const PROMPTS = [
  { key: "truth" as const,     label: "Что в этом страхе — правда?",         placeholder: "Например: это действительно возможно..." },
  { key: "not_truth" as const, label: "Что точно не правда?",                  placeholder: "Например: это НЕ значит, что..." },
  { key: "signal" as const,    label: "Какой сигнал он несёт? Чего хочет?",   placeholder: "Например: он говорит мне позаботиться о..." },
];

function FearReframeScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const focusFear = state.selected_fears?.[0] ?? "главный страх";

  const [answers, setAnswers] = useState({
    truth: state.fear_reframe?.truth ?? "",
    not_truth: state.fear_reframe?.not_truth ?? "",
    signal: state.fear_reframe?.signal ?? "",
  });
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof answers, v: string) =>
    setAnswers((prev) => ({ ...prev, [key]: v }));

  const filled = Object.values(answers).some((v) => v.trim());

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const reframe = {
      truth: answers.truth.trim(),
      not_truth: answers.not_truth.trim(),
      signal: answers.signal.trim(),
    };
    const next = { ...state, fear_reframe: reframe };
    patch({ fear_reframe: reframe });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "fear-reframe", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="fear-reframe">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и страх" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Под лупой</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Страх изнутри</h1>
        </div>

        <GlassCard className="mt-4 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Фокус</p>
          <p className="mt-1 font-display text-lg">{focusFear}</p>
        </GlassCard>

        <div className="mt-4 flex flex-col gap-4">
          {PROMPTS.map((p) => (
            <div key={p.key}>
              <p className="mb-1.5 text-xs text-muted-foreground">{p.label}</p>
              <textarea
                rows={3}
                value={answers[p.key]}
                onChange={(e) => update(p.key, e.target.value)}
                placeholder={p.placeholder}
                className="w-full resize-none rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <GlowButton onClick={handleNext} disabled={saving}>
            {saving ? "сохраняю…" : "Продолжить"}
          </GlowButton>
          {!filled && (
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
