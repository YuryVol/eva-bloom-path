import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { type SphereId } from "@/lib/journey-types";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/somatic-work")({
  component: SomaticWorkScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";

const EXERCISES = [
  { id: "shake",  label: "Тряска",    desc: "Встань и мягко потряси тело 60 секунд.",             icon: "🫨", duration: 60 },
  { id: "butterfly", label: "Бабочка", desc: "Скрести руки на груди, постукивай попеременно.",     icon: "🦋", duration: 60 },
  { id: "wall",   label: "Стена",     desc: "Опрись на стену с силой — удерживай 30-60 секунд.",  icon: "🧱", duration: 60 },
];

function SomaticWorkScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [phase, setPhase] = useState<"locate" | "pick" | "timer" | "after">("locate");
  const [bodyScore, setBodyScore] = useState(5);
  const [exercise, setExercise] = useState<typeof EXERCISES[0] | null>(null);
  const [afterScore, setAfterScore] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [saving, setSaving] = useState(false);

  const startTimer = (ex: typeof EXERCISES[0]) => {
    setExercise(ex);
    setTimeLeft(ex.duration);
    setPhase("timer");
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          setPhase("after");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDone = async () => {
    if (!journeyId) return;
    setSaving(true);
    const delta = bodyScore - afterScore;
    const xpBonus = delta > 0 ? Math.min(delta * 2, 10) : 0;
    const next = {
      ...state,
      resistance_score_before: bodyScore,
      resistance_score_after: afterScore,
      xp: (state.xp || 0) + 5 + xpBonus,
      coins: (state.coins || 0) + (delta > 0 ? 3 : 1),
    };
    patch({ resistance_score_before: bodyScore, resistance_score_after: afterScore,
      xp: next.xp, coins: next.coins });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "somatic-work", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="somatic-work">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и тело" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Телесный путь</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Тело знает ответ</h1>
        </div>

        <AnimatePresence mode="wait">
          {phase === "locate" && (
            <motion.div key="locate" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Где в теле {a.ty} {a.oschuschajesh} эту сферу прямо сейчас?
                Грудь, живот, горло, плечи?
              </p>
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Интенсивность (0 — тихо, 10 — громко)</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={10} value={bodyScore}
                    onChange={(e) => setBodyScore(+e.target.value)}
                    className="w-full accent-primary" />
                  <span className="font-display text-2xl text-primary w-6">{bodyScore}</span>
                </div>
              </div>
              <div className="mt-6">
                <GlowButton onClick={() => setPhase("pick")}>
                  Продолжить
                </GlowButton>
              </div>
            </motion.div>
          )}

          {phase === "pick" && (
            <motion.div key="pick" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Выбери упражнение, которое сейчас откликается:
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {EXERCISES.map((ex) => (
                  <GlassCard
                    key={ex.id}
                    className="cursor-pointer p-4 transition-all"
                    onClick={() => startTimer(ex)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{ex.icon}</span>
                      <div>
                        <p className="font-medium">{ex.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ex.desc}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "timer" && exercise && (
            <motion.div key="timer" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">{exercise.desc}</p>
              <div className="relative flex size-28 items-center justify-center rounded-full border-4 border-primary/40">
                <span className="font-display text-5xl text-primary">{timeLeft}</span>
              </div>
              {timerRunning && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  Продолжай... {exercise.label.toLowerCase()}
                </p>
              )}
              {!timerRunning && (
                <GlowButton onClick={() => setPhase("after")}>Готово</GlowButton>
              )}
            </motion.div>
          )}

          {phase === "after" && (
            <motion.div key="after" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Как тело ощущается сейчас? Сравни с тем, что было до.
              </p>
              <div className="mt-5">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Интенсивность сейчас</p>
                <div className="flex items-center gap-3">
                  <input type="range" min={0} max={10} value={afterScore}
                    onChange={(e) => setAfterScore(+e.target.value)}
                    className="w-full accent-primary" />
                  <span className="font-display text-2xl text-primary w-6">{afterScore}</span>
                </div>
              </div>
              {bodyScore - afterScore > 0 && (
                <p className="mt-3 text-xs text-primary/80 italic">
                  Напряжение снизилось на {bodyScore - afterScore} — тело услышало тебя.
                </p>
              )}
              <div className="mt-6">
                <GlowButton onClick={handleDone} disabled={saving}>
                  {saving ? "сохраняю…" : "Продолжить"}
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </JourneyScene>
    </FadeTransition>
  );
}
