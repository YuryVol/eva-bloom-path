import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { useAudioStore } from "@/lib/audio-store";

export const Route = createFileRoute("/intro")({
  component: IntroScreen,
  head: () => ({ meta: [{ title: "ЕВА — добро пожаловать" }] }),
});

const FADE_DURATION = 0.9; // seconds for fade out near loop end

function IntroScreen() {
  const navigate = useNavigate();
  const { set } = useOnboardingDraft();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFinal, setShowFinal] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const muted = useAudioStore((s) => s.muted);
  const setMuted = useAudioStore((s) => s.setMuted);
  const setAutoplayBlocked = useAudioStore((s) => s.setAutoplayBlocked);

  // Sync video.muted with store
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.muted = muted;
  }, [muted]);

  // Try to autoplay with sound; fall back to muted if blocked
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(async () => {
      v.muted = true;
      setMuted(true);
      setAutoplayBlocked(true);
      try {
        await v.play();
      } catch {
        /* noop */
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    set({ intro_seen: true });
    navigate({ to: "/disclaimer" });
  };

  return (
    <main className="relative flex h-[100dvh] w-full items-end justify-center overflow-hidden bg-[#F9F4EE]">
      <video
        ref={videoRef}
        src="/assets/eva/intro.mp4"
        autoPlay
        playsInline
        loop
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!v.duration) return;
          if (v.currentTime / v.duration > 0.6 && !showFinal) {
            setShowFinal(true);
          }
          const remaining = v.duration - v.currentTime;
          if (remaining < FADE_DURATION) {
            setVideoOpacity(Math.max(0, remaining / FADE_DURATION));
          } else if (v.currentTime < FADE_DURATION) {
            setVideoOpacity(Math.min(1, v.currentTime / FADE_DURATION));
          } else {
            setVideoOpacity(1);
          }
        }}
        style={{ opacity: videoOpacity, transition: "opacity 120ms linear" }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-1.5 text-xs text-white backdrop-blur-md transition hover:bg-white/25"
      >
        Пропустить
      </button>

      <div className="relative z-10 mx-auto mb-10 w-full max-w-md px-6 text-center text-white">
        {!showFinal ? (
          <p className="animate-fade-in text-base leading-relaxed md:text-lg">
            Добро пожаловать в пространство, где можно ненадолго остановиться, услышать
            себя и сделать маленький шаг к внутреннему равновесию.
          </p>
        ) : (
          <div className="animate-fade-in">
            <p className="text-lg leading-relaxed md:text-xl">
              Меня зовут Ева.
              <br />
              Я помогу тебе бережно пройти путь к себе — без давления и спешки.
            </p>
            <div className="mt-7">
              <GlowButton onClick={handleNext}>Продолжить</GlowButton>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
