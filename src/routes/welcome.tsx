import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, useCallback } from "react";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { upsertOnboarding } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/welcome")({
  component: WelcomeScreen,
  head: () => ({ meta: [{ title: "Привет — ЕВА" }] }),
});

function WelcomeScreen() {
  const navigate = useNavigate();
  const save = useServerFn(upsertOnboarding);
  const { user_name } = useOnboardingDraft();
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleNext = async () => {
    try {
      await save({ data: { completed: true } });
    } catch {
      // ignore — navigation should still proceed
    }
    setShowVideo(true);
  };

  const handleVideoEnded = useCallback(() => {
    navigate({ to: "/journey/spheres" });
  }, [navigate]);

  const handleSkipVideo = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    navigate({ to: "/journey/spheres" });
  }, [navigate]);

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-stretch bg-[#F9F4EE]">
      <AnimatePresence>
        {showVideo && (
          <motion.div
            key="video-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F4EE]"
          >
            {/* Blurred background layer */}
            <video
              src="/assets/eva/to-spheres.mp4"
              autoPlay
              playsInline
              muted
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 brightness-75"
            />
            {/* Sharp foreground — fit to height */}
            <video
              ref={videoRef}
              src="/assets/eva/to-spheres.mp4"
              autoPlay
              playsInline
              muted
              onEnded={handleVideoEnded}
              className="relative z-10 h-full w-auto max-w-none mx-auto object-contain"
            />
            <button
              type="button"
              onClick={handleSkipVideo}
              className="absolute bottom-8 right-8 rounded-full bg-black/20 px-4 py-2 text-xs text-white/70 backdrop-blur-sm transition hover:bg-black/30 hover:text-white"
            >
              Пропустить
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative flex-1 bg-cover bg-left md:bg-center"
        style={{ backgroundImage: "url(/assets/eva/eva-platform.png)" }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#F9F4EE] to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-[#F9F4EE] px-6 pb-10 pt-4 text-center"
      >
        <div className="mx-auto max-w-md">
          {user_name && (
            <p className="font-display mb-3 text-3xl font-light italic text-foreground/80 md:text-4xl">
              {user_name},
            </p>
          )}
          <p className="text-sm leading-relaxed text-foreground md:text-lg">
            Иногда жизнь становится слишком шумной, и в этом шуме легко потерять контакт
            с собой.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-lg">
            Давай попробуем начать с маленького шага и создать пространство, в котором
            станет чуть спокойнее.
          </p>
          <div className="mt-6 flex justify-center">
            <GlowButton onClick={handleNext}>Давай</GlowButton>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
