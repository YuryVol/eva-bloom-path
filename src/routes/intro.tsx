import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { useAudioStore } from "@/lib/audio-store";

// ─── Emergency services modal (kept here after disclaimer merge) ──────────────

const EMERGENCY_LINES = [
  {
    category: "Единый экстренный номер",
    items: [{ name: "Скорая, пожарные, полиция", number: "112" }],
  },
  {
    category: "Психологическая помощь",
    items: [
      { name: "Телефон доверия (бесплатно, круглосуточно)", number: "8-800-2000-122" },
      { name: "Кризисная линия психологической помощи", number: "8-800-100-49-94" },
    ],
  },
  {
    category: "Медицинская и социальная помощь",
    items: [
      { name: "Скорая медицинская помощь", number: "103" },
      { name: "Помощь при насилии (Национальный центр)", number: "8-800-7000-600" },
    ],
  },
];

function EmergencyModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mx-4 mb-4 w-full max-w-md rounded-3xl bg-[#F9F4EE] p-6 shadow-2xl sm:mb-0"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Экстренная помощь</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Все номера бесплатны и работают круглосуточно.
        </p>
        <div className="flex max-h-[55dvh] flex-col gap-4 overflow-y-auto pr-1">
          {EMERGENCY_LINES.map((section) => (
            <div key={section.category}>
              <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                {section.category}
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3"
                  >
                    <p className="text-xs leading-snug text-foreground/80">{item.name}</p>
                    <a
                      href={`tel:${item.number.replace(/\D/g, "")}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 font-display text-sm text-primary transition hover:bg-primary/20"
                    >
                      <Phone className="size-3" strokeWidth={2} />
                      {item.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground/70">
          Если вам плохо — вы не одна. Помощь есть, и вы заслуживаете её.
        </p>
      </motion.div>
    </motion.div>
  );
}

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
  const [showEmergency, setShowEmergency] = useState(false);
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
    set({ intro_seen: true, disclaimer_seen: true });
    navigate({ to: "/about-you" });
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
            <p className="mt-5 text-xs leading-relaxed text-white/50 max-w-xs mx-auto">
              Приложение не заменяет помощь психолога и не ставит диагнозы.
              При кризисе обратитесь, пожалуйста, в{" "}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowEmergency(true); }}
                className="underline underline-offset-2 text-white/70 hover:text-white transition"
              >
                экстренные службы
              </button>
              .
            </p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      </AnimatePresence>
    </main>
  );
}
