import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  muted: boolean;
  /** True when browser blocked unmuted autoplay and we forced mute */
  autoplayBlocked: boolean;
  setMuted: (v: boolean) => void;
  toggle: () => void;
  setAutoplayBlocked: (v: boolean) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      muted: false,
      autoplayBlocked: false,
      setMuted: (v) => set({ muted: v, autoplayBlocked: v ? get().autoplayBlocked : false }),
      toggle: () => {
        const next = !get().muted;
        set({ muted: next, autoplayBlocked: next ? get().autoplayBlocked : false });
      },
      setAutoplayBlocked: (v) => set({ autoplayBlocked: v }),
    }),
    {
      name: "eva-audio",
      partialize: (s) => ({ muted: s.muted }),
    },
  ),
);
