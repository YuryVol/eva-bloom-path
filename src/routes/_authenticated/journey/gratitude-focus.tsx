import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";
import { useAddress } from "@/lib/use-address";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/gratitude-focus")({
  component: GratitudeFocusScreen,
});

const HERO_SRC = "/assets/eva/step-gratitude-focus.png";

function GratitudeFocusScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const sphereLabel =
    SPHERES.find((s) => s.id === state.priority_sphere)?.label ?? "этой сфере";

  const [items, setItems] = useState<string[]>(
    state.gratitude_items?.length ? [...state.gratitude_items] : ["", "", ""],
  );
  const [saving, setSaving] = useState(false);

  const update = (i: number, v: string) =>
    setItems((prev) => { const n = [...prev]; n[i] = v; return n; });

  const filled = items.filter((s) => s.trim()).length;

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const cleaned = items.map((s) => s.trim()).filter(Boolean);
    const next = { ...state, gratitude_items: cleaned };
    patch({ gratitude_items: cleaned });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "gratitude-focus", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="gratitude-focus">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и ресурсы" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ресурсный путь</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Что уже работает</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {a.nazovi} 3 вещи в «{sphereLabel}», которые уже работают или поддерживают тебя —
            даже если кажется, что всё сложно.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-display text-sm text-primary">
                {i + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => update(i, e.target.value)}
                placeholder={["Например: я умею заботиться о себе", "Например: есть хотя бы один человек рядом", "Например: я уже делала это раньше"][i]}
                className="w-full rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <GlowButton onClick={handleNext} disabled={saving || filled === 0}>
            {saving ? "сохраняю…" : "Продолжить"}
          </GlowButton>
          {filled === 0 && (
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
