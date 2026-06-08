import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AddressForm = "ты" | "вы";

interface OnboardingDraft {
  intro_seen: boolean;
  disclaimer_seen: boolean;
  user_name: string;
  user_age: number | null;
  user_roles: string[];
  address_form: AddressForm;
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
      address_form: "ты",
      set: (partial) => set(partial),
      reset: () =>
        set({
          intro_seen: false,
          disclaimer_seen: false,
          user_name: "",
          user_age: null,
          user_roles: [],
          address_form: "ты",
        }),
    }),
    { name: "eva-onboarding-draft" },
  ),
);
