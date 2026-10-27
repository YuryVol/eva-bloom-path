import { useEffect, useRef } from "react";
import { useAudioStore } from "@/lib/audio-store";

const VOLUME = 0.28;
const FADE_MS = 1400; // crossfade duration

function fadeTo(el: HTMLAudioElement, target: number, ms: number) {
  const steps = 30;
  const interval = ms / steps;
  const delta = (target - el.volume) / steps;
  let step = 0;
  const id = setInterval(() => {
    step++;
    el.volume = Math.max(0, Math.min(1, el.volume + delta));
    if (step >= steps) {
      clearInterval(id);
      el.volume = target;
      if (target === 0) el.pause();
    }
  }, interval);
  return id;
}

export function AmbientPlayer() {
  const muted = useAudioStore((s) => s.muted);
  const track = useAudioStore((s) => s.track);
  const setAutoplayBlocked = useAudioStore((s) => s.setAutoplayBlocked);

  const forestRef = useRef<HTMLAudioElement>(null);
  const bowlsRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);

  // Start playback after first user interaction (browser autoplay policy)
  useEffect(() => {
    const tryStart = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      // Read live store state — closure would capture stale values before persist hydration
      const { muted: currentMuted, track: currentTrack } = useAudioStore.getState();
      const active = currentTrack === "forest" ? forestRef.current : bowlsRef.current;
      if (!active || currentMuted) return;
      active.volume = 0;
      active.play()
        .then(() => fadeTo(active, VOLUME, FADE_MS))
        .catch(() => setAutoplayBlocked(true));
    };
    window.addEventListener("pointerdown", tryStart, { once: true });
    window.addEventListener("keydown", tryStart, { once: true });
    return () => {
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mute / unmute
  useEffect(() => {
    const forest = forestRef.current;
    const bowls = bowlsRef.current;
    if (!forest || !bowls || !startedRef.current) return;

    if (muted) {
      fadeTo(forest, 0, 600);
      fadeTo(bowls, 0, 600);
    } else {
      const active = track === "forest" ? forest : bowls;
      if (active.paused) {
        active.volume = 0;
        active.play().catch(() => {});
      }
      fadeTo(active, VOLUME, 600);
    }
  }, [muted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track switch with crossfade
  useEffect(() => {
    if (!startedRef.current || muted) return;
    const forest = forestRef.current;
    const bowls = bowlsRef.current;
    if (!forest || !bowls) return;

    if (track === "forest") {
      fadeTo(bowls, 0, FADE_MS);
      if (forest.paused) {
        forest.volume = 0;
        forest.play().catch(() => {});
      }
      fadeTo(forest, VOLUME, FADE_MS);
    } else {
      fadeTo(forest, 0, FADE_MS);
      if (bowls.paused) {
        bowls.volume = 0;
        bowls.play().catch(() => {});
      }
      fadeTo(bowls, VOLUME, FADE_MS);
    }
  }, [track]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <audio
        ref={forestRef}
        src="/assets/audio/forest-loop.wav"
        loop
        preload="auto"
        style={{ display: "none" }}
      />
      <audio
        ref={bowlsRef}
        src="/assets/audio/bowls-loop.wav"
        loop
        preload="auto"
        style={{ display: "none" }}
      />
    </>
  );
}
