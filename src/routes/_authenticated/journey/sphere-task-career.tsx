import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/sphere-task-career")({
  component: SphereTaskCareerScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";
const HERO_ALT = "Ева у карты призвания";

const VALUES = [
  { id: "impact", label: "Влияние" },
  { id: "growth", label: "Рост" },
  { id: "freedom", label: "Свобода" },
  { id: "security", label: "Стабильность" },
  { id: "meaning", label: "Смысл" },
  { id: "money", label: "Доход" },
  { id: "people", label: "Люди" },
  { id: "craft", label: "Мастерство" },
];

function SphereTaskCareerScreen() {
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [order, setOrder] = useState<string[]>(state.sphere_values_order ?? []);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setOrder((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleNext = async () => {
    if (order.length === 0 || !journeyId) return;
    setSaving(true);
    const next = { ...state, sphere_values_order: order };
    patch({ sphere_values_order: order });
    setStep("goal");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "goal" } });
      navigate({ to: "/journey/goal" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="sphere-task-career">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Призвание</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Ценности в деле</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {a.vy
              ? "Выберите до 3 ценностей, которые важнее всего в работе прямо сейчас."
              : "Выбери до 3 ценностей, которые важнее всего в работе прямо сейчас."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {VALUES.map((v) => {
            const pos = order.indexOf(v.id);
            const sel = pos !== -1;
            return (
              <GlassCard
                key={v.id}
                className="relative cursor-pointer p-4 text-center transition-all"
                selected={sel}
                onClick={() => toggle(v.id)}
              >
                {sel && (
                  <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">
                    {pos + 1}
                  </span>
                )}
                <p className="text-sm leading-snug">{v.label}</p>
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-8">
          <GlowButton onClick={handleNext} disabled={order.length === 0 || saving} className="w-full md:w-auto">
            {saving ? "сохраняю…" : "Продолжить"}
          </GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
