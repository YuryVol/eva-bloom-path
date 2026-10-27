import { useJourneyStore } from "./journey-store";
import { getNextStep } from "./sphere-journeys";
import { type SphereId, type StepId } from "./journey-types";

/** Returns the next step for the current position in the journey. */
export function useNextStep(): StepId {
  const state = useJourneyStore((s) => s.state);
  const currentStep = useJourneyStore((s) => s.currentStep);
  return getNextStep(state.priority_sphere as SphereId, currentStep, state);
}
