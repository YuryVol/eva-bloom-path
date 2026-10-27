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

export const Route = createFileRoute("/_authenticated/journey/sphere-task-relationships")({
  component: SphereTaskRelationshipsScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";
const HERO_ALT = "Ева держит нити связей";

const ROLES = [
  { id: "partner", label: "Партнёр / партнёрша" },
  { id: "friend", label: "Друг / подруга" },
  { id: "child", label: "Дочь / сын" },
  { id: "parent", label: "Родитель" },
  { id: "colleague", label: "Коллега" },
  { id: "self", label: "Человек для себя" },
];

function SphereTaskRelationshipsScreen() {
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);
  const [selected, setSelected] = useState<string>(state.sphere_role ?? "");
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!selected || !journeyId) return;
    setSaving(true);
    const next = { ...state, sphere_role: selected };
    patch({ sphere_role: selected });
    setStep("goal");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "goal" } });
      navigate({ to: "/journey/goal" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="sphere-task-relationships">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Отношения</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Карта ролей</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {a.vy
              ? "Какую роль в отношениях вы хотите усилить сегодня?"
              : "Какую роль в отношениях ты хочешь усилить сегодня?"}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <GlassCard
              key={r.id}
              className="cursor-pointer p-4 text-center transition-all"
              selected={selected === r.id}
              onClick={() => setSelected(r.id)}
            >
              <p className="text-sm leading-snug">{r.label}</p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-8">
          <GlowButton onClick={handleNext} disabled={!selected || saving} className="w-full md:w-auto">
            {saving ? "сохраняю…" : "Продолжить"}
          </GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
