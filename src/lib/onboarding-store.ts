import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingDraft {
  intro_seen: boolean;
  disclaimer_seen: boolean;
  user_name: string;
  user_age: number | null;
  user_roles: string[];
  set: (partial: Partial<Omit<OnboardingDraft, "set" | "reset">>) => void;
  reset: () => void;
}

export const useOnboardingDraft = create<OnboardingDraft>()(
  persist(
    (set) => ({
      intro_seen: false,
      disclaimer_seen: false,
      user_name: "",
      user_age: null,
      user_roles: [],
      set: (partial) => set(partial),
      reset: () =>
        set({
          intro_seen: false,
          disclaimer_seen: false,
          user_name: "",
          user_age: null,
          user_roles: [],
        }),
    }),
    { name: "eva-onboarding-draft" },
  ),
);
