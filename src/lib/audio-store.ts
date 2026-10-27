import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AmbientTrack = "forest" | "bowls";

interface AudioState {
  muted: boolean;
  autoplayBlocked: boolean;
  track: AmbientTrack;
  setMuted: (v: boolean) => void;
  toggle: () => void;
  setAutoplayBlocked: (v: boolean) => void;
  setTrack: (t: AmbientTrack) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      muted: false,
      autoplayBlocked: false,
      track: "forest",
      setMuted: (v) => set({ muted: v, autoplayBlocked: v ? get().autoplayBlocked : false }),
      toggle: () => {
        const next = !get().muted;
        set({ muted: next, autoplayBlocked: next ? get().autoplayBlocked : false });
      },
      setAutoplayBlocked: (v) => set({ autoplayBlocked: v }),
      setTrack: (t) => set({ track: t }),
    }),
    {
      name: "eva-audio",
      partialize: (s) => ({ muted: s.muted }),
    },
  ),
);
