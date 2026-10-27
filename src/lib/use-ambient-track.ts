import { useEffect } from "react";
import { useAudioStore, type AmbientTrack } from "@/lib/audio-store";

/** Switches ambient track on mount, restores "forest" on unmount */
export function useAmbientTrack(track: AmbientTrack) {
  const setTrack = useAudioStore((s) => s.setTrack);
  useEffect(() => {
    setTrack(track);
    return () => setTrack("forest");
  }, [track, setTrack]);
}
