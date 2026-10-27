import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlassCard } from "@/components/eva/GlassCard";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { getNextStep } from "@/lib/sphere-journeys";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/finance-entry")({
  component: FinanceEntryScreen,
});

const HERO_SRC = "/assets/eva/eva-finance.png";

const OPTIONS = [
  { id: "fear" as const,          icon: "😰", label: "Тревога о деньгах",     desc: "Страх нехватки, нестабильности" },
  { id: "chaos" as const,         icon: "🌀", label: "Хаос и потеря контроля", desc: "Непонятно куда уходят деньги" },
  { id: "blocked-dream" as const, icon: "🔒", label: "Заблокированная мечта",  desc: "Есть цель, но деньги — препятствие" },
];

function FinanceEntryScreen() {
  const a = useAddress();
  const { state, patch, journeyId, pushStep } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);
  const [selected, setSelected] = useState<typeof OPTIONS[number]["id"] | null>(
    state.finance_issue_type ?? null,
  );
  const [saving, setSaving] = useState(false);

  const handleNext = async (id: typeof OPTIONS[number]["id"]) => {
    if (!journeyId || saving) return;
    setSaving(true);
    setSelected(id);
    const next = { ...state, finance_issue_type: id };
    patch({ finance_issue_type: id });
    const nextStep = getNextStep("finance", "finance-entry", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="finance-entry">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и финансы" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Финансы</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-4xl">
            Как сейчас с финансами?
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {a.vy ? "Выберите то, что ближе всего." : "Выбери то, что ближе всего."}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {OPTIONS.map((opt) => (
            <GlassCard
              key={opt.id}
              selected={selected === opt.id}
              onClick={() => !saving && handleNext(opt.id)}
              className="flex cursor-pointer items-center gap-4 p-4 transition-all hover:border-primary/40"
            >
              <span className="text-2xl">{opt.icon}</span>
              <div>
                <p className="font-display text-base">{opt.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
