import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { type SphereId } from "@/lib/journey-types";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/narrative-write")({
  component: NarrativeWriteScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";
const WRITE_SEC = 180; // 3 min

function NarrativeWriteScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [phase, setPhase] = useState<"write" | "word">("write");
  const [word, setWord] = useState("");
  const [timeLeft, setTimeLeft] = useState(WRITE_SEC);
  const [timerDone, setTimerDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state, narrative_word: word.trim() || undefined };
    patch({ narrative_word: word.trim() || undefined });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "narrative-write", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <FadeTransition k="narrative-write">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и слова" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Нарративный путь</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Написать и увидеть</h1>
        </div>

        <AnimatePresence mode="wait">
          {phase === "write" && (
            <motion.div key="write" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {a.napishi} о ситуации в этой сфере — 3 минуты, без остановки. Не исправляй, не думай.
                </p>
                <span className="ml-4 shrink-0 font-mono text-sm text-muted-foreground">
                  {mins}:{String(secs).padStart(2, "0")}
                </span>
              </div>
              <textarea
                rows={8}
                placeholder="Просто пиши..."
                className="mt-3 w-full resize-none rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
                onFocus={startTimer}
              />
              <div className="mt-4">
                <GlowButton onClick={() => { setPhase("word"); if (timerRef.current) clearInterval(timerRef.current); }}>
                  {timerDone ? "Продолжить" : "Я написала достаточно"}
                </GlowButton>
              </div>
            </motion.div>
          )}

          {phase === "word" && (
            <motion.div key="word" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Перечитай (или просто почувствуй). Какое одно слово описывает то, что ты написала?
              </p>
              <input
                type="text"
                maxLength={30}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Одно слово..."
                className="mt-4 w-full rounded-2xl border border-border/50 bg-card/40 px-5 py-3 text-sm placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
              />
              <div className="mt-5 flex flex-col gap-2">
                <GlowButton onClick={handleNext} disabled={saving}>
                  {saving ? "сохраняю…" : "Продолжить"}
                </GlowButton>
                {!word.trim() && (
                  <button type="button" onClick={handleNext}
                    className="text-xs text-muted-foreground/60 hover:text-muted-foreground hover:underline underline-offset-2">
                    Пропустить
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </JourneyScene>
    </FadeTransition>
  );
}
