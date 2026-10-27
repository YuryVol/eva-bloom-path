import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useState, useCallback } from "react";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { recordPracticeCompletion } from "@/lib/practice.functions";
import { practiceComponentMap } from "@/content/practice-components-map";
import type { SphereId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/journey/practice-run")({
  component: PracticeRunScreen,
});

function PracticeRunScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);
  const record = useServerFn(recordPracticeCompletion);

  const [saving, setSaving] = useState(false);

  const practiceId = state.selected_practice_id;
  const sphere = (state.priority_sphere || "rest") as SphereId;

  // Derive component_key from practiceId via the practices loaded in state
  // We stored selected_practice_id (UUID), so we need to find it via the map.
  // The component map is keyed by component_key ({sphere}-{type}).
  // We pass sphere down; component_key = sphere + type is not in state.
  // Fallback: show all three cards and let user pick type. But since we already
  // picked a specific practice in practice-select, we stored its UUID, not key.
  // We need to derive the component_key. Approach: fetch isn't needed here —
  // the component_key is deterministic: "{sphere_id}-{type}".
  // But we don't have type in state. So we store component_key instead.
  // For now: use the practice_id as a component_key lookup via a derived approach.
  // The cleanest solution: we stored selected_practice_id (UUID from DB).
  // To get the component, we need component_key. We DON'T have it unless we
  // also stored it. Since we can't change Etap 2 retroactively here, we'll use
  // a convention: selected_practice_id will be the component_key (set in select screen).
  // NOTE: practice-select stores the DB uuid. We need component_key.
  // Fix: practice-select will be updated to store component_key in selected_practice_id field,
  // or we add a new field. We add selected_practice_key to state and store component_key there.

  const componentKey = state.selected_practice_key ?? null;
  const loader = componentKey ? practiceComponentMap[componentKey] : null;
  const PracticeComponent = loader ? lazy(loader) : null;

  const advance = useCallback(
    async (skipped: boolean) => {
      if (!journeyId) return;
      setSaving(true);
      try {
        if (practiceId) {
          await record({
            data: {
              practice_id: practiceId,
              journey_id: journeyId,
              context: "journey",
              skipped,
            },
          });
        }
        // Award XP/coins for completion (not skip)
        const xpBonus = skipped ? 0 : 5;
        const coinsBonus = skipped ? 0 : 2;
        const next = {
          ...state,
          xp: (state.xp || 0) + xpBonus,
          coins: (state.coins || 0) + coinsBonus,
        };
        patch({ xp: next.xp, coins: next.coins });
        setStep("reassess");
        await save({ data: { id: journeyId, state: next as never, current_step: "reassess" } });
        navigate({ to: "/journey/reassess" as never });
      } finally {
        setSaving(false);
      }
    },
    [journeyId, practiceId, state, patch, setStep, save, navigate, record],
  );

  if (!PracticeComponent) {
    return (
      <FadeTransition k="practice-run-missing">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-6">
          <p className="text-muted-foreground text-sm">
            Практика не найдена. Переходим к переоценке.
          </p>
          <button
            type="button"
            onClick={() => advance(true)}
            disabled={saving}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? "…" : "Продолжить"}
          </button>
        </div>
      </FadeTransition>
    );
  }

  return (
    <FadeTransition k="practice-run">
      <div className="flex h-full flex-col">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Загрузка практики…</p>
            </div>
          }
        >
          <PracticeComponent
            sphereId={sphere}
            onComplete={() => advance(false)}
            onSkip={() => advance(true)}
          />
        </Suspense>
        {saving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <p className="text-sm text-foreground">Сохраняю…</p>
          </div>
        )}
      </div>
    </FadeTransition>
  );
}
