import { create } from "zustand";
import {
  initialJourneyState,
  type JourneyState,
  type JourneyVariant,
  type StepId,
} from "./journey-types";

type Store = {
  journeyId: string | null;
  state: JourneyState;
  currentStep: StepId;
  /** Visited-step history (for back navigation). Grows as user moves forward. */
  steps: StepId[];
  loaded: boolean;
  setJourney: (id: string, state: JourneyState, step: StepId) => void;
  patch: (partial: Partial<JourneyState>) => void;
  /** Push a new step onto the history stack and set as current. */
  pushStep: (step: StepId) => void;
  /** Pop the last step from history (back navigation). */
  popStep: () => void;
  /** Legacy alias — updates currentStep without touching history. */
  setStep: (step: StepId) => void;
  /** @deprecated — variants are now assigned internally, not by user. */
  setVariant: (variant: JourneyVariant) => void;
  reset: () => void;
};

export const useJourneyStore = create<Store>((set) => ({
  journeyId: null,
  state: initialJourneyState,
  currentStep: "spheres",
  steps: ["spheres"],
  loaded: false,

  setJourney: (id, state, step) =>
    set({
      journeyId: id,
      state: { ...initialJourneyState, ...state },
      currentStep: step,
      steps: [step], // history starts fresh from restored position
      loaded: true,
    }),

  patch: (partial) =>
    set((s) => ({ state: { ...s.state, ...partial } })),

  pushStep: (step) =>
    set((s) => ({
      currentStep: step,
      steps: [...s.steps, step],
    })),

  popStep: () =>
    set((s) => {
      if (s.steps.length <= 1) return {};
      const newSteps = s.steps.slice(0, -1);
      return {
        currentStep: newSteps[newSteps.length - 1],
        steps: newSteps,
      };
    }),

  setStep: (step) => set({ currentStep: step }),

  setVariant: (variant) =>
    set((s) => ({ state: { ...s.state, journey_variant: variant } })),

  reset: () =>
    set({
      journeyId: null,
      state: initialJourneyState,
      currentStep: "spheres",
      steps: ["spheres"],
      loaded: false,
    }),
}));
