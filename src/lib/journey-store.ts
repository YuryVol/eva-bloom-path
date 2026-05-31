import { create } from "zustand";
import { initialJourneyState, type JourneyState, type StepId } from "./journey-types";

type Store = {
  journeyId: string | null;
  state: JourneyState;
  currentStep: StepId;
  loaded: boolean;
  setJourney: (id: string, state: JourneyState, step: StepId) => void;
  patch: (partial: Partial<JourneyState>) => void;
  setStep: (step: StepId) => void;
  reset: () => void;
};

export const useJourneyStore = create<Store>((set) => ({
  journeyId: null,
  state: initialJourneyState,
  currentStep: "spheres",
  loaded: false,
  setJourney: (id, state, step) =>
    set({ journeyId: id, state: { ...initialJourneyState, ...state }, currentStep: step, loaded: true }),
  patch: (partial) => set((s) => ({ state: { ...s.state, ...partial } })),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({ journeyId: null, state: initialJourneyState, currentStep: "spheres", loaded: false }),
}));
