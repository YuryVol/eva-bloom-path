import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Bilateral audio stimulation using the Web Audio API.
 * Produces a soft tone that alternates left ↔ right every `intervalMs`.
 * No external audio files required.
 */

interface Props {
  /** Milliseconds between left/right switch (default 800) */
  intervalMs?: number;
  /** Tone frequency in Hz (default 440 = A4, soft and non-alarming) */
  frequency?: number;
  /** Tone duration as fraction of interval (default 0.5) */
  toneFraction?: number;
  onStart?: () => void;
  onStop?: () => void;
}

export function BilateralAudio({
  intervalMs = 800,
  frequency = 440,
  toneFraction = 0.5,
  onStart,
  onStop,
}: Props) {
  const [running, setRunning] = useState(false);
  const [side, setSide] = useState<"left" | "right">("left");
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sideRef = useRef<"left" | "right">("left");

  const playTone = useCallback(
    (audioSide: "left" | "right") => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();

      osc.frequency.value = frequency;
      osc.type = "sine";
      panner.pan.value = audioSide === "left" ? -0.9 : 0.9;

      const now = ctx.currentTime;
      const duration = (intervalMs / 1000) * toneFraction;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    },
    [frequency, intervalMs, toneFraction],
  );

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    ctxRef.current?.close();
    ctxRef.current = null;
    setRunning(false);
    onStop?.();
  }, [onStop]);

  const start = useCallback(() => {
    // Resume or create AudioContext (browsers require user gesture)
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }

    sideRef.current = "left";
    setSide("left");
    playTone("left");

    intervalRef.current = setInterval(() => {
      const next = sideRef.current === "left" ? "right" : "left";
      sideRef.current = next;
      setSide(next);
      playTone(next);
    }, intervalMs);

    setRunning(true);
    onStart?.();
  }, [intervalMs, playTone, onStart]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* visual indicator */}
      <div className="flex w-48 items-center justify-between">
        <div
          className={`h-8 w-8 rounded-full transition-all duration-200 ${
            running && side === "left"
              ? "scale-125 bg-primary shadow-[0_0_16px_oklch(0.74_0.13_70/0.6)]"
              : "bg-muted"
          }`}
        />
        <div className="h-0.5 flex-1 bg-border/40 mx-2" />
        <div
          className={`h-8 w-8 rounded-full transition-all duration-200 ${
            running && side === "right"
              ? "scale-125 bg-primary shadow-[0_0_16px_oklch(0.74_0.13_70/0.6)]"
              : "bg-muted"
          }`}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {running ? "Слушай в наушниках · следи за огнями" : "Рекомендуются наушники"}
      </p>

      <button
        type="button"
        onClick={running ? stop : start}
        className={`rounded-full px-8 py-3 text-sm font-medium transition hover:scale-105 ${
          running
            ? "border border-border/60 bg-card text-muted-foreground"
            : "bg-primary text-primary-foreground shadow-[0_8px_28px_oklch(0.74_0.13_70/0.4)]"
        }`}
      >
        {running ? "Остановить" : "Запустить"}
      </button>
    </div>
  );
}
